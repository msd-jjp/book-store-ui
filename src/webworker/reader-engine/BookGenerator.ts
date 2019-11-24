import { book, IBookPosIndicator, IBookContent, WasmWorkerHandler } from "./MsdBook";
import { CmpUtility } from "../../component/_base/CmpUtility";

export class BookGenerator extends book {
    private _pageStorage: any = {};
    private setToStorage(index: number, page: string): void {
        this._pageStorage[index] = page;
    }
    private getFromStorage(index: number): string | undefined {
        return this._pageStorage[index];
    }

    private _allPages_pos: IBookPosIndicator[] | undefined;
    async getAllPages_pos(): Promise<Array<IBookPosIndicator>> {
        if (!this._allPages_pos) this._allPages_pos = await this.getListOfPageIndicators();
        return this._allPages_pos;
    }
    async getPage(index: number): Promise<string> {
        let page = this.getFromStorage(index);
        if (!page) {
            const allPages_pos = await this.getAllPages_pos();
            page = await this.RenderSpecPage(allPages_pos[index]);
            this.setToStorage(index, page);
        }
        return page;
    }
    getPage_ifExist(index: number): string | undefined {
        let page = this.getFromStorage(index);
        return page;
    }

    /**
     * if page not exist it will store around.
     */
    async getPage_with_storeAround(index: number, n: number): Promise<string> {
        let page = this.getFromStorage(index);
        if (!page) {
            const allPages_pos = await this.getAllPages_pos();
            page = await this.RenderSpecPage(allPages_pos[index]);
            this.setToStorage(index, page);
            this.storeAround(index, n);
        }
        return page;
    }

    private async storeAround(pageIndex: number, n: number) {
        await CmpUtility.waitOnMe(0);
        this.store_n_pages_before_x(pageIndex, n);
        this.store_n_pages_after_x(pageIndex, n);
    }

    private _allChapters: IBookContent[] | undefined;
    async getAllChapters(): Promise<Array<IBookContent>> {
        if (!this._allChapters) this._allChapters = await this.getContentList();
        return this._allChapters;
    }

    private _store_n_pages_progress: number[] = [];
    private store_n_pages_before_x(x: number, n: number): void {
        for (let i = x - 1; i >= x - n && i >= 0; i--) {
            if (this._store_n_pages_progress.includes(i)) return;
            this._store_n_pages_progress[i] = i;
            this.getPage(i);
        }
    }
    private async store_n_pages_after_x(x: number, n: number): Promise<void> {
        const allPages_pos = await this.getAllPages_pos();
        for (let i = x + 1; i < allPages_pos.length && i <= x + n; i++) {
            if (this._store_n_pages_progress.includes(i)) return;
            this._store_n_pages_progress[i] = i;
            this.getPage(i);
        }
    }

    static async getInstace(
        wasmWorker: WasmWorkerHandler, bookbuf: Uint8Array, screenWidth: number,
        screenHeight: number, font: Uint8Array, fontSize: number,
        textFColor: number, textBColor: number): Promise<BookGenerator> {
        let fontHeapPtr = await wasmWorker.copyBufferToHeap(font);
        let rendererFormatPtr = await wasmWorker.getRendererFormat(
            textFColor, textBColor, textFColor, textBColor, fontSize, fontHeapPtr,
            font.length);
        // debugger;
        let bookheapPtr = await wasmWorker.copyBufferToHeap(bookbuf);
        let bookPtr = await wasmWorker.getBookFromBuf(bookheapPtr, bookbuf.length);
        await wasmWorker.freeHeap(bookheapPtr);  // free heap from bin buffer;

        let bookRendererPtr = await wasmWorker.getBookRenderer(
            bookPtr, rendererFormatPtr, screenWidth, screenHeight);
        let bookIndicatorPtr = await wasmWorker.initBookIndicator();
        let currentBookPosIndicator =
            await wasmWorker.BookNextPart(bookPtr, bookIndicatorPtr);
        await wasmWorker.deleteBookPosIndicator(bookIndicatorPtr);
        let rtn = new BookGenerator(
            wasmWorker, screenWidth, screenHeight, font, fontSize, textFColor,
            textBColor);
        rtn.bookPtr = bookPtr;
        rtn.bookRendererPtr = bookRendererPtr;
        rtn.fontHeapPtr = fontHeapPtr;
        rtn.rendererFormatPtr = rendererFormatPtr;
        rtn.currentBookPosIndicator = currentBookPosIndicator;
        return rtn;
    }

}
