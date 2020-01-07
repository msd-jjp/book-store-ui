import Dexie from 'dexie';
import { TTextBook_data, TTextBook } from '../../webworker/reader-engine/storage/TextBookStorage';

// export interface IBook_page {
//     id?: number; // Primary key. Optional (autoincremented)
//     first: string; // First name
//     last: string; // Last name
// }

class IDB extends Dexie {
    // bookPages: Dexie.Table<TTextBook_data & { page_id: string, modification_date: number }, string>;
    bookPages_original: Dexie.Table<TTextBook_data & { page_id: string, modification_date: number }, string>;
    bookPages_sample: Dexie.Table<TTextBook_data & { page_id: string, modification_date: number }, string>;

    constructor() {
        super("I_Database");

        // console.log(this.verno, Math.round(this.verno + 1));
        // (window as any).gholi = this;
        // console.log(this, this.verno, (window as any).gholi.verno);

        // this.version(1).stores({
        //     bookPages: 'book_id',
        // });
        // this.delete();
        // this.version(1).stores({
        //     bookPages: '++id, page_id',
        // });
        // this.version(2).stores({
        //     bookPages: 'page_id',
        // });
        // this.version(3).stores({
        //     // projects: "++id,client,project,start,end",
        //     bookPages: 'page_id',
        // })
        // this.version(4).stores({
        //     // projects: "++id,client,project,start,end",
        //     bookPages: 'page_id',
        // }).upgrade(async () => {
        //     console.log(this);
        //     alert(this.verno);
        //     await this.delete();
        // });
        this.version(1).stores({
            bookPages: 'page_id',
        });
        this.version(2).stores({
            bookPages: 'page_id, modification_date',
        });
        this.version(3).stores({
            bookPages: 'page_id, modification_date',
        });
        this.version(4).stores({
            bookPages_original: 'page_id, modification_date',
            bookPages_sample: 'page_id, modification_date',
        }).upgrade(async () => {
            debugger;
            await this.delete();
            await this.open();
        });

        // this.bookPages = this.table("bookPages");
        this.bookPages_original = this.table("bookPages_original");
        this.bookPages_sample = this.table("bookPages_sample");
    }
}

export class IndexedStorage {
    private static idb = new IDB();
    // constructor() { }

