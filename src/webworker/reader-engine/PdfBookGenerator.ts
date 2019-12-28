import { IBookPosIndicator, WasmWorkerHandler } from "./MsdBook";
import { TextBookGenerator } from "./TextBookGenerator";
import { Store2 } from "../../redux/store";

export class PdfBookGenerator extends TextBookGenerator {

    private _allPages_pos: IBookPosIndicator[] | undefined;
    async getAllPages_pos(): Promise<Array<IBookPosIndicator>> {
        if (!this._allPages_pos) {
            const pageCount = await this.getPageCount();
            const list: IBookPosIndicator[] = [];
            for (let i = 0; i < pageCount; i++) {
                list.push({
                    group: i, atom: 0
                });
            }
            this._allPages_pos = list;
        }
        return this._allPages_pos;
    }
    private _document_zoom: number | undefined;
    getZoom(): number {
        if (!this._document_zoom) {
            this._document_zoom = Store2.getState().reader.epub.zoom || 100;
        }
        return this._document_zoom;
    }
    async getPage(index: number): Promise<string | undefined> {

        let page = await this.getFromStorage(index, this.getZoom());
        if (!page) {
            console.log(`page by index: ${index} not found`);
            try {
                page = await this.renderDocPage(index, this.getZoom());
            } catch (e) {
                console.log(`getPage(${index}: number, ${this.getZoom()} = 100)`, e);
                throw e;
            }
            if (!page) return;
            this.setToStorage(index, page, this.getZoom());
        }
        return page;
    }

    /**
     * if page not exist it will store around.
     */
    // async getPage_with_storeAround(index: number, n: number/* , zoom = 100 */): Promise<string | undefined> {
    //     let page = await this.getFromStorage(index, this.getZoom());
    //     if (!page) {
    //         try {
    //             page = await this.renderDocPage(index, this.getZoom());
    //         } catch (e) {
    //             console.log(`getPage_with_storeAround(${index}: number, ${this.getZoom()} = 100)`, e);
    //             throw e;
    //         }
    //         if (!page) return;
    //         this.setToStorage(index, page, this.getZoom());
    //         this.storeAround(index, n);
    //     }
    //     return page;
    // }

    static async getInstace(
        book_id: string,
        isOriginalFile: boolean,
        wasmWorker: WasmWorkerHandler, bookbuf: Uint8Array, screenWidth: number,
        screenHeight: number, font: Uint8Array, fontSize: number,
        textFColor: number, textBColor: number): Promise<PdfBookGenerator> {
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
        let rtn = new PdfBookGenerator(
            book_id, isOriginalFile,
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