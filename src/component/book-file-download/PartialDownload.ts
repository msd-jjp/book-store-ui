import { BookService } from "../../service/service.book";
import Axios, { CancelTokenSource, AxiosError, AxiosResponse } from "axios";
import { CmpUtility } from "../_base/CmpUtility";
import { appLocalStorage, IEtag } from "../../service/appLocalStorage";
import { Store2 } from "../../redux/store";
import { action_update_downloading_book_file } from "../../redux/action/downloading-book-file";
import { IDownloadingBookFile_schema } from "../../redux/action/downloading-book-file/downloadingBookFileAction";
import { ReaderEngineService } from "../../service/service.reader-engine";
import { READER_FILE_NAME } from "../../webworker/reader-engine/reader-download/reader-download";
import { FILE_STORAGE_KEY } from "../../service/appLocalStorage/FileStorage";

// export const partial_downloadSize = 100000;

export class PartialDownload {
    private _bookService = new BookService();
    private _readerEngineService = new ReaderEngineService();

    private currentRange: { from: number; to: number } | undefined;
    private readonly downloadSize = 100000; // partial_downloadSize; //
    private refreshViewOnUpdateInterval = 500;
    private cancelTokenSource: CancelTokenSource = Axios.CancelToken.source();
    private fileLength: number | undefined;
    // private tempFile: Uint8Array | undefined;
    private tempFile_length: number = 0;
    private current_eTag: IEtag | null;
    private new_eTag: IEtag | null = null;
    private book_file_url: string | undefined;

    constructor(private fileId: string, private collectionName: FILE_STORAGE_KEY) {
        this.current_eTag = appLocalStorage.find_eTagById(fileId);
    }

    private _keepViewUpdate_timer: any;
    private keepViewUpdate() {
        if (this._keepViewUpdate_timer) return;
        this._keepViewUpdate_timer = setTimeout(() => {
            this._keepViewUpdate_timer = undefined;
            CmpUtility.refreshView();
        }, this.refreshViewOnUpdateInterval);
    }

    async downloadFile() {
        return new Promise(async (resolve, reject) => {
            debugger;
            let error: AxiosError | undefined = undefined;
            let fl = await this.getFileLength().catch(e => {
                error = e;
            });

            if (!fl) {
                reject(error);
                return;
            }

            if (!this.fileLength) {
                reject('file_length_problem');
                return;
            }

            const { item: dbf_item } = this.get_dbf_obj();
            if (!(dbf_item && dbf_item.size && dbf_item.size === this.fileLength)) {
                this.updateDownloadSize();
            }

            // this.tempFile = await this.getFromTempStorage();
            this.tempFile_length = await this.getTempFile_length();

            if (!this.new_eTag) {
                const ended = await this.downloadEnded();
                reject({ error: `file new_eTag no value, ended: ${ended}` });
                return;
            }

            // if (this.tempFile) {
            if (this.tempFile_length) {
                if (!this.current_eTag || this.current_eTag.eTag !== this.new_eTag.eTag) {
                    debugger;
                    const ended = await this.downloadEnded();
                    reject({ error: `file eTag not match, new, old: , ${this.current_eTag}, ${this.new_eTag}, ended: ${ended}` });
                    return;
                }
            } else {
                /**
                 * probebly first try to download.
                 * note: here no temp file found:
                 * do not reject here
                 * to prevent rejecting in get requerst --> if not match set equal.
                 */
                this.current_eTag = { ...this.new_eTag };
            }

            // const from = this.tempFile ? this.tempFile.byteLength : 0;
            const from = this.tempFile_length === 0 ? 0 : this.tempFile_length;
            // this.tempFile_length === this.fileLength ?
            //     this.tempFile_length :
            //     this.tempFile_length + 1; // + 1;
            const to = this.fileLength! <= this.downloadSize + from ? this.fileLength! : this.downloadSize + from - 1;
            // if (from >= to) {
            if (from > to) {
                const ended = await this.downloadEnded();
                reject({ error: `file from: ${from}, to: ${to} not correct. ended downloadEnded ${ended}` });
                return;
            }
            // else if()
            this.currentRange = { from: from, to };

            if (this.downloadCanceled) {
                reject({ error: `download canceled.` });
                return;
            }
            let res = await this.loopRange().catch(e => {
                error = e;
            });

            if (res) {
                resolve(true);
            } else {
                reject(error);
            }
        });
    }

