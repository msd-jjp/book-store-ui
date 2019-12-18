import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IBook } from '../model/model.book';
import { appLocalStorage } from './appLocalStorage';
import Axios, { CancelToken, AxiosInstance, AxiosResponse } from 'axios';
import { getLibraryItem } from '../component/library/libraryViewTemplate';
import { BOOK_TYPES } from '../enum/Book';
import { CmpUtility } from '../component/_base/CmpUtility';

export class BookService extends BaseService {

    get(bookId: string, offline?: boolean): Promise<IAPI_Response<IBook>> {
        if (BaseService.isAppOffline() || offline) {
            let lcl_book: IBook | null = appLocalStorage.findById('clc_book', bookId);
            return new Promise((resolve, reject) => {
                lcl_book ? resolve({ data: lcl_book! }) : reject('not_found');
            });
            // if (lcl_book) {
            //     return new Promise((resolve, reject) => {
            //         resolve({ data: lcl_book! });
            //     });
            // } else {
            //     //reject: put if else into Promise
            // }
        }

        return this.axiosTokenInstance.get(`/books/${bookId}`);
    }

    bookByWriter(data: { book_id: string, writer: string }): Promise<IAPI_ResponseList<IBook>> { // writer || person_id
        return this.search({ limit: 10, skip: 0, filter: data });
    }

