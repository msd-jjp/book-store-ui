import { isReaderEngineDownloaded_async, is_file_downloaded_async, is_file_downloading } from "../../../component/library/libraryViewTemplate";
import { Store2 } from "../../../redux/store";
import { action_update_downloading_book_file } from "../../../redux/action/downloading-book-file";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { WasmWorkerHandler } from "../MsdBook";
import { PartialDownload } from "../../../component/book-file-download/PartialDownload";
import { ReaderEngineService } from "../../../service/service.reader-engine";
import { action_update_reader_engine } from "../../../redux/action/reader-engine";
import { FILE_STORAGE_KEY } from "../../../service/appLocalStorage/FileStorage";

/** save wasm & reader2.js files as "book main" */

export enum READER_FILE_NAME {
    WASM_BOOK_ID = 'WASM_BOOK_ID',
    READER2_BOOK_ID = 'READER2_BOOK_ID',
}

export abstract class ReaderDownload {
    private static _readerEngineService = new ReaderEngineService();

    static async downloadReaderFiles() {
        // debugger;
        // const ded_wasm = await is_book_downloaded_async(READER_FILE_NAME.WASM_BOOK_ID, true);
        // const ded_reader = await is_book_downloaded_async(READER_FILE_NAME.READER2_BOOK_ID, true);
        // const ding_wasm = is_book_downloading(READER_FILE_NAME.WASM_BOOK_ID, true);
        // const ding_reader = is_book_downloading(READER_FILE_NAME.READER2_BOOK_ID, true);

        const ded_wasm = await is_file_downloaded_async(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
        const ded_reader = await is_file_downloaded_async(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
        const ding_wasm = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
        const ding_reader = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);

        if ((!ded_wasm && !ding_wasm) || (!ded_reader && !ding_reader)) {
            const dbf = [...Store2.getState().downloading_book_file];
            //todo: remove current donloading & insert after these files.

            if (!ded_reader && !ding_reader) {
                dbf.unshift({
                    fileId: READER_FILE_NAME.READER2_BOOK_ID,
                    collectionName: FILE_STORAGE_KEY.READER_ENGINE,
                    status: 'start',
                    progress: 0
                });

            }
            if (!ded_wasm && !ding_wasm) {
                dbf.unshift({
                    fileId: READER_FILE_NAME.WASM_BOOK_ID,
                    collectionName: FILE_STORAGE_KEY.READER_ENGINE,
                    status: 'start',
                    progress: 0
                });

            }

            Store2.dispatch(action_update_downloading_book_file(dbf));

        } else if (!ding_wasm || !ding_reader) { //  else if (!ding_wasm && !ding_reader)
            //todo: check head --> if change --> delete & download again
            // debugger;
            const current_ETag_reader = appLocalStorage.find_eTagById(
                PartialDownload.get_bookFile_ETag_id(READER_FILE_NAME.READER2_BOOK_ID, true)
            );
            const current_ETag_wasm = appLocalStorage.find_eTagById(
                PartialDownload.get_bookFile_ETag_id(READER_FILE_NAME.WASM_BOOK_ID, true)
            );
            // debugger;

            const res_reader = await ReaderDownload._readerEngineService
                .file_detail(READER_FILE_NAME.READER2_BOOK_ID).catch(e => {
                    // debugger;
                    //todo: try again.
                });

            const res_wasm = await ReaderDownload._readerEngineService
                .file_detail(READER_FILE_NAME.WASM_BOOK_ID).catch(e => {
                    // debugger;
                    //todo: try again.
                });

            // debugger;
            let res_reader_etag: string = '';
            let res_wasm_etag: string = '';
            if (res_reader) res_reader_etag = res_reader.headers['etag'];
            if (res_wasm) res_wasm_etag = res_wasm.headers['etag'];
            // debugger;

            if (
                (!current_ETag_wasm || res_wasm_etag !== current_ETag_wasm.eTag) ||
                (!current_ETag_reader || res_reader_etag !== current_ETag_reader.eTag)
            ) {
                const dbf = [...Store2.getState().downloading_book_file];
                //todo: remove current donloading & insert after these files.

                if ((!current_ETag_reader || res_reader_etag !== current_ETag_reader.eTag) && !ding_reader) {
                    dbf.unshift({
                        fileId: READER_FILE_NAME.READER2_BOOK_ID,
                        collectionName: FILE_STORAGE_KEY.READER_ENGINE,
                        status: 'start',
                        progress: 0
                    });
                }
                if ((!current_ETag_wasm || res_wasm_etag !== current_ETag_wasm.eTag) && !ding_wasm) {
                    dbf.unshift({
                        fileId: READER_FILE_NAME.WASM_BOOK_ID,
                        collectionName: FILE_STORAGE_KEY.READER_ENGINE,
                        status: 'start',
                        progress: 0
                    });
                }

                Store2.dispatch(action_update_downloading_book_file(dbf));
            }
        }

        // debugger;
        ReaderDownload.createWorkerAfterDownload();
    }

    private static async initWorker(): Promise<Worker> {
        // const wasmFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.WASM_BOOK_ID);
        // const readerFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.READER2_BOOK_ID);

        const wasmFile = await appLocalStorage.getFileById(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
        const readerFile = await appLocalStorage.getFileById(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
        // debugger;

        const readerFile_string = new TextDecoder("utf-8").decode(readerFile);
        const blob = ReaderDownload.createWorkerContent(readerFile_string);

        const w = new Worker(blob); // "/reader/reader2.js"

        // debugger;
        w.postMessage({ bin: wasmFile });
        w.postMessage({ target: 'worker-init' });
        return new Promise((res, rej) => {
            w.onmessage = (msg) => {
                if (msg.data.webasembely_inited) {
                    res(w);
                }
                if (msg.data.abort) {
                    rej(msg.data.what);
                }
            }
        });
    }
    private static _readerWasmWorkerHandler: WasmWorkerHandler | undefined;
    /* static async getReaderWorkerHandler__(): Promise<WasmWorkerHandler | undefined> {

    } */
    static async getReaderWorkerHandler(): Promise<WasmWorkerHandler | undefined> {
        if (ReaderDownload._readerWasmWorkerHandler) return ReaderDownload._readerWasmWorkerHandler;

        let ww: WasmWorkerHandler | undefined;

        try {
            const w = await ReaderDownload.initWorker();

            let ww = new WasmWorkerHandler(w);
            ReaderDownload._readerWasmWorkerHandler = ww;

            Store2.dispatch(action_update_reader_engine({ status: 'inited' }));

        } catch (e) {
            Store2.dispatch(action_update_reader_engine({ status: 'failed' }));
        }

        return ww;
    }
    private static createWorkerContent(content: string) {
        let blob;
        if (Blob) {
            blob = new Blob([content], { type: 'application/javascript' });
        } else {
            let BlobBuilder = (window as any).BlobBuilder || (window as any).WebKitBlobBuilder || (window as any).MozBlobBuilder;
            blob = new BlobBuilder();
            blob.append(content);
            blob = blob.getBlob();
        }
        return URL.createObjectURL(blob);
    }

    static resetReaderWorkerHandler(): void {
        debugger;
        ReaderDownload._readerWasmWorkerHandler = undefined;
    }
    static checkReaderWorkerHandler(): boolean {
        if (ReaderDownload._readerWasmWorkerHandler !== undefined) return true;
        return false;
    }

    private static _createWorkerAfterDownload_isRuning = false;
    static async createWorkerAfterDownload() {
        if (ReaderDownload._createWorkerAfterDownload_isRuning) return;
        ReaderDownload._createWorkerAfterDownload_isRuning = true;

        await ReaderDownload.try_createWorkerAfterDownload();

        ReaderDownload._createWorkerAfterDownload_isRuning = false;
    }

    // private static _try_createWorkerAfterDownload_timer: any;
    private static async try_createWorkerAfterDownload() {
        const is_re_d_ed = await isReaderEngineDownloaded_async();

        if (is_re_d_ed && ReaderDownload.checkReaderWorkerHandler() === false) {
            // debugger;
            try {
                await ReaderDownload.getReaderWorkerHandler();
            } catch (e) {
                // debugger;
            }

        } else if (Store2.getState().reader_engine.status === 'inited' && ReaderDownload.checkReaderWorkerHandler() === true) {
            debugger;
        } else {
            // debugger;
            setTimeout(ReaderDownload.try_createWorkerAfterDownload, 1000);
        }
    }

}