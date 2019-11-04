import loki, { Collection, LokiLocalStorageAdapter } from 'lokijs';
// import * as LokiIndexedAdapter from 'lokijs/build/LokiIndexedAdapter';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';

import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { ParseApi } from './ParseApi';
import { SearchAppStorage } from './SearchAppStorage';
import { StoreData } from './StoreData';
import { IOrder, IOrderItem } from '../../model/model.order';
import { CmpUtility } from '../../component/_base/CmpUtility';
// import { is_book_downloaded_history_reset } from '../../component/library/libraryViewTemplate';

// const LokiIndexedAdapter = require('lokijs/src/loki-indexed-adapter');
// const lfsa = require('lokijs/src/loki-fs-structured-adapter');

export interface IOrderItemStore { id: IOrder['id']; items: IOrderItem[] };
export interface IBook_file_store {
    id: IBook['id'];
    file: Array<number>;
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

    static idbAdapter_i = new LokiIndexedAdapter('appAdapter');
    static pa_idbAdapter_i = new loki.LokiPartitioningAdapter(
        appLocalStorage.idbAdapter_i,
        { paging: true, pageSize: 4 * 1024 * 1024 }
    );

    // static adapter = new lfsa();
    // static idbAdapter_fs = new LokiFsAdapter();

    
    static app_db = new loki('bookstore.db2', {
        // adapter: appLocalStorage.idbAdapter,
        // adapter: appLocalStorage.idbAdapter_i,
        adapter: appLocalStorage.pa_idbAdapter_i,
        // adapter: appLocalStorage.idbAdapter_fs,
        // adapter: appLocalStorage.adapter,
        // autoload: true,
        // autoloadCallback: appLocalStorage.initDB,

        autosave: true,
        autosaveInterval: 4000,
        autosaveCallback: appLocalStorage.autosaveCallback
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
            debugger;

            appLocalStorage.initDB(); // indexed db adaptor need this.
            CmpUtility.is_book_downloaded_history_reset();
            CmpUtility.refreshView();
        });
        appLocalStorage.initDB();
    }

    static /* async */ initDB() {
        // await CmpUtility.waitOnMe(2000);

        appLocalStorage.collectionNameList.forEach((colName: TCollectionName) => {
            // let _appCol = appLocalStorage[colName];
            if (appLocalStorage.app_db.getCollection(colName)) {
                (appLocalStorage[colName] as Collection<any>) = appLocalStorage.app_db.getCollection(colName);
            } else {
                (appLocalStorage[colName] as Collection<any>) = appLocalStorage.app_db.addCollection(colName);
            }
        });

    }

    static autosaveCallback(e: any) {
        debugger;
    }

    static manualSaveDB() {
        // appLocalStorage.app_db.saveDatabase((err: any) => {
        //     if (err) {
        //         console.error("saveDatabase error : " + err);
        //     }
        //     else {
        //         console.log("database saved.");
        //     }
        // });
        return;
        return new Promise((res, rej) => {
            appLocalStorage.app_db.saveDatabase((err: any) => {
                debugger;
                if (err) {
                    console.error("******************* saveDatabase error : " + err);
                    rej(err);
                }
                else {
                    console.log("******************* database saved.");
                    res(true);
                }
            });
        });
    }

    static clearCollection(collectionName: TCollectionName) {
        appLocalStorage[collectionName].clear();
        appLocalStorage.manualSaveDB();
    }

    static removeFromCollection(collectionName: TCollectionName, id_s: string | string[]) {
        if (Array.isArray(id_s)) {
            id_s.forEach(id => {
                appLocalStorage[collectionName].findAndRemove({ id: id });
            });
        } else {
            appLocalStorage[collectionName].findAndRemove({ id: id_s });
        }

        appLocalStorage.manualSaveDB();
    }

    static resetDB() {
        appLocalStorage.collectionNameList.forEach((coll: TCollectionName) => {
            appLocalStorage.clearCollection(coll);
        });
    }

    static afterAppLogout() {
        // appLocalStorage.resetDB() // todo: ask if need resetDB?
        appLocalStorage.clearCollection('clc_book_mainFile');
        CmpUtility.is_book_downloaded_history_reset();
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
