import loki, { Collection, LokiLocalStorageAdapter } from 'lokijs';
import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { ParseApi } from './ParseApi';
import { SearchAppStorage } from './SearchAppStorage';
import { StoreData } from './StoreData';
import { IOrder, IOrderItem } from '../../model/model.order';

// interface IBook_file_store_sample {
//     id: '/^sampleFile-/';//IBook['id'];
//     // mainFile: Uint8Array; // todo: change to Uint8Array[] if audio book has multiple files.
//     sampleFile: Uint8Array;
// }
// interface IBook_file_store_main {
//     id: '/^mainFile-/';
//     mainFile: Uint8Array;
//     // sampleFile: Uint8Array;
// }
export interface IOrderItemStore { id: IOrder['id']; items: IOrderItem[] };
// export type IBook_file_store = IBook_file_store_sample | IBook_file_store_main;
export interface IBook_file_store {
    id: IBook['id'];
    file: Uint8Array;
}
export type TCollectionName =
    'clc_book' |
    'clc_comment' |
    'clc_userInvoicedOrder' |
    'clc_userInvoicedOrderItem' |
    'clc_book_mainFile' |
    'clc_book_sampleFile';
export type TCollectionData = IBook | IComment | IOrder; // | IBook_file_store;

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
    static readonly collectionNameList: TCollectionName[] =
        ['clc_book', 'clc_comment', 'clc_userInvoicedOrder',
            'clc_userInvoicedOrderItem', 'clc_book_mainFile',
            'clc_book_sampleFile'];

    static clc_book: Collection<IBook>;
    static clc_comment: Collection<IComment>;
    static clc_userInvoicedOrder: Collection<IOrder>;
    static clc_userInvoicedOrderItem: Collection<IOrderItemStore>;
    static clc_book_mainFile: Collection<IBook_file_store>;
    static clc_book_sampleFile: Collection<IBook_file_store>;
    constructor() {
        appLocalStorage.app_db.loadDatabase({}, (err: any) => {
            // debugger;
        });
        appLocalStorage.initDB();
    }

    static initDB() {
        appLocalStorage.collectionNameList.forEach((colName: TCollectionName) => {
            // let _appCol = appLocalStorage[colName];
            if (appLocalStorage.app_db.getCollection(colName)) {
                (appLocalStorage[colName] as Collection<any>) = appLocalStorage.app_db.getCollection(colName);
            } else {
                (appLocalStorage[colName] as Collection<any>) = appLocalStorage.app_db.addCollection(colName);
            }
        });

        // if (this.app_db.getCollection('clc_book')) {
        //     this.clc_book = this.app_db.getCollection('clc_book');
        // } else {
        //     this.clc_book = this.app_db.addCollection('clc_book');
        // }

        // if (this.app_db.getCollection('clc_comment')) {
        //     this.clc_comment = this.app_db.getCollection('clc_comment');
        // } else {
        //     this.clc_comment = this.app_db.addCollection('clc_comment');
        // }

        // if (this.app_db.getCollection('clc_book_file')) {
        //     this.clc_book_file = this.app_db.getCollection('clc_book_file');
        // } else {
        //     this.clc_book_file = this.app_db.addCollection('clc_book_file');
        // }
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
        // let coll_list: TCollectionName[] = ['clc_book', 'clc_comment', 'clc_order', 'clc_orderItem', 'clc_book_file'];
        // coll_list
        appLocalStorage.collectionNameList.forEach((coll: TCollectionName) => {
            appLocalStorage.clearCollection(coll);
        });
    }

    static afterAppLogout() {
        // appLocalStorage.resetDB() // todo: ask if need resetDB?
        appLocalStorage.clearCollection('clc_book_mainFile');
        // appLocalStorage.clearCollection('clc_book_sampleFile');
        appLocalStorage.clearCollection('clc_userInvoicedOrder');
        appLocalStorage.clearCollection('clc_userInvoicedOrderItem');
    }

    static storeUsefullResponse(response: AxiosResponse<any>) {
        ParseApi.parseResponse(response);
    }

    static addDataToCollection = StoreData.addDataToCollection;
    static storeData_userInvoicedOrderItem = StoreData.storeData_userInvoicedOrderItem;
    static storeBookFile = StoreData.storeBookFile;

    static findById = SearchAppStorage.findById;
    static findBookMainFileById = SearchAppStorage.findBookMainFileById;
    static findBookSampleFileById = SearchAppStorage.findBookSampleFileById;
    static search_by_query_book = SearchAppStorage.search_by_query_book;
    static search_by_query_comment = SearchAppStorage.search_by_query_comment;
    static search_by_phrase_book = SearchAppStorage.search_by_phrase_book;

    static search_by_query_userInvoicedOrder = SearchAppStorage.search_by_query_userInvoicedOrder;
    static find_orderItems_by_order_id = SearchAppStorage.find_orderItems_by_order_id;

}
