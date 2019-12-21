import { Utility } from "../../asset/script/utility";
import { appLocalStorage } from ".";

export enum FILE_STORAGE_KEY {
    FILE_BOOK_MAIN = 'FILE_BOOK_MAIN',
    FILE_BOOK_MAIN_PARTIAL = 'FILE_BOOK_MAIN_PARTIAL',
    FILE_BOOK_SAMPLE = 'FILE_BOOK_SAMPLE',
    FILE_BOOK_SAMPLE_PARTIAL = 'FILE_BOOK_SAMPLE_PARTIAL',
    READER_ENGINE = 'READER_ENGINE',
    READER_ENGINE_PARTIAL = 'READER_ENGINE_PARTIAL',
}

export class FileStorage {
    private static storage: CacheStorage;
    private static collectionList: FILE_STORAGE_KEY[] = [
        FILE_STORAGE_KEY.FILE_BOOK_MAIN,
        // FILE_STORAGE_KEY.FILE_BOOK_MAIN_PARTIAL,
        FILE_STORAGE_KEY.FILE_BOOK_SAMPLE,
        // FILE_STORAGE_KEY.FILE_BOOK_SAMPLE_PARTIAL,
        FILE_STORAGE_KEY.READER_ENGINE,
        // FILE_STORAGE_KEY.READER_ENGINE_PARTIAL
    ];

    private static readonly partial_downloadSize = Utility.partial_downloadSize; // 100000;

    static async init() {
        if ('caches' in window) {
            FileStorage.storage = caches;
            // const cas = await FileStorage.storage.has(FILE_STORAGE_KEY.FILE_BOOK_MAIN);
            await FileStorage.memory_loadStorage();
        }
    }

    static isSuport(): boolean {
        if (FileStorage.storage) return true;
        return false;
    }

    private static async getCollection(collectionName: FILE_STORAGE_KEY): Promise<Cache> {
        return await FileStorage.storage.open(collectionName);
    }

    static async getFileById(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<Uint8Array | undefined> {
        if (!FileStorage.isSuport()) return;
        // debugger;
        const col = await FileStorage.getCollection(collectionName);
        const file = await col.match(fileId).catch(e => {
            console.error('file byId not exist', fileId);
        });
        if (file)
            return new Uint8Array(await file.arrayBuffer());
    }

    private static async saveFileById(collectionName: FILE_STORAGE_KEY, fileId: string, data: Uint8Array): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        const col = await FileStorage.getCollection(collectionName);
        let saved = true;
        await col.put(fileId, new Response(data)).catch(e => {
            saved = false;
            console.error('storeFileById put error: ', e);
        });
        if (saved && !collectionName.includes('_PARTIAL')) { FileStorage.memory_collection_save(collectionName, fileId); }
        return saved;
    }

    static async saveFileById_partial(collectionName: FILE_STORAGE_KEY, fileId: string, data: Uint8Array): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        if (!collectionName.includes('_PARTIAL')) return false;
        // debugger;
        const col = await FileStorage.getCollection(collectionName);
        const keys = await col.keys();
        let count = 0;
        keys.forEach(key => { if (key.url.includes(fileId)) count++; });

