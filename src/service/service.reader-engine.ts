import { BaseService, IAPI_Response } from './service.base';
import Axios, { CancelToken } from 'axios';
import { READER_FILE_NAME } from '../webworker/reader-engine/reader-download/reader-download';

export class ReaderEngineService extends BaseService {

    async file_detail(fileType: READER_FILE_NAME): Promise<any> {
        if (BaseService.isAppOffline()) {
            return new Promise((res, rej) => { rej({ error: 'app is offline' }); });
        }
        this.axiosRequestConfig = {
            baseURL: '', // todo _DELET_EME
        };
        let url = '/reader/_reader2.js';
        if (fileType === READER_FILE_NAME.WASM_BOOK_ID) {
            url = '/reader/_reader.wasm';
        }
        // debugger;
        // return this.axiosTokenInstance.head(url);
        const ai = Axios.create(this.axiosRequestConfig)
        return ai.head(url);
    }

    async file_partial(
        fileType: READER_FILE_NAME,
        range: { from: number; to: number },
        cancelToken: CancelToken
    ): Promise<IAPI_Response<ArrayBuffer>> {
        if (BaseService.isAppOffline()) {
            return new Promise((res, rej) => { rej({ error: 'app is offline' }); });
        }

        this.axiosRequestConfig = {
            baseURL: '', // todo _DELET_EME
            headers: {
                range: `bytes=${range.from}-${range.to}`
            },
            responseType: 'arraybuffer',
            cancelToken
        };

        let url = '/reader/_reader2.js';
        if (fileType === READER_FILE_NAME.WASM_BOOK_ID) {
            url = '/reader/_reader.wasm';
        }
        // debugger;
        return this.axiosTokenInstance.get(url);
    }

}
