import Dexie from 'dexie';
import { TTextBook_data, TTextBook } from '../../webworker/reader-engine/storage/TextBookStorage';

// export interface IBook_page {
//     id?: number; // Primary key. Optional (autoincremented)
//     first: string; // First name
//     last: string; // Last name
// }

class IDB extends Dexie {
    bookPages: Dexie.Table<TTextBook_data & { page_id: string }, string>;

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

        this.bookPages = this.table("bookPages");
    }
}

export class IndexedStorage {
    private static idb = new IDB();
    // constructor() { }

    static bookPageId(data: TTextBook): string {
        const orig = data.isOriginalFile ? 'true' : 'false';
        const zoom = (data as any).zoom === undefined ? 'undefined' : (data as any).zoom;
        const page_id =
            data.book_id + '_' + orig + '_' + data.page_index + '_' + data.bookSize.width + '_' + data.bookSize.height + '_' + zoom;
        return page_id;
    }
    static async add_bookPage(data: TTextBook_data): Promise<void> {
        const page_id = IndexedStorage.bookPageId(data);
        await IndexedStorage.idb.bookPages.add({ ...data, page_id });
    }

    static async get_bookPage(opt: TTextBook): Promise<TTextBook_data | undefined> {
        return await IndexedStorage.idb.bookPages.get({ page_id: IndexedStorage.bookPageId(opt) });
    }

    static async delete_bookPage(opt: TTextBook): Promise<void> {
        // debugger;
        await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).delete();
        /* const csdv = await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).toArray();
        console.log('delete_bookPage', csdv);

        const csdv_2 = await IndexedStorage.idb.bookPages.where('page_id').equals(IndexedStorage.bookPageId(opt)).toArray();
        console.log('csdv_2', csdv_2); */
    }

    static async delete_bookAllPage(opt: TTextBook): Promise<void> {
        // debugger;
        // await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).delete();
        const primaryKeys = await IndexedStorage.idb.bookPages
            // .filter()
            // .where({ book_id: opt.book_id })
            .filter((r) => r.book_id === opt.book_id && r.isOriginalFile === opt.isOriginalFile)
            .primaryKeys();
        // .toArray();

        await IndexedStorage.idb.bookPages.bulkDelete(primaryKeys);
        /* const csdv = await IndexedStorage.idb.bookPages.where({ page_id: IndexedStorage.bookPageId(opt) }).toArray();
        console.log('delete_bookPage', csdv);

        const csdv_2 = await IndexedStorage.idb.bookPages.where('page_id').equals(IndexedStorage.bookPageId(opt)).toArray();
        console.log('csdv_2', csdv_2); */
    }

    static async get_bookAllPage_primaryKeys(opt: TTextBook): Promise<string[]> {
        const primaryKeys = await IndexedStorage.idb.bookPages.filter((r) => {
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



    // static add(): void {
    //     IndexedStorage.db.open();
    //     IndexedStorage.db.emails.add({ contactId: 111, type: 'typppp1', email: 'hrk@gmail.ocm' });
    //     IndexedStorage.db.phones.add({ contactId: 222, type: 'typppp2', phone: '02154663325' });
    // }

    // static getAllEmails(): Dexie.Promise<IEmailAddress[]> {
    //     return IndexedStorage.db.emails.toArray();
    // }

    // static getAllEmailsKeys(): Dexie.Promise<any[]> {
    //     return IndexedStorage.db.emails.orderBy('email').keys();
    // }

    // static async getFile(id: string): Dexie.Promise<IFile[]> {
    //     // await IndexedStorage.db.open();
    //     return IndexedStorage.db.file.filter((file: IFile) => {
    //         return id === file.id;
    //     }).toArray();
    // }

    // static addFile(fileObj: IFile): Dexie.Promise<number> {
    //     // IndexedStorage.db.open();
    //     return IndexedStorage.db.file.add(fileObj);
    // }
    // static deleteFile(fileId: string): Dexie.Promise<number> {
    //     // IndexedStorage.db.open();
    //     return IndexedStorage.db.file.where('id').equals(fileId).delete();
    // }
}