        let saved = true;
        await col.put(`${fileId}_${count}`, new Response(data)).catch(e => {
            saved = false;
            console.error('storeFileById put error: ', e);
        });
        return saved;
    }
    static async getFileById_partial_length(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<number> {
        if (!FileStorage.isSuport()) return 0;
        if (!collectionName.includes('_PARTIAL')) return 0;
        // debugger;
        const col = await FileStorage.getCollection(collectionName);
        const keys = await col.keys();
        let count = 0;
        keys.forEach(key => { if (key.url.includes(fileId)) count++; });
        let file_length = 0;
        if (count > 0) {
            for (let i = 0; i < count - 1; i++) {
                let fs = FileStorage.partial_downloadSize;
                // if (i === 0) fs = fs + 1;
                file_length = file_length + fs;
            }
            const file = await col.match(`${fileId}_${count - 1}`).catch(e => {
                console.error('file byId not exist', fileId);
            });
            if (file) {
                const arr_b = await file.arrayBuffer();
                file_length = file_length + arr_b.byteLength;
            }
        }
        return file_length;
    }

    static async saveFileById_concatPartial(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        if (!collectionName.includes('_PARTIAL')) return false;
        // debugger;
        console.log('saveFileById_concatPartial concating...');
        const col = await FileStorage.getCollection(collectionName);
        const keys = await col.keys();

        const list: string[] = [];
        keys.forEach(key => {
            if (key.url.includes(fileId)) list.push(key.url.replace(window.location.origin + '/', ''));
        });


        const file_length = await FileStorage.getFileById_partial_length(collectionName, fileId);
        const total = new Uint8Array(file_length);
        let arr_filled_length = 0;
        let error_occuured = false;
        console.time('partial_download_100%_createTotalArr');
        for (let i = 0; i < list.length; i++) {
            const file = await col.match(`${fileId}_${i}`).catch(e => {
                console.error('file byId not exist', fileId);
            });
            if (file) {
                const arr_u = new Uint8Array(await file.arrayBuffer());
                // const arr_u_length = arr_u.byteLength;
                /* for (let j = 0; j < arr_u_length; j++) {
                    total[arr_filled_length + j] = arr_u[j];
                }
                arr_filled_length = arr_filled_length + arr_u.byteLength; */

                try {
                    total.set(arr_u, arr_filled_length);
                } catch (e) {
                    console.error('error_occuured while concat all partial files, set value', e);
                    if (e && e.message === "Source is too large") {
                        error_occuured = true;
                        await FileStorage.removeFileById_partial(collectionName, fileId);
                        break;
                    }
                }
                arr_filled_length = arr_filled_length + arr_u.byteLength;
            } else {
                console.warn('error_occuured while concat all partial files', fileId, i);
                error_occuured = true;
                break;
            }
        }
        console.timeEnd('partial_download_100%_createTotalArr');
        if (error_occuured) {
            console.warn('error_occuured while concat all partial files');
            return false;
        }

        let saved = await FileStorage.saveFileById(collectionName.replace('_PARTIAL', '') as FILE_STORAGE_KEY, fileId, total);
        if (saved) {
            console.time('partial_download_100%_removeFileById_partial');
            let r_p = await FileStorage.removeFileById_partial(collectionName, fileId);
            console.timeEnd('partial_download_100%_removeFileById_partial');
            return r_p;
        } else {
            console.warn('on save total file error occured.');
            return false;
        }
    }

    static async removeFileById(collectionName: FILE_STORAGE_KEY, fileId_s: string | string[]): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;

        let singleDeleted = true;
        const col = await FileStorage.getCollection(collectionName);

        if (Array.isArray(fileId_s)) {
            for (let i = 0; i < fileId_s.length; i++) {
                const d = await col.delete(fileId_s[i]);
                if (d) {
                    // FileStorage.memory_collection_removeById(collectionName, fileId_s[i]);
                    if (!collectionName.includes('_PARTIAL')) {
                        FileStorage.memory_collection_removeById(collectionName, fileId_s[i]);

                        appLocalStorage.removeFromCollection('clc_creationDate', fileId_s[i]);
                        appLocalStorage.removeFromCollection('clc_eTag', fileId_s[i]);
                    }
                }
            }
        } else {
            const d = await col.delete(fileId_s);
            if (d) {
                // FileStorage.memory_collection_removeById(collectionName, fileId_s);
                if (!collectionName.includes('_PARTIAL')) {
                    FileStorage.memory_collection_removeById(collectionName, fileId_s);

                    appLocalStorage.removeFromCollection('clc_creationDate', fileId_s);
                    appLocalStorage.removeFromCollection('clc_eTag', fileId_s);
                }
            }
            singleDeleted = d;
        }

        return singleDeleted;
    }

    static async removeFileById_partial(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        if (!collectionName.includes('_PARTIAL')) return false;
        // debugger;

        const col = await FileStorage.getCollection(collectionName);

        const keys = await col.keys();
        const list: string[] = [];
        keys.forEach(key => {
            if (key.url.includes(fileId)) list.push(key.url.replace(window.location.origin + '/', ''));
        });

        let deleted = true;
        for (let i = 0; i < list.length; i++) {
            const d = await col.delete(list[i]);
            deleted = deleted && d;
        }

        return deleted;
    }

    static async clearFileCollection(collectionName: FILE_STORAGE_KEY): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;

        const isDeleted = await FileStorage.storage.delete(collectionName).catch(reason => {
            console.error('clearCollection error: ', collectionName, reason);
        });
        if (isDeleted && !collectionName.includes('_PARTIAL')) { FileStorage.memory_collection_clear(collectionName) }
        return isDeleted ? isDeleted : false;
    }

    static checkFileExist(collectionName: FILE_STORAGE_KEY, fileId: string): boolean {
        if (!FileStorage.isSuport()) return false;
        return FileStorage.memory_collections[collectionName].includes(fileId);
    }

    static async checkFileExist_async(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        if (!FileStorage.storageLoaded) {
            for (let i = 0; i < 100; i++) {
                await Utility.waitOnMe(100);
                if (FileStorage.storageLoaded) break;
                // console.error('checkFileExist_async');
            }
        }
        return FileStorage.memory_collections[collectionName].includes(fileId);
    }


    private static memory_collections: { [key in FILE_STORAGE_KEY]: string[] } = (() => {
        const obj: any = {};
        FileStorage.collectionList.forEach(colName => { obj[colName] = []; });
        return obj;
    })();
    private static storageLoaded = false;
    private static async memory_loadStorage(): Promise<void> {
        for (let i = 0; i < FileStorage.collectionList.length; i++) {
            await FileStorage.memory_loadCollectionStorage(FileStorage.collectionList[i]);
        }
        FileStorage.storageLoaded = true;
    }
    private static async memory_loadCollectionStorage(collectionName: FILE_STORAGE_KEY): Promise<void> {
        const col = await FileStorage.getCollection(collectionName);
        const col_keys = await col.keys();
        const col_files_ids = col_keys.map(key => key.url.replace(window.location.origin + '/', ''));
        FileStorage.memory_collections[collectionName] = col_files_ids;
    }
    private static memory_collection_clear(collectionName: FILE_STORAGE_KEY): void {
        FileStorage.memory_collections[collectionName] = [];
    }
    private static memory_collection_removeById(collectionName: FILE_STORAGE_KEY, fileId: string): void {
        FileStorage.memory_collections[collectionName].splice(FileStorage.memory_collections[collectionName].indexOf(fileId), 1);
    }
    private static memory_collection_save(collectionName: FILE_STORAGE_KEY, fileId: string): void {
        if (FileStorage.memory_collections[collectionName].indexOf(fileId) < 0) {
            FileStorage.memory_collections[collectionName].push(fileId);
        }
    }


    // workbox
    static async clearWorkbox(): Promise<boolean> {
        const keys = await FileStorage.storage.keys();
        let found = undefined;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes('workbox')) { found = keys[i]; break; } // workbox
        }

        if (found !== undefined) {
            const deleted = await FileStorage.storage.delete(found).catch(e => { console.log('clearWorkbox', e) });
            return deleted !== undefined ? deleted : false;
        } else {
            return false;
        }
    }

}
