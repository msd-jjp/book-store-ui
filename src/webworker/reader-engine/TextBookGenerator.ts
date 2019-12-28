import { book, IBookPosIndicator, IBookContent, WasmWorkerHandler } from "./MsdBook";
import { TextBookStorage } from "./storage/TextBookStorage";
// import { CmpUtility } from "../../component/_base/CmpUtility";
// import { Utility } from "../../asset/script/utility";

export abstract class TextBookGenerator extends book {
    protected bookSize: { width: number; height: number; };

    constructor(
        protected book_id: string, protected isOriginalFile: boolean,
        wasmWorker: WasmWorkerHandler, screenWidth: number, screenHeight: number,
        font: Uint8Array, fontSize: number, textFColor: number, textBColor: number
    ) {
        super(wasmWorker, screenWidth, screenHeight,
            font, fontSize, textFColor, textBColor);

        this.bookSize = { width: screenWidth, height: screenHeight };
    }

    // private _pageStorage: any = {};
    protected async setToStorage(index: number, page: string, zoom?: number): Promise<void> {
        // this._pageStorage[index] = page;
        await TextBookStorage.setPage({
            book_id: this.book_id,
            isOriginalFile: this.isOriginalFile,
            page_index: index,
            zoom,
            page,
            bookSize: this.bookSize
        });
    }
    protected async getFromStorage(index: number, zoom?: number): Promise<string | undefined> {
        return await TextBookStorage.getPage({
            book_id: this.book_id,
            isOriginalFile: this.isOriginalFile,
            page_index: index,
            zoom,
            bookSize: this.bookSize
        });
        // return undefined;
        // return this._pageStorage[index];
    }

    abstract async getAllPages_pos(): Promise<Array<IBookPosIndicator>>;

    abstract async getPage(...args: any): Promise<string | undefined>;

    // async 
    /* getPage_ifExist(index: number): string | undefined {
        let page = this.getFromStorage(index);
        return page;
    } */
    /* async db_getPage_ifExist(index: number): Promise<string | undefined> {
        // Utility.waitOnMe(10);
        let page = this.getFromStorage(index);
        return page;
    } */

    // abstract async getPage_with_storeAround(...args: any): Promise<string | undefined>;

    /* protected async storeAround(pageIndex: number, n: number) {
        // await CmpUtility.waitOnMe(0);
        this.store_n_pages_before_x(pageIndex, n);
        this.store_n_pages_after_x(pageIndex, n);
    } */

    private _allChapters: IBookContent[] | undefined;
    async getAllChapters(): Promise<Array<IBookContent>> {
        if (!this._allChapters) this._allChapters = await this.getContentList();
        return this._allChapters;
    }

    /* private _store_n_pages_progress: number[] = [];
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
    } */

}
