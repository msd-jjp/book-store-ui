import { book, IBookPosIndicator, IBookContent } from "./MsdBook";
import { CmpUtility } from "../../component/_base/CmpUtility";

export abstract class TextBookGenerator extends book {
    private _pageStorage: any = {};
    protected setToStorage(index: number, page: string): void {
        this._pageStorage[index] = page;
    }
    protected getFromStorage(index: number): string | undefined {
        return this._pageStorage[index];
    }

    abstract async getAllPages_pos(): Promise<Array<IBookPosIndicator>>;
    
    abstract async getPage(...args: any): Promise<string | undefined>;

    getPage_ifExist(index: number): string | undefined {
        let page = this.getFromStorage(index);
        return page;
    }

    abstract async getPage_with_storeAround(...args: any): Promise<string | undefined>;

    protected async storeAround(pageIndex: number, n: number) {
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

}
