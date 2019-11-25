import { BookService } from "../../service/service.book";
import Axios, { CancelTokenSource, AxiosError } from "axios";
import { CmpUtility } from "../_base/CmpUtility";
import { appLocalStorage } from "../../service/appLocalStorage";
import { Store2 } from "../../redux/store";
import { action_update_downloading_book_file } from "../../redux/action/downloading-book-file";
import { IDownloadingBookFile_schema } from "../../redux/action/downloading-book-file/downloadingBookFileAction";
import { ReaderEngineService } from "../../service/service.reader-engine";
import { READER_FILE_NAME } from "../../webworker/reader-engine/reader-download/reader-download";

export class PartialDownload {
    private _bookService = new BookService();
    private _readerEngineService = new ReaderEngineService();

    private currentRange: { from: number; to: number } | undefined;
    private downloadSize = 100000;
    private refreshViewOnUpdateInterval = 500;
    private cancelTokenSource: CancelTokenSource = Axios.CancelToken.source();
    private fileLength: number | undefined;
    private tempFile: Uint8Array | undefined;

    constructor(private book_id: string, private mainFile: boolean) {
        // this.keepViewUpdate();
    }

    private _keepViewUpdate_timer: any;
    private keepViewUpdate() {
        if (this._keepViewUpdate_timer) return;
        this._keepViewUpdate_timer = setTimeout(() => {
            /* console.log(
                `PartialDownload keepViewUpdate every ${this.refreshViewOnUpdateInterval}ms if changed. book_id`,
                this.book_id
            ); */
            this._keepViewUpdate_timer = undefined;
            CmpUtility.refreshView();
        }, this.refreshViewOnUpdateInterval);
    }

