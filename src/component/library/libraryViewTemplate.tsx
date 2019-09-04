import { ILibrary } from "../../model/model.library";
import { BOOK_TYPES, BOOK_ROLES } from "../../enum/Book";
import { IPerson } from "../../model/model.person";
import React from 'react';
import { IBook } from "../../model/model.book";

const image_pre_url = '/api/serve-files';
const defaultBookImagePath = "/static/media/img/icon/default-book.png";

function getImageUrl(imageId: string): string {
    return image_pre_url + '/' + imageId;
}

function imageOnError(e: any, defaultImagePath: string) {
    if (e.target.src !== window.location.origin + defaultImagePath) {
        e.target.src = defaultImagePath;
    }
}

function bookImageOnError(e: any) {
    return imageOnError(e, "/static/media/img/icon/broken-book.png");
}

function getPersonFullName(person: IPerson): string {
    let name = person.name || '';
    let last_name = person.last_name || '';
    name = name ? name + ' ' : '';
    return (name + last_name).trim();
}

function getBook_firstImg(book: IBook): string {
    const img_path =
        (book.images && book.images.length && getImageUrl(book.images[0]))
        ||
        defaultBookImagePath;
    return img_path;
}

function getBook_firstWriterFullName(book: IBook): string {
    const writerList = book.roles.filter(
        r => r.role === BOOK_ROLES.Writer
    );

    let writerName = '';
    if (writerList && writerList.length && writerList[0].person) {
        writerName = getPersonFullName(writerList[0].person);
    }
    return writerName;
}

export function calc_read_percent(item: ILibrary): string {
    let read = 0;
    let total = 0;

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

export function libraryItem_viewList_render(
    item: ILibrary,
    onItemSelect: (item: ILibrary) => any,
    isItemSelected: (item: ILibrary) => any
): JSX.Element {
    const book_img = getBook_firstImg(item.book);
    const writerName = getBook_firstWriterFullName(item.book);

    return (
        <div className="view-list-item pb-2 mb-2" >
            <div className="item-wrapper row" onClick={() => onItemSelect(item)}>
                <div className="img-wrapper col-4">
                    <div className="img-container__">
                        <img src={book_img} alt="book"
                            onError={e => bookImageOnError(e)} />
                    </div>
                </div>
                <div className="detail-wrapper col-8 p-align-0">
                    <div className="book-title">{item.book.title}</div>
                    <span className="book-writer text-muted py-2 small">{writerName}</span>
                    <span className="book-progress mr-2 small">{calc_read_percent(item)}</span>
                    {/* todo: size */}
                    {/* <span className="book-volume small">789.3 kb</span> */}
                    <i className="fa fa-check-circle downloaded-icon"></i>
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
    const book_img = getBook_firstImg(item.book);

    return (
        <div className="col-4 p-align-inverse-0 mb-3">
            <div className="item-wrapper" onClick={() => onItemSelect(item)}>
                <img src={book_img}
                    alt="book"
                    className="library-grid-book-show-- lib-img"
                    onError={e => bookImageOnError(e)} />

                <div className="book-progress-state">
                    <div className="bp-state-number">
                        <div className="text">{calc_read_percent(item)}</div>
                    </div>
                    <div className="bp-state-arrow" />
                </div>
                <div className="book-download">
                    <i className="fa fa-check" />
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
