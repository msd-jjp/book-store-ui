import { ILibrary } from "../../model/model.library";
import { BOOK_TYPES, BOOK_ROLES } from "../../enum/Book";
import React from 'react';
import { CmpUtility } from "../_base/CmpUtility";
import { Localization } from "../../config/localization/localization";
import { appLocalStorage } from "../../service/appLocalStorage";

export function calc_read_percent(item: ILibrary): string {
    let read = 0;
    let total = 0;

    // return '100%';

    if (!item) return '0%';

    if (item.book.type === BOOK_TYPES.Audio) {
        read = item.status.read_duration;
        total = +item.book.duration;

    } else if (item.book.type === BOOK_TYPES.Epub || item.book.type === BOOK_TYPES.Pdf) {
        read = item.status.read_pages;
        total = +item.book.pages;
    }

    if (total) {
        return Math.floor(((read || 0) * 100) / +total) + '%';
    } else {
        return '0%';
    }
}

export function is_libBook_downloaded(item: ILibrary): boolean {
    if (appLocalStorage.findBookMainFileById('mainFile-' + item.book.id))
        return true;
    return false;
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
                    <i className={"fa fa-check-circle downloaded-icon " + (is_libBook_downloaded(item) ? '' : 'd-none')}></i>
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
                <div className={"book-download " + (is_libBook_downloaded(item) ? '' : 'd-none')}>
                    <i className="fa fa-check-circle" />
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
