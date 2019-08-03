import loki, {
    Collection, /* LokiFsAdapter, */ LokiLocalStorageAdapter/* , persistenceAdapters */
    /* ,LokiIndexedAdapter */
} from 'lokijs'
import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { BOOK_ROLES } from '../../enum/Book';

type TCollectionName = 'clc_book' | 'clc_comment';
type TCollectionData = IBook | IComment;

export class appLocalStorage {
    static model_collection_map = {

    };

    // static vsdv = new LokiIndexedAdapter();
    // static idbAdapter2 = new LokiIndexedAdapter('DATABASETEST');
    // idbAdapter = new LokiIndexedAdapter('loki');
    static idbAdapter = new LokiLocalStorageAdapter();
    // static vdfvf = persistenceAdapters;

    static app_db = new loki('bookstore.db', {
        /* autoload: true,
        autosave: true,
        // adapter: new adapter(),
        adapter: new LokiFsAdapter(),
        autosaveInterval: 10000,
        autoloadCallback: appLocalStorage.initDB, */

        // adapter: persistenceAdapters.fs,
        adapter: appLocalStorage.idbAdapter,
        // autoload: true,
        // autoloadCallback: appLocalStorage.initDB,
        autosave: true,
        autosaveInterval: 4000
    });
    // app_db.save
    static clc_book: Collection<IBook>; // = appLocalStorage.app_db.addCollection('clc_book');
    static clc_comment: Collection<IComment>; // = appLocalStorage.app_db.addCollection('clc_comment');
    constructor() {
        appLocalStorage.app_db.loadDatabase({}, (err: any) => {
            // debugger;
        })
        appLocalStorage.initDB();
    }

    static initDB() {
        // debugger;
        // let coll_list: TCollectionName[] = ['clc_book', 'clc_comment'];
        // coll_list.forEach(coll => {
        //     if (appLocalStorage.app_db.getCollection(coll) === null) {
        //         appLocalStorage[coll] = appLocalStorage.app_db.addCollection(coll)
        //     }
        // });

        /* appLocalStorage.clc_book = (appLocalStorage.app_db.getCollection('clc_book') === null) ?
            appLocalStorage.app_db.addCollection('clc_book') :
            appLocalStorage.app_db.getCollection('clc_book');

        appLocalStorage.clc_comment = (appLocalStorage.app_db.getCollection('clc_comment') === null) ?
            appLocalStorage.app_db.addCollection('clc_comment') :
            appLocalStorage.app_db.getCollection('clc_comment'); */

        // let coll_list: TCollectionName[] = ['clc_book', 'clc_comment'];
        // coll_list.forEach((coll: TCollectionName) => {
        //     if (this.app_db.getCollection(coll)) {
        //         this[coll] = this.app_db.getCollection(coll);
        //     } else {
        //         this[coll] = this.app_db.addCollection(coll);
        //     }
        // });

        if (this.app_db.getCollection('clc_book')) {
            this.clc_book = this.app_db.getCollection('clc_book');
        } else {
            this.clc_book = this.app_db.addCollection('clc_book');
        }

        if (this.app_db.getCollection('clc_comment')) {
            this.clc_comment = this.app_db.getCollection('clc_comment');
        } else {
            this.clc_comment = this.app_db.addCollection('clc_comment');
        }

    }

    static clearCollection(collectionName: TCollectionName) {
        appLocalStorage[collectionName].clear();
    }

    static removeFromCollection(collectionName: TCollectionName, id_s: string | string[]) {
        if (Array.isArray(id_s)) {
            id_s.forEach(id => {
                appLocalStorage[collectionName].findAndRemove({ id: id });
            });
        } else {
            appLocalStorage[collectionName].findAndRemove({ id: id_s });
        }
    }

    static resetDB() {
        // appLocalStorage.app_db.removeCollection;
        let coll_list: TCollectionName[] = ['clc_book', 'clc_comment'];
        coll_list.forEach((coll: TCollectionName) => {
            appLocalStorage.clearCollection(coll);
        });
    }

    static storeUsefullResponse(response: AxiosResponse<any>) {
        if (response.config.url === "/api/books/_search" || response.config.url === "/api/books/search-phrase") {
            // debugger;
            // if (response.config.data) {
            //     // let data = JSON.parse(response.config.data);
            // }
            appLocalStorage.addDataToCollection('clc_book', response.data.result);

        } else if (response.config.url
            && response.config.url.includes('/api/books/')
            && response.config.method === "get") {

            // debugger;
            appLocalStorage.addDataToCollection('clc_book', response.data);
        }
        else if (response.config.url && response.config.url.includes('/api/comments/book/')) {
            appLocalStorage.addDataToCollection('clc_comment', response.data.result);
        }
    }

