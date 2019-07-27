import loki, { Collection, /* LokiFsAdapter, */ LokiLocalStorageAdapter/* , persistenceAdapters */ } from 'lokijs'
import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { BOOK_ROLES } from '../../enum/Book';

type TCollectionName = 'clc_book' | 'clc_comment';
type TCollectionData = IBook | IComment;


export class appLocalStorage {
    static model_collection_map = {

    };

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
        autoload: true,
        autoloadCallback: appLocalStorage.initDB,
        autosave: true,
        autosaveInterval: 4000
    });
    // app_db.save
    static clc_book: Collection<IBook>; // = appLocalStorage.app_db.addCollection('clc_book');
    static clc_comment: Collection<IComment>; // = appLocalStorage.app_db.addCollection('clc_comment');
    constructor() {
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
        appLocalStorage.clc_book = (appLocalStorage.app_db.getCollection('clc_book') === null) ?
            appLocalStorage.app_db.addCollection('clc_book') :
            appLocalStorage.app_db.getCollection('clc_book');

        appLocalStorage.clc_comment = (appLocalStorage.app_db.getCollection('clc_comment') === null) ?
            appLocalStorage.app_db.addCollection('clc_comment') :
            appLocalStorage.app_db.getCollection('clc_comment');

        // (appLocalStorage.app_db.getCollection('users') === null) ? appLocalStorage.app_db.addCollection('users') : appLocalStorage.app_db.getCollection('users');
        // (appLocalStorage.app_db.getCollection('reported') === null) ? appLocalStorage.app_db.addCollection('reported') : appLocalStorage.app_db.getCollection('reported');
        // (appLocalStorage.app_db.getCollection('banned') === null) ? appLocalStorage.app_db.addCollection('banned') : appLocalStorage.app_db.getCollection('banned');
        // (appLocalStorage.app_db.getCollection('donors') === null) ? appLocalStorage.app_db.addCollection('donors') : appLocalStorage.app_db.getCollection('donors');
        // (appLocalStorage.app_db.getCollection('stats') === null) ? appLocalStorage.app_db.addCollection('stats') : appLocalStorage.app_db.getCollection('stats');
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

    static storeUsefullResponse(response: AxiosResponse<any>) {
        if (response.config.url === "/api/books/_search") {
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
            .simplesort('creation_date')//, false
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
            .simplesort('creation_date')//, false
            .offset(searchPayload.offset)
            .limit(searchPayload.limit)
            .data();
    }

}