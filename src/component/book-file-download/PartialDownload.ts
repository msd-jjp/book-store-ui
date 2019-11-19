import { BookService } from "../../service/service.book";
import Axios, { CancelTokenSource, AxiosError } from "axios";
import { CmpUtility } from "../_base/CmpUtility";
import { appLocalStorage } from "../../service/appLocalStorage";
import { Store2 } from "../../redux/store";
import { action_update_downloading_book_file } from "../../redux/action/downloading-book-file";

export class PartialDownload {
    private _bookService = new BookService();
    private currentRange: { from: number; to: number } | undefined;
    private downloadSize = 100000;
    private refreshViewOnUpdateInterval = 500;
    private cancelTokenSource: CancelTokenSource = Axios.CancelToken.source();
    private fileLength: number | undefined;
    private tempFile: Uint8Array | undefined;

    constructor(private book_id: string, private mainFile: boolean) {
        // this.keepViewUpdate();
    }

    /* keepViewUpdate__() {
        setTimeout(() => {
            if (!this.downloadCanceled && !this.downloadFileEnded && this.downloadingProgressUpdated) {
                this.downloadingProgressUpdated = false;
                console.error('PartialDownload keepViewUpdate every 1s if changed.');
                CmpUtility.refreshView();
                this.keepViewUpdate();
            } else {
                console.error(
                    'PartialDownload keepViewUpdate puased: cancel, end, update',
                    this.downloadCanceled,
                    this.downloadFileEnded,
                    this.downloadingProgressUpdated,
                    this.book_id
                );
            }
        }, 1000);
    } */
    private _keepViewUpdate_timer: any;
    private keepViewUpdate() {
        if (this._keepViewUpdate_timer) return;
        this._keepViewUpdate_timer = setTimeout(() => {
            console.log(`PartialDownload keepViewUpdate every ${this.refreshViewOnUpdateInterval}ms if changed.`);
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

            if (!this.fileLength || !fl) {
                reject(error);
                // this.downloadFileEnded = true;
                // console.error('this.downloadFileEnded = true; book_id 48', this.book_id);
                return;
            }
            const tempFile = await this.getFromTempStorage();
            // console.log('book_id, tempFile: ', this.book_id, tempFile);

            const from = tempFile ? tempFile.byteLength : 0;
            const to = this.fileLength! <= this.downloadSize + from ? this.fileLength! : this.downloadSize + from;
            if (from >= to) {
                reject({ error: `file from: ${from}, to: ${to} not correct.` });
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
    async cancelDownloadFile() {
        this.cancelTokenSource.cancel('download-canceled');
        this.downloadCanceled = true;
        await this.clearTempStorage();
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
            let res = await this._bookService.bookFile_detail(this.book_id, this.mainFile).catch(e => {
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
            let res = await this._bookService.bookFile_partial(
                this.book_id,
                this.mainFile,
                this.currentRange!,
                this.cancelTokenSource.token
            ).catch(e => {
                downloaded = false;
                error = e;
            });

            if (res) {
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
        this.tempFile = await appLocalStorage.findBookMainFileById(this.book_id, this.mainFile);
        return this.tempFile;
    }

    private async clearTempStorage(): Promise<boolean> {
        return await appLocalStorage.removeBookFileById(this.book_id, this.mainFile, true);
    }

    private async downloadCompleted(): Promise<boolean> {
        let save = false;
        if (this.tempFile)
            save = await appLocalStorage.storeBookFile(this.book_id, this.mainFile, this.tempFile);

        let cleared = false;
        if (save)
            cleared = await this.clearTempStorage();

        return cleared;
    }

    // private downloadingProgressUpdated = false;
    private updateDownloadingProgress() {
        const dbf = [...Store2.getState().downloading_book_file];
        const item = dbf.find(d => (d.book_id === this.book_id && d.mainFile === this.mainFile));
        // debugger;
        if (item && this.currentRange && this.fileLength) {
            item.progress = Math.floor((this.currentRange.to / this.fileLength) * 100);
        }
        Store2.dispatch(action_update_downloading_book_file(dbf));
        // this.downloadingProgressUpdated = true;
        this.keepViewUpdate();
    }

}
