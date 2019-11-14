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

export function is_book_downloaded(book_id: string, mainFile: boolean): boolean {
    // if (CmpUtility.is_book_downloaded_history_check(book_id, mainFile) !== undefined)
    //     return CmpUtility.is_book_downloaded_history_check(book_id, mainFile)!;
    return appLocalStorage.checkBookFileExist(book_id, mainFile);

    // let exist = false;
    // if (mainFile) {
    //     appLocalStorage.findBookMainFileById(book_id) ? exist = true : exist = false;

    // } else {
    //     appLocalStorage.findBookSampleFileById(book_id) ? exist = true : exist = false;
    // }

    // // CmpUtility.is_book_downloaded_history_save(book_id, mainFile, exist);
    // return exist;
}

export function is_book_downloading(book_id: string, mainFile: boolean): boolean {
    const dbf = Store2.getState().downloading_book_file;
    const d = dbf.find(d => d.book_id === book_id && d.mainFile === mainFile);
    return !!d;
}

export function is_libBook_downloaded(item: ILibrary): boolean {
    return is_book_downloaded(item.book.id, true);
}

export function is_libBook_downloading(item: ILibrary): boolean {
    return is_book_downloading(item.book.id, true);
}

export function toggle_book_download(book_id: string, mainFile: boolean): void {
    const isDownloading = is_book_downloading(book_id, mainFile);
    let dbf = [...Store2.getState().downloading_book_file];

    if (isDownloading) {
        const new_dbf = dbf.filter(d => !(d.book_id === book_id && d.mainFile === mainFile));
        new_dbf.push({
            book_id: book_id,
            mainFile: mainFile,
            status: 'stop'
        });
        dbf = new_dbf;
    } else {
        dbf.push({
            book_id: book_id,
            mainFile: mainFile,
            status: 'start'
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
            book_id: id,
            mainFile: true,
            status: 'start'
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
    const is_downloading = is_libBook_downloading(item);

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
                    {/* <i className={"fa fa-check-circle downloaded-icon " + (is_downloaded ? '' : 'd-none')}></i> */}
                    <i className={
                        "fa fa-check-circle-- downloaded-icon "
                        + (is_downloaded ? 'fa-check-circle' : ' ')
                        + (is_downloading ? 'fa-refresh fa-spin' : ' ')
                    } />
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
    const is_downloading = is_libBook_downloading(item);

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
                    <i className={
                        "fa fa-check-circle-- "
                        + (is_downloaded ? 'fa-check-circle' : ' ')
                        + (is_downloading ? 'fa-refresh fa-spin' : ' ')
                    } />
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
