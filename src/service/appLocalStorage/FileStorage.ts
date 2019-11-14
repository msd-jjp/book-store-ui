enum FILE_STORAGE_KEY {
    FILE_BOOK_MAIN = 'FILE_BOOK_MAIN',
    FILE_BOOK_SAMPLE = 'FILE_BOOK_SAMPLE',
}

export class FileStorage {

    private static storage: CacheStorage;

    static async init() {
        if ('caches' in window) {
            FileStorage.storage = caches;
            debugger;

            // const cas = await FileStorage.storage.has(FILE_STORAGE_KEY.FILE_BOOK_MAIN);

            await FileStorage.loadDownloadedBook_id();
        }
    }

    static isSuport(): boolean {
        if (FileStorage.storage) return true;
        return false;
    }

    private static getBookFileList_cache(mainFile: boolean): Promise<Cache> {
        return FileStorage.storage.open(mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE);
    }

    static async getBookFileById(book_id: string, mainFile: boolean): Promise<Uint8Array | undefined> {
        if (!FileStorage.isSuport()) return;
        debugger;
        const list = await FileStorage.getBookFileList_cache(mainFile);
        const item = await list.match(book_id).catch(e => {
            console.error('book file byId not exist', book_id);
        });
        if (item)
            return new Uint8Array(await item.arrayBuffer());
    }

    static async setBookFileById(book_id: string, mainFile: boolean, data: Uint8Array): Promise<boolean> { // Uint8Array,ArrayBuffer
        if (!FileStorage.isSuport()) return false;
        let list = await FileStorage.getBookFileList_cache(mainFile);
        debugger;

        let save = true;
        list.put(book_id, new Response(data)).catch(e => {
            save = false;
            console.error('setBookFileById put errro: ', e);
        });

        if (save)
            FileStorage.is_book_downloaded_history_save(book_id, mainFile);

        return save;
    }

    static async removeBookFileById(book_id_s: string | string[], mainFile: boolean): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        debugger;
        let list = await FileStorage.getBookFileList_cache(mainFile);
        if (Array.isArray(book_id_s)) {
            for (let i = 0; i < book_id_s.length; i++) {
                const d = await list.delete(book_id_s[i]);
                d && FileStorage.is_book_downloaded_history_remove(book_id_s[i], mainFile);
            }
        } else {
            const d = await list.delete(book_id_s);
            d && FileStorage.is_book_downloaded_history_remove(book_id_s, mainFile);
        }

        return true;
    }

    static checkBookFileExist(book_id: string, mainFile: boolean): boolean {
        if (!FileStorage.isSuport()) return false;
        return FileStorage.is_book_downloaded_history_check(book_id, mainFile);
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
        // debugger;
        const list_main = await FileStorage.getBookFileList_cache(true);
        const list_sample = await FileStorage.getBookFileList_cache(false);
        // debugger;
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