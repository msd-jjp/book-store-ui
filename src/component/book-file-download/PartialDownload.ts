import { BookService } from "../../service/service.book";
import Axios, { CancelTokenSource } from "axios";
import { CmpUtility } from "../_base/CmpUtility";

export class PartialDownload {
    private _bookService = new BookService();
    private currentRange: { from: number; to: number } | undefined;
    private downloadSize = 1000000;
    private cancelTokenSource: CancelTokenSource = Axios.CancelToken.source();

    constructor(private book_id: string, private mainFile: boolean) {
    }

    async downloadFile() {
        await this.getFileLength();
        debugger;
        //
        const tempFile = await this.getFromTempStorage();
        console.log('tempFile:', tempFile);
        //
        if (!this.fileLength) return;
        debugger;
        const to = this.fileLength! <= this.downloadSize ? this.fileLength! : this.downloadSize;
        const from = tempFile ? tempFile.to : 0;
        if (from >= to) return;
        this.currentRange = { from: from, to };

        await this.loopRange();

    }

    private downloadCanceled = false;
    cancelDownloadFile() {
        this.cancelTokenSource.cancel('download-canceled');
        this.downloadCanceled = true;
    }

    private async loopRange() {
        if (this.downloadCanceled) return;
        if (this.currentRange!.from >= this.fileLength!) return;

        const res = await this.downloadRangeRequest();
        if (res) {
            // if (this.currentRange!.from === this.fileLength) return;

            const to = this.fileLength! <= this.currentRange!.to + this.downloadSize
                ? this.fileLength!
                : this.currentRange!.to + this.downloadSize;
            this.currentRange = { from: this.currentRange!.to, to };

            await this.loopRange();
        }
    }

    private fileLength: number | undefined;
    private async getFileLength() {
        let res = await this._bookService.bookFile_detail(this.book_id, this.mainFile).catch(e => {
            debugger;
        });
        // console.log(vdfbg);
        if (!res) return;
        this.fileLength = parseInt(res.headers['content-length']);
        debugger;
    }

    private async downloadRangeRequest(): Promise<boolean> {
        debugger;
        await CmpUtility.waitOnMe(1000);
        let downloaded = true;
        let res = await this._bookService.bookFile_partial(
            this.book_id,
            this.mainFile,
            this.currentRange!,
            this.cancelTokenSource.token
        ).catch(e => {
            debugger;
            downloaded = false;
        });
        debugger;
        if (res) {
            console.log(this.currentRange, res.data);
            const saved = await this.saveInTempStorage(new Uint8Array(res.data), this.currentRange!.to);
            downloaded = saved;
        } else {
            downloaded = false;
        }
        return downloaded;
    }

    private async saveInTempStorage(file: Uint8Array, to: number): Promise<boolean> {
        debugger;
        // book_id, mainFile, to, total 
        return true;
    }

    private async getFromTempStorage(): Promise<{ file: Uint8Array, to: number } | undefined> {
        const obj: any = { file: null, to: 2000000 };
        return obj;
    }


}
