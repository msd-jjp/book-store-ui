import Dexie from 'dexie';
import { TTextBook_data, TTextBook } from '../../webworker/reader-engine/storage/TextBookStorage';

// export interface IBook_page {
//     id?: number; // Primary key. Optional (autoincremented)
//     first: string; // First name
//     last: string; // Last name
// }

class IDB extends Dexie {
    bookPages: Dexie.Table<TTextBook_data & { page_id: string }, number>;

    constructor() {
        super("I_Database");

        // console.log(this.verno, Math.round(this.verno + 1));

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
        // IndexedStorage.idb.bookPages.where('book_id',);
        // IndexedStorage.idb.bookPages.where(['book_id', 'bookSize']).equals(fileId).delete();

        /* const list = await IndexedStorage.idb.bookPages.filter((d: TTextBook_data) => {
            // return data.book_id === opt.book_id;
            return d.book_id === opt.book_id
                && d.isOriginalFile === opt.isOriginalFile
                && d.page_index === opt.page_index
                && d.bookSize.height === opt.bookSize.height
                && d.bookSize.width === opt.bookSize.width
        }).toArray();

        if (list && list.length) {
            return list[0];
        } */

        //         const vdsf = await IndexedStorage.idb.bookPages.get(opt, (d:TTextBook_data)=>{
        // return d.book_id===opt.book_id
        // && d.isOriginalFile === opt.isOriginalFile
        // && d.page_index === opt.page_index
        // && d.bookSize.height === opt.bookSize.height
        // && d.bookSize.width === opt.bookSize.width
        //         })
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