    static addDataToCollection(collectionName: TCollectionName, data: TCollectionData[] | TCollectionData) {
        // appLocalStorage.books.insert([{ name: 'Thor', rate: 1 }, { name: 'Loki', rate: 2 }]);
        let coll: Collection<any> = appLocalStorage[collectionName];

        //todo: only update found one : here we search twice if found.
        if (Array.isArray(data)) {
            data.forEach(obj => {
                let found = coll.findOne({ id: obj.id });
                if (found) {
                    // coll.autoupdate
                    coll.findAndUpdate({ id: obj.id }, oldObj => {
                        // debugger;
                        return obj;
                    });
                } else {
                    // debugger;
                    coll.insert(obj);
                }
            })
        } else {
            let found = coll.findOne({ id: data.id });
            if (found) {
                coll.findAndUpdate({ id: data.id }, oldObj => {
                    // debugger;
                    return data;
                });
            } else {
                // debugger;
                coll.insert(data);
            }
        }


        // coll.insert(data);
    }

    // static findById<TCollectionData>(collectionName: TCollectionName, id: string):TCollectionData |null{
    static findById(collectionName: TCollectionName, id: string): any {
        return appLocalStorage[collectionName].findOne({ id: id });
        // appLocalStorage.books.find({ $eq: { id: bookId } });
    }

    /* _DELETE_ME **/
    static search_by_query(
        collectionName: TCollectionName,
        searchData: { limit: number, offset: number, filter?: Object }
    ): any {
        // let lcl_book: IBook | null = appLocalStorage.findById('clc_book', bookId);
        return appLocalStorage[collectionName].chain()
            // .find({'Age': {'$gt':20}})
            .where((obj: any) => {
                if (searchData.filter && collectionName === 'clc_book') {
                    return appLocalStorage.search_by_query_book_filter(obj, searchData);

                }
                /* else if (searchData.filter && collectionName === 'clc_comment') {
                    return appLocalStorage.search_by_query_filter_comment(obj, searchData);
                } */
                return false;
                // return obj.id === 0
                // return obj; // .Country.indexOf('FR') === 0;
            })
            .simplesort('creation_date')//, false
            .offset(searchData.offset)
            .limit(searchData.limit)
            .data();
    }

    static search_by_query_book(
        searchPayload: { limit: number, offset: number, filter?: Object }
    ): IBook[] {
        return appLocalStorage.clc_book.chain()
            .where((book: IBook) => {
                if (searchPayload.filter) {
                    return appLocalStorage.search_by_query_book_filter(book, searchPayload);
                }
                return false;
            })
            // .simplesort('creation_date', false)//, false
            .sort(appLocalStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

    static search_by_query_book_filter(
        book: IBook, searchData: { limit: number, offset: number, filter?: Object }
    ): boolean {
        // let book: IBook = { ...book };
        let filter: any = { ...searchData.filter };
        if (filter.tag) {
            return !!(book.tags && book.tags.includes(filter.tag));

        } else if (filter.genre) {
            return book.genre.includes(filter.genre);

        } else if (filter.writer) { // todo: && filter.book_id
            if (filter.book_id) {
                if (book.id === filter.book_id) {
                    return false;
                }
            }
            let hasThisWriter = false;
            let writers = book.roles.filter(r => r.role === BOOK_ROLES.Writer);
            for (let i = 0; i < writers.length; i++) {
                if (writers[i].person.id === filter.writer) {
                    hasThisWriter = true;
                    break;
                }
            }
            return hasThisWriter;
        } else {
            return false;
        }
    }

    static search_by_query_comment(
        book_id: string, searchPayload: { limit: number, offset: number, filter?: Object }
    ): IComment[] {
        return appLocalStorage.clc_comment.chain()
            .where((comment: IComment) => {
                return comment.book_id === book_id;
            })
            // .simplesort('creation_date')//, false
            .sort(appLocalStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

    static asc_sort_creation_date(obj1: TCollectionData, obj2: TCollectionData): number {
        if (obj1.creation_date === obj2.creation_date) return 0;
        if (obj1.creation_date > obj2.creation_date) return -1;
        if (obj1.creation_date < obj2.creation_date) return 1;
        return 0;
    }

    static search_by_phrase_book(
        searchPayload: { limit: number, offset: number, filter: { search_phrase: string } }
    ): IBook[] {
        return appLocalStorage.clc_book.chain()
            .find({ title: { '$contains': searchPayload.filter.search_phrase } })
            // .where((book: IBook) => {
            //     return book.title.includes(searchPayload.filter.search_phrase);
            //     // return false;
            // })
            .sort(appLocalStorage.asc_sort_creation_date)
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

}