import { /* is_book_downloaded, */ is_book_downloading, is_book_downloaded_async } from "../../../component/library/libraryViewTemplate";
import { Store2 } from "../../../redux/store";
import { action_update_downloading_book_file } from "../../../redux/action/downloading-book-file";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { WasmWorkerHandler } from "../MsdBook";

/** save wasm & reader2.js files as "book main" */

export enum READER_FILE_NAME {
    WASM_BOOK_ID = 'WASM_BOOK_ID',
    READER2_BOOK_ID = 'READER2_BOOK_ID',
}

export abstract class ReaderDownload {

    static async downloadReaderFiles() {
        // debugger;
        const ded_wasm = await is_book_downloaded_async(READER_FILE_NAME.WASM_BOOK_ID, true);
        const ded_reader = await is_book_downloaded_async(READER_FILE_NAME.READER2_BOOK_ID, true);
        const ding_wasm = is_book_downloading(READER_FILE_NAME.WASM_BOOK_ID, true);
        const ding_reader = is_book_downloading(READER_FILE_NAME.READER2_BOOK_ID, true);

        if ((!ded_wasm && !ding_wasm) || (!ded_reader && !ding_reader)) {
            const dbf = [...Store2.getState().downloading_book_file];
            //todo: remove current donloading & insert after these files.

            if (!ded_reader && !ding_reader) {
                dbf.unshift({
                    book_id: READER_FILE_NAME.READER2_BOOK_ID,
                    mainFile: true,
                    status: 'start',
                    progress: 0
                });

            }
            if (!ded_wasm && !ding_wasm) {
                dbf.unshift({
                    book_id: READER_FILE_NAME.WASM_BOOK_ID,
                    mainFile: true,
                    status: 'start',
                    progress: 0
                });

            }

            Store2.dispatch(action_update_downloading_book_file(dbf));

        } else {
            //todo: check head --> if change --> delete & download again
        }

        // debugger;
    }

    private static _readerWasmWorkerHandler: WasmWorkerHandler | undefined;
    static async getReaderWorkerHandler(): Promise<WasmWorkerHandler> {
        if (ReaderDownload._readerWasmWorkerHandler) return ReaderDownload._readerWasmWorkerHandler;

        const wasmFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.WASM_BOOK_ID);
        const readerFile = await appLocalStorage.findBookMainFileById(READER_FILE_NAME.READER2_BOOK_ID);
        // debugger;

        const readerFile_string = new TextDecoder("utf-8").decode(readerFile);
        const blob = ReaderDownload.createWorkerContent(readerFile_string);

        const w = new Worker(blob); // "/reader/reader2.js"
        w.postMessage({ bin: wasmFile });
        const ww = new WasmWorkerHandler(w);
        ReaderDownload._readerWasmWorkerHandler = ww;

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

}