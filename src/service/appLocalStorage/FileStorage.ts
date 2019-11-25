import { Utility } from "../../asset/script/utility";

enum FILE_STORAGE_KEY {
    FILE_BOOK_MAIN = 'FILE_BOOK_MAIN',
    FILE_BOOK_SAMPLE = 'FILE_BOOK_SAMPLE',
    FILE_BOOK_MAIN_PARTIAL = 'FILE_BOOK_MAIN_PARTIAL',
    FILE_BOOK_SAMPLE_PARTIAL = 'FILE_BOOK_SAMPLE_PARTIAL',
}

export class FileStorage {

    private static storage: CacheStorage;

    static async init() {
        if ('caches' in window) {
            FileStorage.storage = caches;

            // const cas = await FileStorage.storage.has(FILE_STORAGE_KEY.FILE_BOOK_MAIN);

            await FileStorage.loadDownloadedBook_id();
        }
    }

    static isSuport(): boolean {
        if (FileStorage.storage) return true;
        return false;
    }

    private static getBookFileList_cache(mainFile: boolean, partial?: boolean): Promise<Cache> {
        if (partial) {
            return FileStorage.storage.open(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN_PARTIAL : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE_PARTIAL);
        }
        return FileStorage.storage.open(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE);
    }

    static async getBookFileById(book_id: string, mainFile: boolean, partial?: boolean): Promise<Uint8Array | undefined> {
        if (!FileStorage.isSuport()) return;
        // debugger;
        const list = await FileStorage.getBookFileList_cache(mainFile, partial);
        const item = await list.match(book_id).catch(e => {
            console.error('book file byId not exist', book_id);
        });
        if (item)
            return new Uint8Array(await item.arrayBuffer());
    }

    static async setBookFileById(book_id: string, mainFile: boolean, data: Uint8Array, partial?: boolean): Promise<boolean> { // Uint8Array,ArrayBuffer
        if (!FileStorage.isSuport()) return false;
        const list = await FileStorage.getBookFileList_cache(mainFile, partial);
        // debugger;
        let save = true;
        list.put(book_id, new Response(data)).catch(e => {
            save = false;
            console.error('setBookFileById put errro: ', e);
        });

        if (save && !partial)
            FileStorage.is_book_downloaded_history_save(book_id, mainFile);

        return save;
    }

    static async removeBookFileById(book_id_s: string | string[], mainFile: boolean, partial?: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        // debugger;
        let singleDeleted = true; // : any
        const list = await FileStorage.getBookFileList_cache(mainFile, partial);
        if (Array.isArray(book_id_s)) {
            for (let i = 0; i < book_id_s.length; i++) {
                const d = await list.delete(book_id_s[i]);
                !partial && d && FileStorage.is_book_downloaded_history_remove(book_id_s[i], mainFile);
            }
        } else {
            const d = await list.delete(book_id_s); // .catch(e => { console.error('list.delete', e); });
            singleDeleted = d;
            !partial && d && FileStorage.is_book_downloaded_history_remove(book_id_s, mainFile);
        }

        return singleDeleted;
    }

    static checkBookFileExist(book_id: string, mainFile: boolean): boolean {
        if (!FileStorage.isSuport()) return false;
        return FileStorage.is_book_downloaded_history_check(book_id, mainFile);
    }

    static async checkBookFileExist_async(book_id: string, mainFile: boolean) {
        /** wait until FileStorage._loadDownloadedCompleted */
        if (!FileStorage.isSuport()) return false;
        for (let i = 0; i < 100; i++) {
            await Utility.waitOnMe(100);
            if (FileStorage._loadDownloadedCompleted) break;
            // else console.log(FileStorage._loadDownloadedCompleted);
        }
        // console.log('; checkBookFileExist_async', book_id, mainFile);
        return FileStorage.is_book_downloaded_history_check(book_id, mainFile);
    }

    static async clearCollection_bookFile(mainFile: boolean, partial?: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;

        if (partial) {
            const isDeleted_partial = await FileStorage.storage
                .delete(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN_PARTIAL : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE_PARTIAL)
                .catch(reason => {
                    console.error('clearCollection_bookFile PARTIAL errro: mainFile', mainFile);
                });
            return isDeleted_partial ? isDeleted_partial : false;
        }

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

    private static _loadDownloadedCompleted = false;
    private static async loadDownloadedBook_id(): Promise<void> {
        const list_main = await FileStorage.getBookFileList_cache(true);
        const list_sample = await FileStorage.getBookFileList_cache(false);

        const list_main_keys = await list_main.keys();
        list_main_keys.forEach(key => {
            const bk_id = key.url.replace(window.location.origin + '/', '');
            FileStorage.is_book_downloaded_history_save(bk_id, true);
        });
        const list_sample_keys = await list_sample.keys();
        list_sample_keys.forEach(key => {
            const bk_id = key.url.replace(window.location.origin + '/', '');
            FileStorage.is_book_downloaded_history_save(bk_id, false);
        });

        FileStorage._loadDownloadedCompleted = true;
    }

    ///////////////////////////////////////////

    private static _book_downloaded_main_list: string[] = [];
    private static _book_downloaded_sample_list: string[] = [];
    private static is_book_downloaded_history_check(book_id: string, mainFile: boolean): boolean {
        if (mainFile) return FileStorage._book_downloaded_main_list.includes(book_id);
        return FileStorage._book_downloaded_sample_list.includes(book_id);
    }
    private static is_book_downloaded_history_save(book_id: string, mainFile: boolean): void {
        if (mainFile) {
            if (!FileStorage._book_downloaded_main_list.includes(book_id)) {
                FileStorage._book_downloaded_main_list.push(book_id);
            }
        } else {
            if (!FileStorage._book_downloaded_sample_list.includes(book_id)) {
                FileStorage._book_downloaded_sample_list.push(book_id);
            }
        }
    }
    private static is_book_downloaded_history_remove(book_id: string, mainFile: boolean) {
        if (mainFile) FileStorage._book_downloaded_main_list.splice(FileStorage._book_downloaded_main_list.indexOf(book_id), 1);
        else FileStorage._book_downloaded_sample_list.splice(FileStorage._book_downloaded_sample_list.indexOf(book_id), 1);
    }
    private static is_book_downloaded_history_reset(mainFile: boolean) {
        if (mainFile)
            FileStorage._book_downloaded_main_list = [];
        else
            FileStorage._book_downloaded_sample_list = [];
    }

}