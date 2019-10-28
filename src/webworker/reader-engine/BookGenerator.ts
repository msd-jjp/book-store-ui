import { book, IBookPosIndicator, IBookContent } from "./MsdBook";
import { CmpUtility } from "../../component/_base/CmpUtility";

export class BookGenerator extends book {
    private _pageStorage: any = {};
    setToStorage(index: number, page: string): void {
        this._pageStorage[index] = page;
    }
    getFromStorage(index: number): string | undefined {
        return this._pageStorage[index];
    }

    private _allPages_pos: IBookPosIndicator[] | undefined;
    getAllPages_pos(): Array<IBookPosIndicator> {
        if (!this._allPages_pos) this._allPages_pos = this.getListOfPageIndicators();
        return this._allPages_pos;
    }
    getPage(index: number): string {
        let page = this.getFromStorage(index);
        if (!page) {
            const allPages_pos = this.getAllPages_pos();
            page = this.RenderSpecPage(allPages_pos[index]);
            this.setToStorage(index, page);
        }
        return page;
    }
    getPage_ifExist(index: number): string | undefined {
        let page = this.getFromStorage(index);
        return page;
    }
    getPage_with_storeAround(index: number, n: number): string {
        let page = this.getFromStorage(index);
        if (!page) {
            const allPages_pos = this.getAllPages_pos();
            page = this.RenderSpecPage(allPages_pos[index]);
            this.setToStorage(index, page);
            this.storeAround(index, n);
        }
        return page;
    }

    private async storeAround(pageIndex: number, n: number) {
        await CmpUtility.waitOnMe(0);
        this.get_n_pages_before_x(pageIndex, n);
        this.get_n_pages_after_x(pageIndex, n+1);
    }

    private _allChapters: IBookContent[] | undefined;
    getAllChapters(): Array<IBookContent> {
        if (!this._allChapters) this._allChapters = this.getContentList();
        return this._allChapters;
    }

    get_n_pages_before_x(x: number, n: number): string[] {
        let y = x - n;
        if (y <= 0) y = 0;
        let m = x - y;
        const allPages_pos = this.getAllPages_pos();
        const mPages = this.renderNPages(allPages_pos[y], m);

        for (let i = 0; i < mPages.length; i++) {
            this.setToStorage(y + i, mPages[i]);
        }

        return mPages;
    }
    /** get n pages from x, include x, first page is x.
     * @param x from x
     * @param n number of page include index x
     */
    get_n_pages_after_x(x: number, n: number): string[] {
        const allPages_pos = this.getAllPages_pos();
        const nPages = this.renderNPages(allPages_pos[x], n);

        for (let i = 0; i < nPages.length; i++) {
            this.setToStorage(x + i, nPages[i]);
        }

        return nPages;
    }



}