import { IndexedStorage } from "../../../service/appLocalStorage/IndexedStorage";

interface ITextStore_page {
    book_id: string;
    isOriginalFile: boolean;
    page_index: number;
    bookSize: { width: number; height: number; };
}

interface ITextStore_page_msd extends ITextStore_page {
    // format: BOOK_TYPES.Msd;
}

interface ITextStore_page_doc extends ITextStore_page {
    // format: BOOK_TYPES.Epub | BOOK_TYPES.Pdf;
    zoom: number;
}

export type TTextBook = ITextStore_page_msd | ITextStore_page_doc;
export type TTextBook_data = (ITextStore_page_msd | ITextStore_page_doc) & { page: string };

export class TextBookStorage {

    static async getPage(opt: TTextBook): Promise<string | undefined> {
        const found = await IndexedStorage.get_bookPage(opt);

        // IndexedStorage.get_allPageExist(opt);

        if (found) return found.page;
        return;
    }

    static async setPage(data: TTextBook_data): Promise<void> {
        await IndexedStorage.add_bookPage(data);
    }

}
