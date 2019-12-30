import loki, { Collection, LokiLocalStorageAdapter } from 'lokijs';
// import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';

import { IBook } from '../../model/model.book';
import { IComment } from '../../model/model.comment';
import { AxiosResponse } from 'axios';
import { ParseApi } from './ParseApi';
import { SearchAppStorage } from './SearchAppStorage';
import { StoreData } from './StoreData';
import { IOrder, IOrderItem } from '../../model/model.order';
import { CmpUtility } from '../../component/_base/CmpUtility';
import { IAccount } from '../../model/model.account';
import { FileStorage, FILE_STORAGE_KEY } from './FileStorage';
import { IDeviceKey } from '../../model/model.device-key';
import { IndexedStorage } from './IndexedStorage';
// const LokiIndexedAdapter = require('lokijs/src/loki-indexed-adapter');
// const lfsa = require('lokijs/src/loki-fs-structured-adapter');

export interface IOrderItemStore { id: IOrder['id']; items: IOrderItem[] };
export interface IEtag { id: string; eTag: string; };
export interface ICreationDate { id: string; date: number; };

export type TCollectionName =
    'clc_book' |
    'clc_comment' |
    'clc_userInvoicedOrder' |
    'clc_userInvoicedOrderItem' |
    'clc_userAccount' |
    'clc_eTag' |
    'clc_creationDate' |
    'clc_deviceKey'
    ;

export type TCollectionData = IBook | IComment | IOrder | IAccount | IDeviceKey; // | IEtag;

export class appLocalStorage {

    static idbAdapter = new LokiLocalStorageAdapter();

    /* static idbAdapter_i = new LokiIndexedAdapter('appAdapter');
    static pa_idbAdapter_i = new loki.LokiPartitioningAdapter(
        appLocalStorage.idbAdapter_i,
        { paging: true, pageSize: 1 * 1024 * 1024 }
    ); */

    // static adapter = new lfsa();
    // static idbAdapter_fs = new LokiFsAdapter();


    static app_db = new loki('bookstore.db', {
        adapter: appLocalStorage.idbAdapter,
        // adapter: appLocalStorage.idbAdapter_i,
        // adapter: appLocalStorage.pa_idbAdapter_i,
        // adapter: appLocalStorage.idbAdapter_fs,
        // adapter: appLocalStorage.adapter,
        // autoload: true,
        // autoloadCallback: appLocalStorage.initDB,

        autosave: true,
        autosaveInterval: 4000,
        autosaveCallback: appLocalStorage.autosaveCallback
    });
    // app_db.save
    static readonly collectionNameList: TCollectionName[] = [
        'clc_book', 'clc_comment', 'clc_userInvoicedOrder',
        'clc_userInvoicedOrderItem', 'clc_userAccount', 'clc_eTag',
        'clc_creationDate', 'clc_deviceKey'
    ];

    static clc_book: Collection<IBook>;
    static clc_comment: Collection<IComment>;
    static clc_userInvoicedOrder: Collection<IOrder>;
    static clc_userInvoicedOrderItem: Collection<IOrderItemStore>;
    static clc_userAccount: Collection<IAccount>;
    static clc_eTag: Collection<IEtag>;
    static clc_creationDate: Collection<ICreationDate>;
    static clc_deviceKey: Collection<IDeviceKey>;

    constructor() {
        appLocalStorage.app_db.loadDatabase({}, (err: any) => {
            // debugger;

            appLocalStorage.initDB(); // indexed db adaptor need this.
            // CmpUtility.refreshView();
        });
        appLocalStorage.initDB();

        // FileStorage.init();
        appLocalStorage.initFileStorage();
    }

    private static /* async */ initDB() {
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

    private static async initFileStorage() {
        await FileStorage.init();
        CmpUtility.refreshView();
    }

    static autosaveCallback(e: any) {
        // debugger;
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
        // return;
        /* return new Promise((res, rej) => {
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
        }); */
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
        appLocalStorage.clearFileCollection(FILE_STORAGE_KEY.FILE_BOOK_MAIN);
        appLocalStorage.clearFileCollection(FILE_STORAGE_KEY.FILE_BOOK_MAIN_PARTIAL);
        appLocalStorage.clearCollection('clc_userInvoicedOrder');
        appLocalStorage.clearCollection('clc_userInvoicedOrderItem');
        appLocalStorage.clearCollection('clc_userAccount');
        appLocalStorage.clearCollection('clc_deviceKey');
        IndexedStorage.clear_bookPages(true);
    }

    static storeUsefullResponse(response: AxiosResponse<any>) {
        ParseApi.parseResponse(response);
    }

    static addDataToCollection = StoreData.addDataToCollection;
    static storeData_userInvoicedOrderItem = StoreData.storeData_userInvoicedOrderItem;
    // static storeBookFile = StoreData.storeBookFile;
    // static removeBookFileById = FileStorage.removeBookFileById;
    // static clearCollection_bookFile = FileStorage.clearCollection_bookFile;
    static store_eTag = StoreData.store_eTag;
    static store_creationDate = StoreData.store_creationDate;

    static findById = SearchAppStorage.findById;
    // static findBookMainFileById = SearchAppStorage.findBookMainFileById;
    // static findBookSampleFileById = SearchAppStorage.findBookSampleFileById;
    static search_by_query_book = SearchAppStorage.search_by_query_book;
    static search_by_query_comment = SearchAppStorage.search_by_query_comment;
    static search_by_phrase_book = SearchAppStorage.search_by_phrase_book;

    static search_by_query_userInvoicedOrder = SearchAppStorage.search_by_query_userInvoicedOrder;
    static find_orderItems_by_order_id = SearchAppStorage.find_orderItems_by_order_id;

    static search_userMainAccount = SearchAppStorage.search_userMainAccount;
    // static checkBookFileExist = FileStorage.checkBookFileExist;
    // static checkBookFileExist_async = FileStorage.checkBookFileExist_async;
    static find_eTagById = SearchAppStorage.find_eTagById;
    static find_creationDateById = SearchAppStorage.find_creationDateById;

    static getFileById = FileStorage.getFileById;
    // static saveFileById = FileStorage.saveFileById;
    static removeFileById = FileStorage.removeFileById;
    static clearFileCollection = FileStorage.clearFileCollection;
    static checkFileExist = FileStorage.checkFileExist;
    static checkFileExist_async = FileStorage.checkFileExist_async;

    static saveFileById_partial = FileStorage.saveFileById_partial;
    static getFileById_partial_length = FileStorage.getFileById_partial_length;
    static removeFileById_partial = FileStorage.removeFileById_partial;
    static saveFileById_concatPartial = FileStorage.saveFileById_concatPartial;


    static clearWorkbox = FileStorage.clearWorkbox;

    // static find_deviceKeyByUserId = SearchAppStorage.find_deviceKeyByUserId;
    static getAll_deviceKeyByUserId = SearchAppStorage.getAll_deviceKeyByUserId;

}