    private downloadCanceled = false;
    async cancelDownloadFile(): Promise<boolean> {
        this.cancelTokenSource.cancel('download-canceled');
        this.downloadCanceled = true;
        const ended = await this.downloadEnded();
        return ended;
    }

    private async loopRange(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.downloadCanceled) {
                resolve(true);
                return;
            }
            if (this.currentRange!.from >= this.fileLength!) {
                await this.downloadCompleted();
                resolve(true);
                return;
            }

            let error: AxiosError | undefined = undefined;
            const res = await this.downloadRangeRequest().catch(e => {
                error = e;
            });
            if (res) {

                const to = this.fileLength! <= this.currentRange!.to + this.downloadSize
                    ? this.fileLength!
                    : this.currentRange!.to + this.downloadSize; // -1;
                this.currentRange = { from: this.currentRange!.to + 1, to };

                let l_res = await this.loopRange().catch(e => {
                    error = e;
                });
                if (l_res) {
                    resolve(true);
                } else {
                    reject(error);
                }
            } else {
                reject(error);
            }
        });
    }

    private async getFileLength(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let error: AxiosError | undefined = undefined;

            let req;
            if (this.collectionName === FILE_STORAGE_KEY.READER_ENGINE) {
                req = this._readerEngineService.file_detail(this.fileId as READER_FILE_NAME);
            } else if (
                this.collectionName === FILE_STORAGE_KEY.FILE_BOOK_MAIN || this.collectionName === FILE_STORAGE_KEY.FILE_BOOK_SAMPLE
            ) {
                let user_id;
                const user = Store2.getState().logged_in_user;
                if (user) user_id = user.id;
                if (!user_id) {
                    reject('not_logged_in');
                    return;
                }
                const _deviceKey = Store2.getState().device_key.deviceKey;
                if (!_deviceKey) {
                    reject('device_key_not_found');
                    return;
                }
                let prepareError;
                const prepare = await this._bookService.prepare_book(this.fileId, _deviceKey.id).catch(e => {
                    prepareError = e;
                });
                if (!prepare) {
                    reject(prepareError);
                    return;
                }
                // debugger;
                this.book_file_url = this.collectionName === FILE_STORAGE_KEY.FILE_BOOK_MAIN ? prepare.data.Original : prepare.data.Brief;
                req = this._bookService.get_file_info(this.book_file_url);
            }

            if (!req) {
                reject('request not valid: none of engine & book');
                return;
            }

            let res = await req.catch(e => {
                error = e;
                debugger;
            });
            // debugger;
            if (!res) {
                reject(error);
                return;
            }
            this.fileLength = parseInt(res.headers['content-length']);

            this.store_new_eTag(res.headers['etag']);

            resolve(true);
        });
    }

    private async downloadRangeRequest(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let downloaded = true;
            let error: AxiosError | undefined = undefined;

            let req;
            if (this.collectionName === FILE_STORAGE_KEY.READER_ENGINE) {
                req = this._readerEngineService.file_partial(this.fileId as READER_FILE_NAME, this.currentRange!, this.cancelTokenSource.token);
            } else if (
                this.collectionName === FILE_STORAGE_KEY.FILE_BOOK_MAIN ||
                this.collectionName === FILE_STORAGE_KEY.FILE_BOOK_SAMPLE
            ) {
                if (!this.book_file_url) {
                    reject('this.book_file_url not found');
                    return;
                }
                req = this._bookService.get_file_partial(this.book_file_url, this.currentRange!, this.cancelTokenSource.token);
            }

            if (!req) {
                reject('request not valid: none of engine & book');
                return;
            }

            let res = await req.catch(e => {
                downloaded = false;
                error = e;
                // debugger;
                console.warn('downloadRangeRequest', e);
            });
            // debugger;

            if (res) {

                this.store_new_eTag((res as AxiosResponse).headers['etag']);

                if (!this.current_eTag || this.current_eTag.eTag !== this.new_eTag!.eTag) {
                    debugger;
                    const ended = await this.downloadEnded();
                    reject({ error: `file eTag not match, new, old: , ${this.current_eTag}, ${this.new_eTag}, ended: ${ended}` });
                    return;
                }

                const saved = await this.saveInTempStorage(new Uint8Array(res.data));
                downloaded = saved;
                this.updateDownloadingProgress();
            } else {
                downloaded = false;
            }
            if (downloaded) resolve(true);
            else reject(error);
        });
    }

    private store_new_eTag(eTag: string) {
        this.new_eTag = { id: this.fileId, eTag: eTag };
        appLocalStorage.store_eTag(this.new_eTag);
    }

    private async saveInTempStorage(newFile: Uint8Array): Promise<boolean> {
        /* let cu = this.tempFile ? this.tempFile.byteLength : 0;
        let nu = newFile.byteLength;
        const arr = new Uint8Array(cu + nu);
        if (this.tempFile && this.tempFile.length) {
            for (let i = 0; i < this.tempFile.byteLength; i++) {
                arr[i] = this.tempFile[i];
            }
        }
        for (let i = 0; i < newFile.byteLength; i++) {
            arr[cu + i] = newFile[i];
        }
        this.tempFile = arr;
        return await appLocalStorage.saveFileById((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId, this.tempFile); */
        return await appLocalStorage.saveFileById_partial((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId, newFile);
    }

    private async getFromTempStorage(): Promise<Uint8Array | undefined> {
        return await appLocalStorage.getFileById((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId);
    }

    private async getTempFile_length(): Promise<number> {
        return await appLocalStorage.getFileById_partial_length((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId);
    }

    private async clearTempStorage(): Promise<boolean> {
        // todo mozila bug
        /** mozila bug: save empty file before remove */
        // let cleared = await appLocalStorage.saveFileById((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId, new Uint8Array(0));
        // cleared = await appLocalStorage.removeFileById((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId);

        // // console.log('clearTempStorage', cleared, this.fileId);
        // return cleared;

        return await appLocalStorage.removeFileById_partial((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId);
    }

    private async downloadCompleted(): Promise<boolean> {
        let save = false;
        // if (this.tempFile)
        // save = await appLocalStorage.saveFileById(this.collectionName, this.fileId, this.tempFile);
        save = await appLocalStorage.saveFileById_concatPartial((this.collectionName + '_PARTIAL' as FILE_STORAGE_KEY), this.fileId);

        // let ended = false;
        if (save) {
            appLocalStorage.store_creationDate({ id: this.fileId, date: new Date().getTime() });
            // ended = await this.downloadEnded();
        }

        // return ended;
        return save;
    }

    private async downloadEnded(): Promise<boolean> {
        // this.tempFile = undefined;
        const cleared = await this.clearTempStorage();
        return cleared;
    }

    private updateDownloadingProgress() {
        const { list: dbf, item } = this.get_dbf_obj();
        if (item && this.currentRange && this.fileLength) {
            item.progress = Math.floor((this.currentRange.to / this.fileLength) * 100);
        }
        Store2.dispatch(action_update_downloading_book_file(dbf));
        this.keepViewUpdate();
    }

    private updateDownloadSize() {
        const { list: dbf, item } = this.get_dbf_obj();
        if (item && this.fileLength) {
            item.size = this.fileLength;
        }
        Store2.dispatch(action_update_downloading_book_file(dbf));
        this.keepViewUpdate();
    }

    private get_dbf_obj(): { list: IDownloadingBookFile_schema[]; item: IDownloadingBookFile_schema | undefined; } {
        const list = [...Store2.getState().downloading_book_file];
        const item = list.find(d => (d.fileId === this.fileId && d.collectionName === this.collectionName));
        return { list, item };
    }

}