    // private downloadFileEnded = false;
    async downloadFile() {
        return new Promise(async (resolve, reject) => {
            let error: AxiosError | undefined = undefined;
            let fl = await this.getFileLength().catch(e => {
                error = e;
            });

            // todo: if fl && !this.fileLength prevent download again.
            if (!this.fileLength || !fl) {
                reject(error);
                // this.downloadFileEnded = true;
                // console.error('this.downloadFileEnded = true; book_id 48', this.book_id);
                return;
            }

            /** check if file changed */
            // const dbf = [...Store2.getState().downloading_book_file];
            // const dbf_item = dbf.find(d => (d.book_id === this.book_id && d.mainFile === this.mainFile));
            const { item: dbf_item } = this.get_dbf_obj();
            if (dbf_item && dbf_item.size) {
                if (this.fileLength !== dbf_item.size) {
                    const ended = await this.downloadEnded();
                    reject({ error: `fileLength not match, new, old: , ${this.fileLength}, ${dbf_item.size}, ended: ${ended}` });
                    return;
                }
            } else {
                this.updateDownloadSize();
            }

            // const tempFile = await this.getFromTempStorage();
            this.tempFile = await this.getFromTempStorage();
            // console.log('book_id, tempFile: ', this.book_id, tempFile);

            const from = this.tempFile ? this.tempFile.byteLength : 0;
            const to = this.fileLength! <= this.downloadSize + from ? this.fileLength! : this.downloadSize + from;
            if (from >= to) {
                const ended = await this.downloadEnded();
                reject({ error: `file from: ${from}, to: ${to} not correct. ended downloadEnded ${ended}` });
                // this.downloadFileEnded = true;
                // console.error('this.downloadFileEnded = true; book_id 59', this.book_id);
                return;
            }
            this.currentRange = { from: from, to };

            if (this.downloadCanceled) {
                reject({ error: `download canceled.` });
                // this.downloadFileEnded = true;
                // console.error('this.downloadFileEnded = true; book_id 67', this.book_id);
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
            // this.downloadFileEnded = true;
            // console.error('this.downloadFileEnded = true; book_id 80', this.book_id);
        });
    }

    private downloadCanceled = false;
    async cancelDownloadFile(): Promise<boolean> {
        this.cancelTokenSource.cancel('download-canceled');
        this.downloadCanceled = true;
        // await this.clearTempStorage();
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
                    : this.currentRange!.to + this.downloadSize;
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

            let req; //  = this._bookService.bookFile_detail(this.book_id, this.mainFile);
            if (this.book_id === READER_FILE_NAME.WASM_BOOK_ID) {
                req = this._readerEngineService.file_detail(READER_FILE_NAME.WASM_BOOK_ID);
            } else if (this.book_id === READER_FILE_NAME.READER2_BOOK_ID) {
                req = this._readerEngineService.file_detail(READER_FILE_NAME.READER2_BOOK_ID);
            } else {
                req = this._bookService.bookFile_detail(this.book_id, this.mainFile);
            }

            let res = await req.catch(e => {
                error = e;
            });
            if (!res) {
                reject(error);
                return;
            }
            this.fileLength = parseInt(res.headers['content-length']);
            resolve(true);
        });
    }

    private async downloadRangeRequest(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            // await CmpUtility.waitOnMe(2000);

            let downloaded = true;
            let error: AxiosError | undefined = undefined;

            let req; // = this._bookService.bookFile_partial(this.book_id, this.mainFile, this.currentRange!, this.cancelTokenSource.token);
            if (this.book_id === READER_FILE_NAME.WASM_BOOK_ID) {
                req = this._readerEngineService.file_partial(READER_FILE_NAME.WASM_BOOK_ID, this.currentRange!, this.cancelTokenSource.token);
            } else if (this.book_id === READER_FILE_NAME.READER2_BOOK_ID) {
                req = this._readerEngineService.file_partial(READER_FILE_NAME.READER2_BOOK_ID, this.currentRange!, this.cancelTokenSource.token);
            } else {
                req = this._bookService.bookFile_partial(this.book_id, this.mainFile, this.currentRange!, this.cancelTokenSource.token);
            }

            let res = await req.catch(e => {
                downloaded = false;
                error = e;
            });

            if (res) {
                //todo: check file changed??? --> check ETag with loki
                // const size = parseInt((res as any).headers['content-length']);
                // console.log('size: ', size);

                const saved = await this.saveInTempStorage(new Uint8Array(res.data));
                // console.log('downloaded range, book_id', this.book_id, this.currentRange, res.data);
                downloaded = saved;
                this.updateDownloadingProgress();
            } else {
                downloaded = false;
            }
            if (downloaded) resolve(true);
            else reject(error);
        });
    }

    private async saveInTempStorage(newFile: Uint8Array): Promise<boolean> {
        // debugger;
        let cu = this.tempFile ? this.tempFile.byteLength : 0;
        let nu = newFile.byteLength;
        const arr = new Uint8Array(cu + nu);
        if (this.tempFile && this.tempFile.length) {
            for (let i = 0; i < this.tempFile.byteLength; i++) {
                // arr.push(this.tempFile[i]);
                arr[i] = this.tempFile[i];
            }
        }
        for (let i = 0; i < newFile.byteLength; i++) {
            // arr.push(newFile[i]);
            arr[cu + i] = newFile[i];
        }
        // this.tempFile = new Uint8Array([...(this.tempFile as any || []), ...newFile as any]);
        this.tempFile = arr; // new Uint8Array(arr);
        return await appLocalStorage.storeBookFile(this.book_id, this.mainFile, this.tempFile, true);
    }

    private async getFromTempStorage(): Promise<Uint8Array | undefined> {
        // this.tempFile = await appLocalStorage.findBookMainFileById(this.book_id, this.mainFile);
        // return this.tempFile;
        return await appLocalStorage.findBookMainFileById(this.book_id, this.mainFile);
    }

    private async clearTempStorage(): Promise<boolean> {
        // console.time('clearTempStorage_2*2000');
        // await CmpUtility.waitOnMe(500);
        //todo: _DELETE_ME
        let cleared = await appLocalStorage.storeBookFile(this.book_id, this.mainFile, new Uint8Array(0), true);
        cleared = await appLocalStorage.removeBookFileById(this.book_id, this.mainFile, true);
        // await CmpUtility.waitOnMe(500);
        /* const exist = await this.getFromTempStorage();
        if (exist) {
            console.error('not deleted tring again', exist);
            // await CmpUtility.waitOnMe(1000);
            // cleared = await appLocalStorage.removeBookFileById(this.book_id, this.mainFile, true);
            cleared = await appLocalStorage.storeBookFile(this.book_id, this.mainFile, new Uint8Array(0), true);
            console.error('not deleted tring again set', cleared);
            // cleared = await appLocalStorage.removeBookFileById(this.book_id, this.mainFile, true);
            // console.error('not deleted tring again remove', cleared);
        } else {
            console.error(' deleted successfuly....', exist);
        } */
        // await CmpUtility.waitOnMe(500);
        // console.timeEnd('clearTempStorage_2*2000');
        console.error('clearTempStorage', cleared, this.book_id);
        return cleared;
    }

    private async downloadCompleted(): Promise<boolean> {
        let save = false;
        if (this.tempFile)
            save = await appLocalStorage.storeBookFile(this.book_id, this.mainFile, this.tempFile);

        // let cleared = false;
        let ended = false;
        if (save) {
            // cleared = await this.clearTempStorage();
            ended = await this.downloadEnded();
        }

        return ended;
    }

    private async downloadEnded(): Promise<boolean> {
        this.tempFile = undefined;
        const cleared = await this.clearTempStorage();
        // this.tempFile = undefined;
        return cleared;
    }

    private updateDownloadingProgress() {
        // const dbf = [...Store2.getState().downloading_book_file];
        // const item = dbf.find(d => (d.book_id === this.book_id && d.mainFile === this.mainFile));
        const { list: dbf, item } = this.get_dbf_obj();
        if (item && this.currentRange && this.fileLength) {
            item.progress = Math.floor((this.currentRange.to / this.fileLength) * 100);
        }
        Store2.dispatch(action_update_downloading_book_file(dbf));
        this.keepViewUpdate();
    }

    private updateDownloadSize() {
        // const dbf = [...Store2.getState().downloading_book_file];
        // const item = dbf.find(d => (d.book_id === this.book_id && d.mainFile === this.mainFile));
        const { list: dbf, item } = this.get_dbf_obj();
        if (item && this.fileLength) {
            item.size = this.fileLength;
        }
        Store2.dispatch(action_update_downloading_book_file(dbf));
        this.keepViewUpdate();
    }

    private get_dbf_obj(): { list: IDownloadingBookFile_schema[]; item: IDownloadingBookFile_schema | undefined; } {
        const list = [...Store2.getState().downloading_book_file];
        const item = list.find(d => (d.book_id === this.book_id && d.mainFile === this.mainFile));
        return { list, item };
    }

}
