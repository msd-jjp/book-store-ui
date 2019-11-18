import { BookService } from "../../service/service.book";
import Axios, { CancelTokenSource, AxiosError } from "axios";
import { CmpUtility } from "../_base/CmpUtility";
import { appLocalStorage } from "../../service/appLocalStorage";

export class PartialDownload {
    private _bookService = new BookService();
    private currentRange: { from: number; to: number } | undefined;
    private downloadSize = 1000000;
    private cancelTokenSource: CancelTokenSource = Axios.CancelToken.source();
    private fileLength: number | undefined;
    private tempFile: Uint8Array | undefined;

    constructor(private book_id: string, private mainFile: boolean) {
    }

    async downloadFile() {
        return new Promise(async (resolve, reject) => {
            let error: AxiosError | undefined = undefined;
            let fl = await this.getFileLength().catch(e => {
                error = e;
            });
            debugger;
            //
            if (!this.fileLength || !fl) {
                reject(error);
                return;
            }
            const tempFile = await this.getFromTempStorage();
            console.log('tempFile:', tempFile);
            //
            debugger;
            const from = tempFile ? tempFile.byteLength : 0;
            const to = this.fileLength! <= this.downloadSize + from ? this.fileLength! : this.downloadSize + from;
            if (from >= to) {
                reject({ error: `file from: ${from}, to: ${to} not correct.` });
                return;
            }
            this.currentRange = { from: from, to };

            if (this.downloadCanceled) {
                reject({ error: `download canceled.` });
                return;
            }
            let res = await this.loopRange().catch(e => {
                error = e;
            });
            debugger;
            if (res) {
                resolve(true);
            } else {
                reject(error);
            }
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
                this.currentRange = { from: this.currentRange!.to, to };

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


    private async getFileLength() {
        return new Promise(async (resolve, reject) => {
            let error: AxiosError | undefined = undefined;
            let res = await this._bookService.bookFile_detail(this.book_id, this.mainFile).catch(e => {
                debugger;
                error = e;
            });
            if (!res) {
                reject(error);
                return;
            }
            this.fileLength = parseInt(res.headers['content-length']);
            debugger;
            resolve(true);
        });
    }

    private async downloadRangeRequest(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await CmpUtility.waitOnMe(2000);

            let downloaded = true;
            let error: AxiosError | undefined = undefined;
            let res = await this._bookService.bookFile_partial(
                this.book_id,
                this.mainFile,
                this.currentRange!,
                this.cancelTokenSource.token
            ).catch(e => {
                debugger;
                downloaded = false;
                error = e;
            });
            debugger;
            if (res) {
                console.log('downloaded range', this.currentRange, res.data);
                const saved = await this.saveInTempStorage(new Uint8Array(res.data), this.currentRange!.to);
                downloaded = saved;
            } else {
                downloaded = false;
            }
            // return downloaded ? true : error!;
            if (downloaded) resolve(true);
            else reject(error);
        });
    }

    private async saveInTempStorage(newFile: Uint8Array, to: number): Promise<boolean> {
        debugger;
        this.tempFile = new Uint8Array([...(this.tempFile as any || []), ...newFile as any]);
        return await appLocalStorage.storeBookFile(this.book_id, this.mainFile, this.tempFile, true);
    }

    private async getFromTempStorage(): Promise<Uint8Array | undefined> {
        this.tempFile = await appLocalStorage.findBookMainFileById(this.book_id, this.mainFile);
        return this.tempFile;
    }

    private async clearTempStorage(): Promise<boolean> {
        debugger;
        return await appLocalStorage.removeBookFileById(this.book_id, this.mainFile, true);
    }

    private async downloadCompleted(): Promise<boolean> {
        debugger;
        let save = false;
        if (this.tempFile)
            save = await appLocalStorage.storeBookFile(this.book_id, this.mainFile, this.tempFile);

        let cleared = false;
        if (save)
            cleared = await this.clearTempStorage();

        return cleared;
    }

}