    recomended(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, skip: 0, filter: { genre: 'Romance' } });
    }

    newest(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, skip: 0, filter: { tag: 'new' } });
    }

    search(data: { limit: number, skip: number, filter: Object }): Promise<IAPI_ResponseList<IBook>> {
        if (BaseService.isAppOffline()) {
            let lcl_book_list: IBook[] | null = appLocalStorage.search_by_query_book(data);
            lcl_book_list = lcl_book_list || [];
            if (lcl_book_list /* && lcl_book_list.length */) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: lcl_book_list! } });
                });
            }
        }
        return this.axiosTokenInstance.post('/books/_search', data);
    }

    search_phrase(data: { limit: number, skip: number, filter: { search_phrase: string } }): Promise<IAPI_ResponseList<IBook>> {
        if (BaseService.isAppOffline()) {
            let lcl_book_list: IBook[] | null = appLocalStorage.search_by_phrase_book(data);
            lcl_book_list = lcl_book_list || [];
            if (lcl_book_list /* && lcl_book_list.length */) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: lcl_book_list! } });
                });
            }
        }
        return this.axiosTokenInstance.post('/books/search-phrase', data); // axiosInstance
    }

    wishList_add_book(book_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/wish-list', { books: [book_id] });
    }

    wishList_remove_book(book_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/wish-list/remove-books`, { data: { books: [book_id] } });
    }

    wishList_clear(): Promise<any> {
        return this.axiosTokenInstance.delete(`/wish-list`);
    }

    wishList_search(data: { limit: number, skip: number }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post('/wish-list/_search', data);
    }

    downloadFile_DELETE_ME(book_id: string, mainFile: boolean, cancelToken: CancelToken)
        : Promise<IAPI_Response<ArrayBuffer>>
    // : Promise<Uint8Array> 
    {

        return new Promise(async (resolve, reject) => {
            await CmpUtility.waitOnMe(5000);
            // resolve(
            //     this.axiosTokenInstance.post(
            //         '/books/_search',
            //         { limit: 500, offset: 0, filter: {} },
            //         { cancelToken }
            //     )
            // );
            // debugger;
            // this.baseURL = '';
            // this.axiosTokenInstance.defaults.headers['Content-Type'] = 'multipart/form-data';
            const axiosInstance: AxiosInstance = Axios.create({
                baseURL: '',
                headers: { 'Content-Type': 'application/json' }, // application/json  ,  multipart/form-data
                responseType: 'arraybuffer', //'arraybuffer',
            });

            let url = '/reader/book2.output';
            let libItem = getLibraryItem(book_id);
            if (libItem!.book.type === BOOK_TYPES.Audio) {
                url = '/reader/book1.msd';
                // url = '/reader/100MB.zip';
            } else if (libItem!.book.type === BOOK_TYPES.Pdf) {
                url = '/reader/pdf_book.msd';
            }

            resolve(
                axiosInstance.get(
                    // '/reader/book.output',
                    url,
                    { cancelToken }
                )
            );
            // resolve({ data: base64ToBuffer(sampleBookFile) });
        });
    }

    async downloadFile2_DELETE_ME(book_id: string, mainFile: boolean/* , cancelToken: CancelToken */): Promise<IAPI_Response<ArrayBuffer>> {
        // await CmpUtility.waitOnMe(5000);
        debugger;
        this.axiosRequestConfig = {
            baseURL: '', // todo _DELET_EME
            responseType: 'arraybuffer',
            // cancelToken
        };
        let url = '/reader/book2.output';
        let libItem = getLibraryItem(book_id);
        if (libItem!.book.type === BOOK_TYPES.Audio) {
            url = '/reader/book1.msd';
            // url = '/reader/100MB.zip';
        } else if (libItem!.book.type === BOOK_TYPES.Pdf) {
            url = '/reader/pdf_book.msd';
        }
        return this.axiosTokenInstance.get(url);
    }

    async bookFile_detail(book_id: string, mainFile: boolean): Promise<any> {
        if (BaseService.isAppOffline()) {
            return new Promise((res, rej) => { rej({ error: 'app is offline' }); });
        }

        this.axiosRequestConfig = {
            baseURL: '', // todo _DELET_EME
        };
        // this.axiosInstance
        // let url = 'https://book.mazarei.id.ir/reader/book1.msd';
        // let url = '/api/reader/book1.msd';
        // let url = '/reader/book1.msd';
        // let url = 'https://book.mazarei.id.ir/reader/book1.msd';
        let url = '/reader/book2.output';
        let libItem = getLibraryItem(book_id);
        if (libItem!.book.type === BOOK_TYPES.Audio) {
            url = '/reader/book1.msd';
            // url = '/reader/100MB.zip';
        } else if (libItem!.book.type === BOOK_TYPES.Pdf) {
            url = '/reader/pdf_book.msd';
        }
        return this.axiosTokenInstance.head(url);
        // return this.axiosInstance.head(url);
    }

    async bookFile_partial(book_id: string, mainFile: boolean, range: { from: number; to: number }, cancelToken: CancelToken)
        : Promise<IAPI_Response<ArrayBuffer>> {
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
        // this.axiosInstance
        // let url = 'https://book.mazarei.id.ir/reader/book1.msd';
        // let url = '/api/reader/book1.msd';
        // let url = '/reader/book1.msd';
        // let url = 'https://book.mazarei.id.ir/reader/book1.msd';
        let url = '/reader/book2.output';
        let libItem = getLibraryItem(book_id);
        if (libItem!.book.type === BOOK_TYPES.Audio) {
            url = '/reader/book1.msd';
            // url = '/reader/100MB.zip';
        } else if (libItem!.book.type === BOOK_TYPES.Pdf) {
            url = '/reader/pdf_book.msd';
        }
        return this.axiosTokenInstance.get(url);
        // return this.axiosInstance.head(url);
    }

    prepare_book(book_id: string, device_id: string): Promise<IAPI_Response<{ Brief: string; Original: string; }>> {
        return this.axiosTokenInstance.post('/prepare-book', { book_id, device_id });
    }

    // private static bookFile_pre_url = 'https://book.mazarei.id.ir/serve-book-file';
    private static bookFile_pre_url = '/serve-book-file';
    get_file_info(file_id: string): Promise<AxiosResponse<any>> {
        this.axiosRequestConfig = {
            baseURL: '',
        };
        return this.axiosTokenInstance.head(BookService.bookFile_pre_url + '/' + file_id);
    }
    get_file_partial(file_id: string, range: { from: number; to: number }, cancelToken: CancelToken): Promise<IAPI_Response<ArrayBuffer>> {
        this.axiosRequestConfig = {
            baseURL: '',
            headers: { range: `bytes=${range.from}-${range.to}` },
            responseType: 'arraybuffer',
            cancelToken
        };
        return this.axiosTokenInstance.get(BookService.bookFile_pre_url + '/' + file_id);
    }

}
