import { ILibrary } from "../../model/model.library";
import { /* BOOK_TYPES, */ BOOK_ROLES } from "../../enum/Book";
import React from 'react';
import { CmpUtility } from "../_base/CmpUtility";
import { Localization } from "../../config/localization/localization";
import { appLocalStorage } from "../../service/appLocalStorage";
import { Store2 } from "../../redux/store";
import { action_update_downloading_book_file } from "../../redux/action/downloading-book-file";
import { action_set_library_data } from "../../redux/action/library";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { LibraryService } from "../../service/service.library";
import { Utility } from "../../asset/script/utility";
import { READER_FILE_NAME } from "../../webworker/reader-engine/reader-download/reader-download";
import { FILE_STORAGE_KEY } from "../../service/appLocalStorage/FileStorage";

export function calc_read_percent(item: ILibrary): string {
    return Math.floor((item.progress || 0) * 100) + '%';

    // let read = 0;
    // let total = 0;

    // // return '100%';

    // if (!item) return '0%';

    // if (item.book.type === BOOK_TYPES.Audio) {
    //     read = item.status.read_duration;
    //     total = +item.book.duration;

    // } else if (item.book.type === BOOK_TYPES.Epub || item.book.type === BOOK_TYPES.Pdf) {
    //     read = item.status.read_pages;
    //     total = +item.book.pages;
    // }

    // if (total) {
    //     return Math.floor(((read || 0) * 100) / +total) + '%';
    // } else {
    //     return '0%';
    // }
}

export function is_file_downloaded(collectionName: FILE_STORAGE_KEY, fileId: string): boolean {
    return appLocalStorage.checkFileExist(collectionName, fileId);
}

export function is_book_downloaded(book_id: string, mainFile: boolean): boolean {
    // return appLocalStorage.checkBookFileExist(book_id, mainFile);
    // return appLocalStorage.checkFileExist(getBookFileCollectionName(book_id, mainFile), getBookFileId(book_id, mainFile));
    return is_file_downloaded(getBookFileCollectionName(book_id, mainFile), getBookFileId(book_id, mainFile));
}

export async function is_file_downloaded_async(collectionName: FILE_STORAGE_KEY, fileId: string): Promise<boolean> {
    return await appLocalStorage.checkFileExist_async(collectionName, fileId);
}

export async function is_book_downloaded_async(book_id: string, mainFile: boolean): Promise<boolean> {
    // return await appLocalStorage.checkBookFileExist_async(book_id, mainFile);
    // return await appLocalStorage.checkFileExist_async(getBookFileCollectionName(book_id, mainFile), getBookFileId(book_id, mainFile));
    return await is_file_downloaded_async(getBookFileCollectionName(book_id, mainFile), getBookFileId(book_id, mainFile));
}

export function is_file_downloading(collectionName: FILE_STORAGE_KEY, fileId: string): boolean {
    const dbf = Store2.getState().downloading_book_file;
    const d = dbf.find(d => d.fileId === fileId && d.collectionName === collectionName);
    return !!d;
}

export function is_book_downloading(book_id: string, mainFile: boolean): boolean {
    return is_file_downloading(getBookFileCollectionName(book_id, mainFile), getBookFileId(book_id, mainFile));
    // const dbf = Store2.getState().downloading_book_file;
    // const d = dbf.find(d => d.fileId === getBookFileId(book_id, mainFile) && d.collectionName === getBookFileCollectionName(book_id, mainFile));
    // return !!d;
}

export function getBookFileId(book_id: string, mainFile: boolean): string {
    return (mainFile ? 'main_' : 'sample_') + book_id;
}

export function getBookId_from_fileId(fileId: string): string {
    if (fileId.includes('main_')) {
        return fileId.replace('main_', '');
    }
    return fileId.replace('sample_', '');
}

export function getBookFileCollectionName(book_id: string, mainFile: boolean): FILE_STORAGE_KEY.FILE_BOOK_MAIN | FILE_STORAGE_KEY.FILE_BOOK_SAMPLE {
    return mainFile ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE;
}

export function book_downloading_progress(book_id: string, mainFile: boolean): number {
    const dbf = Store2.getState().downloading_book_file;
    const d = dbf.find(d => d.fileId === getBookFileId(book_id, mainFile) && d.collectionName === getBookFileCollectionName(book_id, mainFile));
    return d ? d.progress : 0;
}

export function book_download_size(book_id: string, mainFile: boolean): number | undefined {
    const dbf = Store2.getState().downloading_book_file;
    const d = dbf.find(d => d.fileId === getBookFileId(book_id, mainFile) && d.collectionName === getBookFileCollectionName(book_id, mainFile));
    return d ? d.size : undefined;
}

