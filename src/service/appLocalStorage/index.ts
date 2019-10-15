import loki, { Collection, LokiLocalStorageAdapter } from 'lokijs';
import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { ParseApi } from './ParseApi';
import { SearchAppStorage } from './SearchAppStorage';

interface IBook_file_store {
    id: IBook['id'];
    file: Uint8Array; // todo: change to Uint8Array[] if audio book has multiple files.
}
export type TCollectionName = 'clc_book' | 'clc_comment' | 'clc_book_file';
export type TCollectionData = IBook | IComment; // | IBook_file_store;

export class appLocalStorage {

    static idbAdapter = new LokiLocalStorageAdapter();
    static app_db = new loki('bookstore.db', {
        adapter: appLocalStorage.idbAdapter,
        // autoload: true,
        // autoloadCallback: appLocalStorage.initDB,
        autosave: true,
        autosaveInterval: 4000
    });
    // app_db.save
    static clc_book: Collection<IBook>;
    static clc_comment: Collection<IComment>;
    static clc_book_file: Collection<any>;
    constructor() {
        appLocalStorage.app_db.loadDatabase({}, (err: any) => {
            // debugger;
        })
        appLocalStorage.initDB();
    }

    static initDB() {
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

        if (this.app_db.getCollection('clc_book_file')) {
            this.clc_book_file = this.app_db.getCollection('clc_book_file');
        } else {
            this.clc_book_file = this.app_db.addCollection('clc_book_file');
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
        let coll_list: TCollectionName[] = ['clc_book', 'clc_comment'];
        coll_list.forEach((coll: TCollectionName) => {
            appLocalStorage.clearCollection(coll);
        });
    }

    static storeUsefullResponse(response: AxiosResponse<any>) {
        ParseApi.parseResponse(response);
    }

    static addDataToCollection(collectionName: TCollectionName, data: TCollectionData[] | TCollectionData | IBook_file_store) {
        let coll: Collection<any> = appLocalStorage[collectionName];

        //todo: only update found one : here we search twice if found.
        if (Array.isArray(data)) {
            data.forEach(obj => {
                let found = coll.findOne({ id: obj.id });
                if (found) {
                    coll.findAndUpdate({ id: obj.id }, oldObj => {
                        return obj;
                    });
                } else {
                    coll.insert(obj);
                }
            })
        } else {
            let found = coll.findOne({ id: data.id });
            if (found) {
                coll.findAndUpdate({ id: data.id }, oldObj => {
                    return data;
                });
            } else {
                coll.insert(data);
            }
        }
    }

    static findById = SearchAppStorage.findById;
    static search_by_query_book = SearchAppStorage.search_by_query_book;
    static search_by_query_comment = SearchAppStorage.search_by_query_comment;
    static search_by_phrase_book = SearchAppStorage.search_by_phrase_book;

}