    private static bookPageId(data: TTextBook): string {
        const orig = data.isOriginalFile ? 'true' : 'false';
        const zoom = (data as any).zoom === undefined ? 'undefined' : (data as any).zoom;
        const page_id =
            data.book_id + '_' + orig + '_' + data.page_index + '_' + data.bookSize.width + '_' + data.bookSize.height + '_' + zoom;
        return page_id;
    }
    static async add_bookPage(data: TTextBook_data): Promise<void> {
        const page_id = IndexedStorage.bookPageId(data);
        const modification_date = new Date().getTime();
        // await IndexedStorage.idb.bookPages.add({ ...data, page_id, modification_date });
        let bookTable: Dexie.Table<any, string>;
        if (data.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        await bookTable.add({ ...data, page_id, modification_date });
    }
    static async put_bookPage(data: TTextBook_data): Promise<void> {
        const page_id = IndexedStorage.bookPageId(data);
        const modification_date = new Date().getTime();
        // await IndexedStorage.idb.bookPages.put({ ...data, page_id, modification_date });
        let bookTable: Dexie.Table<any, string>;
        if (data.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        await bookTable.put({ ...data, page_id, modification_date });
    }

    static async get_bookPage(opt: TTextBook): Promise<TTextBook_data | undefined> {
        // return await IndexedStorage.idb.bookPages.get({ page_id: IndexedStorage.bookPageId(opt) });
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        return await bookTable.get({ page_id: IndexedStorage.bookPageId(opt) });
    }

    static async update_bookPage_modification_date(opt: TTextBook): Promise<void> {
        // await IndexedStorage.idb.bookPages.update(IndexedStorage.bookPageId(opt), { modification_date: new Date().getTime() });
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        await bookTable.update(IndexedStorage.bookPageId(opt), { modification_date: new Date().getTime() });
    }

    static async get_bookPage_and_update_modification_date(opt: TTextBook): Promise<TTextBook_data | undefined> {
        // return await IndexedStorage.idb.bookPages.get({ page_id: IndexedStorage.bookPageId(opt) });
        let data;
        console.log('1', opt.page_index);
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        await IndexedStorage.idb.transaction('rw', bookTable, async () => {
            data = await bookTable.get({ page_id: IndexedStorage.bookPageId(opt) });
            console.log('2', opt.page_index);
            if (data) {
                await bookTable.update(
                    IndexedStorage.bookPageId(opt),
                    { modification_date: new Date().getTime() }
                );
                // await bookTable.put()
            }
        }).catch(err => {
            console.error('Transaction Failed', err, err.stack);
        });
        console.log('3', opt.page_index);
        return data;
    }

    static async delete_bookPage(opt: TTextBook): Promise<void> {
        // debugger;
        // await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).delete();
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        await bookTable.where({ page_id: IndexedStorage.bookPageId(opt) }).delete();

        /* const csdv = await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).toArray();
        console.log('delete_bookPage', csdv);

        const csdv_2 = await IndexedStorage.idb.bookPages.where('page_id').equals(IndexedStorage.bookPageId(opt)).toArray();
        console.log('csdv_2', csdv_2); */
    }

    static async delete_bookAllPage_DELETE_ME(opt: TTextBook): Promise<void> {
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        const primaryKeys = await bookTable
            .filter((r) => r.book_id === opt.book_id && r.isOriginalFile === opt.isOriginalFile)
            .primaryKeys();

        await bookTable.bulkDelete(primaryKeys);
    }

    static async delete_bookAllPage(book_id_s: string | string[], isOriginalFile: boolean): Promise<void> {
        let bookTable: Dexie.Table<any, string>;
        if (isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        let primaryKeys;

        if (Array.isArray(book_id_s)) {
            primaryKeys = await bookTable
                .filter((r) => book_id_s.includes(r.book_id) && r.isOriginalFile === isOriginalFile)
                .primaryKeys();
        } else {
            primaryKeys = await bookTable
                .filter((r) => r.book_id === book_id_s && r.isOriginalFile === isOriginalFile)
                .primaryKeys();
        }

        await bookTable.bulkDelete(primaryKeys);
    }

    static async get_bookAllPage_primaryKeys(opt: TTextBook): Promise<string[]> {
        let bookTable: Dexie.Table<any, string>;
        if (opt.isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        const primaryKeys = await bookTable.filter((r) => {
            let z = true;
            if (opt.hasOwnProperty('zoom')) z = (opt as any).zoom === (r as any).zoom;
            return r.book_id === opt.book_id
                && r.isOriginalFile === opt.isOriginalFile
                && r.bookSize.width === opt.bookSize.width
                && r.bookSize.height === opt.bookSize.height
                && z
        }).primaryKeys();

        return primaryKeys;
    }

    static async get_bookPages_count(isOriginalFile: boolean): Promise<number> {
        let bookTable: Dexie.Table<any, string>;
        if (isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        // const aa = await bookTable.orderBy('modification_date').reverse().offset(3).toArray();
        // console.log(aa);

        return await bookTable.count();
    }

    private static remove_old_bookPages_progress = false;
    /**
     * @param offset: record count to keep
     * @param isOriginalFile: book original file or sample file
     */
    static async remove_old_bookPages(offset: number, isOriginalFile: boolean): Promise<void> {
        if (IndexedStorage.remove_old_bookPages_progress) return;
        IndexedStorage.remove_old_bookPages_progress = true;

        let bookTable: Dexie.Table<any, string>;
        if (isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }

        await bookTable
            .orderBy('modification_date').reverse().offset(offset)
            .delete();

        IndexedStorage.remove_old_bookPages_progress = false;
    }

    static async clear_bookPages(isOriginalFile: boolean): Promise<void> {
        let bookTable: Dexie.Table<any, string>;
        if (isOriginalFile) { bookTable = IndexedStorage.idb.bookPages_original; }
        else { bookTable = IndexedStorage.idb.bookPages_sample; }
        await bookTable.clear();
    }

}
