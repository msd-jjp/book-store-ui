import { IBookPosIndicator, WasmWorkerHandler } from "./MsdBook";
import { TextBookGenerator } from "./TextBookGenerator";

export class BookGenerator extends TextBookGenerator {

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
