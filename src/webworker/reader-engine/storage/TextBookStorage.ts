// import { BOOK_TYPES } from '../../../enum/Book';

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

type TTextBook = ITextStore_page_msd | ITextStore_page_doc;
type TTextBook_data = (ITextStore_page_msd | ITextStore_page_doc) & { page: string };

export class TextBookStorage {

    private static _storage: TTextBook_data[] = [];

    static async getPage(opt: TTextBook): Promise<string | undefined> {
        console.log('getPage', opt);
        const found = TextBookStorage._storage.find(
            d => d.book_id === opt.book_id
                && d.isOriginalFile === opt.isOriginalFile
                && d.page_index === opt.page_index
                && d.bookSize.height === opt.bookSize.height
                && d.bookSize.width === opt.bookSize.width
        );
        if (found) return found.page;
        return;
    }

    static async setPage(data: TTextBook_data): Promise<void> {
        console.log('setPage', data);
        TextBookStorage._storage.push(data);
        return;
    }

}
