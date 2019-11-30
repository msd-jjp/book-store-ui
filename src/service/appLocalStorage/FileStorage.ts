import { Utility } from "../../asset/script/utility";

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
        FILE_STORAGE_KEY.FILE_BOOK_MAIN_PARTIAL,
        FILE_STORAGE_KEY.FILE_BOOK_SAMPLE,
        FILE_STORAGE_KEY.FILE_BOOK_SAMPLE_PARTIAL,
        FILE_STORAGE_KEY.READER_ENGINE,
        FILE_STORAGE_KEY.READER_ENGINE_PARTIAL
    ]

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

    static async saveFileById(collectionName: FILE_STORAGE_KEY, fileId: string, data: Uint8Array): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;
        const col = await FileStorage.getCollection(collectionName);
        let saved = true;
        col.put(fileId, new Response(data)).catch(e => {
            saved = false;
            console.error('storeFileById put error: ', e);
        });
        if (saved) { FileStorage.memory_collection_save(collectionName, fileId); }
        return saved;
    }

    static async removeFileById(collectionName: FILE_STORAGE_KEY, fileId_s: string | string[]): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;

        let singleDeleted = true;
        const col = await FileStorage.getCollection(collectionName);

        if (Array.isArray(fileId_s)) {
            for (let i = 0; i < fileId_s.length; i++) {
                const d = await col.delete(fileId_s[i]);
                if (d) { FileStorage.memory_collection_removeById(collectionName, fileId_s[i]); }
            }
        } else {
            const d = await col.delete(fileId_s);
            if (d) { FileStorage.memory_collection_removeById(collectionName, fileId_s); }
            singleDeleted = d;
        }

        return singleDeleted;
    }

    static async clearFileCollection(collectionName: FILE_STORAGE_KEY): Promise<boolean> {
        if (!FileStorage.isSuport()) return false;

        const isDeleted = await FileStorage.storage.delete(collectionName).catch(reason => {
            console.error('clearCollection error: ', collectionName, reason);
        });
        if (isDeleted) { FileStorage.memory_collection_clear(collectionName) }
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
