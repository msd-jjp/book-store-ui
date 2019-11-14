import { IBook } from "../../model/model.book";

enum FILE_STORAGE_KEY {
    FILE_BOOK_MAIN = 'FILE_BOOK_MAIN',
    FILE_BOOK_SAMPLE = 'FILE_BOOK_SAMPLE',
}

interface IBook_file_store {
    id: IBook['id'];
    file: Array<number>;
}

export class FileStorage {

    private static storage: CacheStorage;

    static async init() {
        debugger;
        if ('caches' in window) {
            FileStorage.storage = caches;
            // FileStorage._isSuport = true;
            debugger;
            // caches.open('myfiless').then(function (cache_obj) {
            //     cache_obj.addAll(['/', '/img/first.png', '/img/second.png'])
            //         .then(function () {
            //             console.log('Cached!');
            //         });
            // });

            // const cas = await FileStorage.storage.has(FILE_STORAGE_KEY.FILE_BOOK_MAIN);

            FileStorage.loadDownloadedBook_id();
        }
    }

    // private static _isSuport = false;
    static isSuport(): boolean {
        // return FileStorage._isSuport;
        if (FileStorage.storage) return true;
        return false;
    }

    private static getBookFileList_cache(mainFile: boolean): Promise<Cache> | undefined {
        if (!FileStorage.isSuport()) return;
        return FileStorage.storage.open(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE);
    }

    static async getBookFileById(book_id: string, mainFile: boolean): Promise<Uint8Array | undefined> {
        if (!FileStorage.isSuport()) return;
        debugger;

    }

    // static setFileById(id: string): void {}

    static async setBookFileById(book_id: string, mainFile: boolean, data: Uint8Array): Promise<any> {
        if (!FileStorage.isSuport()) return;
        debugger;
        let list = await FileStorage.getBookFileList_cache(mainFile);
        debugger;

        FileStorage.is_book_downloaded_history_save(book_id, mainFile, true);
    }

    // static removeBookFileById(book_id: string, mainFile: boolean): void {
    //     if (!FileStorage.isSuport()) return;
    //     debugger;
    // }


    static async removeBookFileById(book_id_s: string | string[], mainFile: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        debugger;
        return false;
    }

    static async checkBookFileExist_async(book_id: string, mainFile: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        debugger;
        return false;
    }

    static checkBookFileExist(book_id: string, mainFile: boolean): boolean {
        if (!FileStorage.isSuport()) return false;
        debugger;
        //todo: only save id
        if (FileStorage.is_book_downloaded_history_check(book_id, mainFile) !== undefined)
            return FileStorage.is_book_downloaded_history_check(book_id, mainFile)!;
        return false;
    }

    static async clearCollection_bookFile(mainFile: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        const isDeleted = await FileStorage.storage
            .delete(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE)
            .catch(reason => {
                console.error('clearCollection_bookFile errro: mainFile', mainFile);
            });

        if (isDeleted) {
            FileStorage.is_book_downloaded_history_reset(mainFile);
        }

        return isDeleted ? isDeleted : false
    }

    private static async loadDownloadedBook_id(): Promise<void> {
        debugger;
        let dsv = await FileStorage.getBookFileList_cache(true);
        let dsvvdfgh = await FileStorage.getBookFileList_cache(false);
        debugger;
    }


    ///////////////////////////////////////////
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    private static _book_downloaded_mainObj: any = {};
    private static _book_downloaded_sampleObj: any = {};
    private static is_book_downloaded_history_check(book_id: string, mainFile: boolean): boolean | undefined {
        //todo: only save id
        if (mainFile) return FileStorage._book_downloaded_mainObj[book_id];
        return FileStorage._book_downloaded_sampleObj[book_id];
    }
    private static is_book_downloaded_history_save(book_id: string, mainFile: boolean, value: boolean): void {
        //todo: only save id
        if (mainFile) FileStorage._book_downloaded_mainObj[book_id] = value;
        else FileStorage._book_downloaded_sampleObj[book_id] = value;
    }
    private static is_book_downloaded_history_remove(book_id: string, mainFile: boolean) {
        if (mainFile) delete FileStorage._book_downloaded_mainObj[book_id];
        else delete FileStorage._book_downloaded_sampleObj[book_id];
    }
    private static is_book_downloaded_history_reset(mainFile: boolean) {
        if (mainFile)
            FileStorage._book_downloaded_mainObj = {};
        else
            FileStorage._book_downloaded_sampleObj = {};
    }

    // private static removeBookFileFromDevice(book_id_s: string | string[], mainFile: boolean) {
    //     // appLocalStorage.removeFromCollection(mainFile ? 'clc_book_mainFile' : 'clc_book_sampleFile', book_id_s);
    //     appLocalStorage.removeBookFileById(book_id_s, mainFile);

    //     if (Array.isArray(book_id_s)) {
    //         book_id_s.forEach(id => {
    //             CmpUtility.is_book_downloaded_history_remove(id, mainFile);
    //         });
    //     } else {
    //         CmpUtility.is_book_downloaded_history_remove(book_id_s, mainFile);
    //     }
    //     CmpUtility.refreshView();
    // }

}