import { book, IBookPosIndicator, IBookContent } from "./MsdBook";
import { CmpUtility } from "../../component/_base/CmpUtility";

export class PdfBookGenerator extends book {
    private _pageStorage: any = {};
    setToStorage(index: number, page: string): void {
        this._pageStorage[index] = page;
    }
    getFromStorage(index: number): string | undefined {
        return this._pageStorage[index];
    }

    private _allPages_pos: IBookPosIndicator[] | undefined;
    getAllPages_pos(): Array<IBookPosIndicator> {
        if (!this._allPages_pos) {
            const pageCount = this.getPageCount();
            const list: IBookPosIndicator[] = [];
            for (let i = 0; i < pageCount; i++) {
                list.push({
                    group: i, atom: 0
                });
            }
            this._allPages_pos = list; // this.getListOfPageIndicators();
        }
        return this._allPages_pos;
    }
    getPage(index: number, zoom = 100): string {
        let page = this.getFromStorage(index);
        if (!page) {
            // const allPages_pos = this.getAllPages_pos();
            // page = this.RenderSpecPage(allPages_pos[index]);
            page = this.renderDocPage(index, zoom);
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
    getPage_with_storeAround(index: number, n: number, zoom = 100): string {
        let page = this.getFromStorage(index);
        if (!page) {
            // const allPages_pos = this.getAllPages_pos();
            // page = this.RenderSpecPage(allPages_pos[index]);
            page = this.renderDocPage(index, zoom);
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
    getAllChapters(): Array<IBookContent> {
        if (!this._allChapters) this._allChapters = this.getContentList();
        return this._allChapters;
    }

    private store_n_pages_before_x(x: number, n: number): void {
        for (let i = x - 1; i >= x - n && i >= 0; i--) {
            this.getPage(i);
        }
    }
    private store_n_pages_after_x(x: number, n: number): void {
        const allPages_pos = this.getAllPages_pos();
        for (let i = x + 1; i < allPages_pos.length && i <= x + n; i++) {
            this.getPage(i);
        }
    }

}