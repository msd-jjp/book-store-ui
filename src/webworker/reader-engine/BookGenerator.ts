import { book, IBookPosIndicator, IBookContent } from "./MsdBook";
import { CmpUtility } from "../../component/_base/CmpUtility";

export class BookGenerator extends book {
    private _allPages: IBookPosIndicator[] | undefined;
    getAllPages(): Array<IBookPosIndicator> {
        if (!this._allPages) this._allPages = this.getListOfPageIndicators();
        return this._allPages;
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
        const allPages = this.getAllPages();
        const mPages = this.renderNPages(allPages[y], m);

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
        const allPages = this.getAllPages();
        const nPages = this.renderNPages(allPages[x], n);

        for (let i = 0; i < nPages.length; i++) {
            this.setToStorage(x + i, nPages[i]);
        }

        return nPages;
    }

    private _pageStorage: any = {};
    setToStorage(index: number, page: string): void {
        this._pageStorage[index] = page;
    }
    getFromStorage(index: number): string | undefined {
        return this._pageStorage[index];
    }

}