export function is_libBook_downloaded(item: ILibrary): boolean {
    return is_book_downloaded(item.book.id, true);
}

export function is_libBook_downloading(item: ILibrary): boolean {
    return is_book_downloading(item.book.id, true);
}

export function libBook_downloading_progress(item: ILibrary): number {
    return book_downloading_progress(item.book.id, true);
}

export function libBook_download_size(item: ILibrary): number | undefined {
    return book_download_size(item.book.id, true);
}

export function isReaderEngineDownloading(): boolean {
    // const ding_wasm = is_book_downloading(READER_FILE_NAME.WASM_BOOK_ID, true);
    // const ding_reader = is_book_downloading(READER_FILE_NAME.READER2_BOOK_ID, true);
    const ding_wasm = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
    const ding_reader = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
    return ding_wasm || ding_reader;
}

export async function isReaderEngineDownloaded_async(): Promise<boolean> {
    // const ded_wasm = await is_book_downloaded_async(READER_FILE_NAME.WASM_BOOK_ID, true);
    // const ded_reader = await is_book_downloaded_async(READER_FILE_NAME.READER2_BOOK_ID, true);
    const ded_wasm = await is_file_downloaded_async(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
    const ded_reader = await is_file_downloaded_async(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
    return ded_wasm && ded_reader;
}

export function toggle_book_download(book_id: string, mainFile: boolean): void {
    const isDownloading = is_book_downloading(book_id, mainFile);
    let dbf = [...Store2.getState().downloading_book_file];

    if (isDownloading) {
        const new_dbf = dbf.filter(d => !(d.fileId === getBookFileId(book_id, mainFile) && d.collectionName === getBookFileCollectionName(book_id, mainFile)));
        new_dbf.push({
            fileId: getBookFileId(book_id, mainFile),
            collectionName: getBookFileCollectionName(book_id, mainFile),
            status: 'stop',
            progress: 0
        });
        dbf = new_dbf;
    } else {
        dbf.push({
            fileId: getBookFileId(book_id, mainFile),
            collectionName: getBookFileCollectionName(book_id, mainFile),
            status: 'start',
            progress: 0
        });
    }

    Store2.dispatch(action_update_downloading_book_file(dbf));
    CmpUtility.refreshView();
}

export function toggle_libBook_download(item: ILibrary): void {
    toggle_book_download(item.book.id, true);
}

export function collection_download(title: string) {
    const col_list = Store2.getState().collection.data;
    const target_col = col_list.find(c => c.title === title);
    if (!target_col) return;

    const book_not_down_list: string[] = [];
    target_col.books.forEach(b => {
        if (!is_book_downloaded(b.id, true) && !is_book_downloading(b.id, true)) {
            book_not_down_list.push(b.id);
        }
    });

    let dbf = [...Store2.getState().downloading_book_file];
    book_not_down_list.forEach(id => {
        dbf.push({
            // book_id: id,
            // mainFile: true,
            fileId: getBookFileId(id, true),
            collectionName: getBookFileCollectionName(id, true),
            status: 'start',
            progress: 0
        });
    });
    Store2.dispatch(action_update_downloading_book_file(dbf));
    CmpUtility.refreshView();
}

export function libraryItem_viewList_render(
    item: ILibrary,
    onItemSelect: (item: ILibrary) => any,
    isItemSelected: (item: ILibrary) => any
): JSX.Element {
    const book_img = CmpUtility.getBook_firstImg(item.book);
    // const writerName = CmpUtility.getBook_firstWriterFullName(item.book);
    const writerName = CmpUtility.getBook_role_fisrt_fullName(item.book, BOOK_ROLES.Writer);
    const read_percent = calc_read_percent(item);
    const is_downloaded = is_libBook_downloaded(item);
    const is_downloading = is_downloaded ? false : is_libBook_downloading(item);
    const downloading_progress = is_downloading ? libBook_downloading_progress(item) : '';
    const downloading_progress_str = (downloading_progress || downloading_progress === 0) ? downloading_progress : '';
    const download_size = is_downloading ? libBook_download_size(item) : '';
    const download_size_str = (download_size || download_size === 0) ? Utility.byteFileSize(download_size) : '';

    return (
        <div className="view-list-item pb-2 mb-2" >
            <div className="item-wrapper row" onClick={() => onItemSelect(item)}>
                <div className="col-4">
                    <div className="img-scaffolding-container">
                        <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />

                        <img src={book_img}
                            alt="book"
                            className="lib-img-- main-img center-el-in-box"
                            onError={e => CmpUtility.bookImageOnError(e)}
                            loading="lazy"
                        />
                    </div>
                </div>
                <div className="detail-wrapper col-8 p-align-0">
                    <div className="book-title">{item.book.title}</div>
                    <span className="book-writer text-muted py-2 small">{writerName}</span>
                    <span className={"book-progress mr-2 small " + (read_percent === '100%' ? 'badge badge-dark' : '')}>
                        {read_percent === '100%' ? Localization.readed_ : read_percent}
                    </span>
                    {/* todo: size */}
                    {/* <span className="book-volume small">789.3 kb</span> */}
                    <span className={"book-volume small " + (!download_size_str ? 'd-none' : '')}>{download_size_str}</span>
                    {/* <i className={"fa fa-check-circle downloaded-icon " + (is_downloaded ? '' : 'd-none')}></i> */}
                    {
                        is_downloaded ?
                            <i className="fa fa-check-circle downloaded-icon"></i>
                            : is_downloading ?
                                <i className="fa downloaded-icon downloading">{downloading_progress_str}<small>%</small></i> : ''
                    }
                    {/* <i className={
                        "fa fa-check-circle-- downloaded-icon "
                        + (is_downloaded ? 'fa-check-circle' : ' ')
                        + (is_downloading ? 'fa-refresh__fa-spin downloading' : ' ')
                    } >{downloading_progress_str}</i> */}
                </div>

                <div className={
                    "selected-item-wrapper "
                    + (isItemSelected(item) ? '' : 'd-none')
                }>
                    <div className="selected-icon-wrapper">
                        <i className="icon fa fa-check"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function libraryItem_viewGrid_render(
    item: ILibrary,
    onItemSelect: (item: ILibrary) => any,
    isItemSelected: (item: ILibrary) => any
): JSX.Element {
    const book_img = CmpUtility.getBook_firstImg(item.book);
    const read_percent = calc_read_percent(item);
    const is_downloaded = is_libBook_downloaded(item);
    const is_downloading = is_downloaded ? false : is_libBook_downloading(item);
    const downloading_progress = is_downloading ? libBook_downloading_progress(item) : '';
    const downloading_progress_str = (downloading_progress || downloading_progress === 0) ? downloading_progress : '';

    return (
        <div className="col-4 p-align-inverse-0 mb-3">
            <div className="item-wrapper" onClick={() => onItemSelect(item)}>
                <div className="img-scaffolding-container">
                    <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />

                    <img src={book_img}
                        alt="book"
                        className="lib-img-- main-img center-el-in-box"
                        onError={e => CmpUtility.bookImageOnError(e)}
                        loading="lazy"
                    />
                </div>

                <div className={"book-progress-state " + (read_percent === '100%' ? 'progress-complete' : '')}>
                    <div className="bp-state-number">
                        <div className="text">{read_percent}</div>
                    </div>
                    <div className="bp-state-arrow" />
                    <div className="progress-complete-label">{Localization.readed_}</div>
                </div>
                {/* <div className={"book-download " + (is_downloaded || is_downloading ? '' : 'd-none')}> */}
                <div className="book-download">
                    {
                        is_downloaded ?
                            <i className="fa fa-check-circle"></i>
                            : is_downloading ?
                                <i className="fa downloading">{downloading_progress_str}<small>%</small></i> : ''
                    }
                    {/* <i className={
                        "fa fa-check-circle-- "
                        + (is_downloaded ? 'fa-check-circle' : ' ')
                        + (is_downloading ? 'fa-refresh__fa-spin downloading' : ' ')
                    } >{downloading_progress_str}</i> */}
                </div>

                <div className={
                    "selected-item-wrapper "
                    + (isItemSelected(item) ? '' : 'd-none')
                }>
                    <div className="selected-icon-wrapper">
                        <i className="icon fa fa-check"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function getLibraryItem(book_id: string): ILibrary | undefined {
    const _libraryItem = Store2.getState().library.data.find(lib => lib.book.id === book_id);
    if (_libraryItem) return { ..._libraryItem };
}

export function markAsRead_libraryItem(book_id: string): void {
    updateLibraryItem_progress(book_id, 1);
}

export function updateLibraryItem_progress(book_id: string, progress: number) {
    updateLibraryItem_progress_client(book_id, progress);
    updateLibraryItem_progress_server(book_id, progress);
}

export function updateLibraryItem_progress_client(book_id: string, progress: number) {
    const libData = [...Store2.getState().library.data];
    const _lib = libData.find(lib => lib.book.id === book_id);
    if (!_lib) return;

    _lib.progress = progress;
    Store2.dispatch(action_set_library_data(libData));
}

export function updateLibraryItem_progress_server(book_id: string, progress: number) {
    if (Store2.getState().network_status === NETWORK_STATUS.OFFLINE) return;
    const libItem = getLibraryItem(book_id);
    if (!libItem) return;

    const _libraryService = new LibraryService();
    _libraryService.update_progress(libItem.id, progress).catch(e => { });
}
