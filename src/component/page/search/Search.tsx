import React, { Fragment } from 'react';
import { BaseComponent } from '../../_base/BaseComponent';
import { History } from "history";
import { TInternationalization } from '../../../config/setup';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { BookService } from '../../../service/service.book';
import { Localization } from '../../../config/localization/localization';
import { ToastContainer } from 'react-toastify';
import { IBook } from '../../../model/model.book';
import { BOOK_ROLES } from '../../../enum/Book';
import { BtnLoader } from '../../form/btn-loader/BtnLoader';
import { CmpUtility } from '../../_base/CmpUtility';
import { ILibrary } from '../../../model/model.library';
import { ILibrary_schema } from '../../../redux/action/library/libraryAction';
import { calc_read_percent, is_libBook_downloaded } from '../library/libraryViewTemplate';

interface IProps {
    internationalization: TInternationalization;
    history: History;
    match: any;
    library: ILibrary_schema;
}
interface IState {
    bookList: IBook[] | undefined;
    newBookList: IBook[] | undefined;
    bookError: string | undefined;
    // searchQuery: string|undefined,
    pager_offset: number;
    pager_limit: number;
    loadMoreBtnLoader: boolean;
}
class SearchComponent extends BaseComponent<IProps, IState> {
    state = {
        bookList: undefined,
        newBookList: undefined,
        bookError: undefined,
        // searchQuery: undefined,
        pager_offset: 0,
        pager_limit: 10,
        loadMoreBtnLoader: false,
    };
    private _bookService = new BookService();
    searchQuery!: string;

    componentDidMount() {
        this.gotoTop();
        this.searchQuery = this.props.match.params.searchQuery;
        this.fetchBooks();
    }
    componentWillReceiveProps(nextProps: IProps) {
        if (this.props.match.params.searchQuery !== nextProps.match.params.searchQuery) {
            // debugger;
            this.setState(
                {
                    ...this.state,
                    pager_offset: 0,
                    bookList: undefined,
                    // newBookList: undefined,
                },
                () => {
                    this.gotoTop();
                    this.searchQuery = nextProps.match.params.searchQuery;
                    this.fetchBooks();
                }
            );
        }
    }

    async fetchBooks() {
        this.setState({ ...this.state, bookError: undefined, loadMoreBtnLoader: true });

        let res = await this._bookService.search_phrase({
            limit: this.state.pager_limit,
            skip: this.state.pager_offset,
            filter: { search_phrase: this.searchQuery }
        }).catch(error => {
            const errorMsg = this.handleError({ error: error.response, toastOptions: { toastId: 'fetchBooks_error' } });
            this.setState({ ...this.state, bookError: errorMsg.body, loadMoreBtnLoader: false });
        });
        // debugger;
        if (res) {
            if (res.data.result) {
                this.setState({
                    ...this.state,
                    newBookList: res.data.result,
                    bookList: [...this.state.bookList || [], ...res.data.result],
                    loadMoreBtnLoader: false
                });
            }
        }
    }
    gotoBookDetail(bookId: string) {
        this.props.history.push(`/book-detail/${bookId}`);
    }
    book_list_render() {
        return (
            <>
                <div className="book-list-wrapper mt-3__">
                    {(this.state.bookList || []).map((book: IBook, bookIndex) => (
                        <Fragment key={bookIndex}>
                            {this.book_item_render(book)}
                        </Fragment>
                    ))}
                </div>
            </>
        )
    }

    book_item_render(book: IBook) {
        let book_img = CmpUtility.getBook_firstImg(book);
        let writerName = CmpUtility.getBook_role_fisrt_fullName(book, BOOK_ROLES.Writer);
        let libItem = this.getItemFromLibrary_byBookId(book.id);
        let read_percent = '';
        let is_downloaded = false;
        if (libItem) {
            read_percent = calc_read_percent(libItem);
            is_downloaded = is_libBook_downloaded(libItem);
        }

        return (
            <>
                <div className="book-list-item pb-2 mb-2">
                    <div className="row">
                        <div className="col-4" onClick={() => this.gotoBookDetail(book.id)}>
                            <div className="img-scaffolding-container">
                                <img src={CmpUtility.bookSizeImagePath}
                                    className="img-scaffolding" alt="" />

                                <img src={book_img}
                                    alt="book"
                                    className="main-img center-el-in-box"
                                    onError={e => CmpUtility.bookImageOnError(e)}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                        <div className="detail-wrapper col-8 p-align-0">
                            <div className="book-title">{book.title}</div>
                            <span className="book-writer text-muted py-2 small">{writerName}</span>
                            <span className={"book-progress mr-2 small " + (read_percent === '100%' ? 'badge badge-dark' : '')}>
                                {read_percent === '100%' ? Localization.readed_ : read_percent}
                            </span>
                            {/* todo: size */}
                            {/* <span className="book-volume small">789.3 kb</span> */}
                            <i className={"fa fa-check-circle downloaded-icon " + (is_downloaded ? '' : 'd-none')}></i>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    getItemFromLibrary_byBookId(book_id: string): ILibrary | undefined {
        const lib = this.props.library.data.find(lib => lib.book.id === book_id);
        return lib;
    }

    newReleaseBook_render() {
        if (this.state.bookList && (this.state.bookList! || []).length) {
            return (
                <>
                    {this.book_list_render()}
                </>
            );
        } else if (this.state.bookList && !(this.state.bookList! || []).length) {
            return (
                <>
                    <div className="text-center text-warning">{Localization.no_item_found}</div>
                </>
            );

        } else if (this.state.bookError) {
            return (
                <>
                    <div>{this.state.bookError}</div>
                    <div className="cursor-pointer" onClick={() => this.fetchBooks()}>
                        {Localization.retry}&nbsp;<i className="fa fa-refresh"></i>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div>{Localization.loading_with_dots}</div>
                </>
            );
        }
    }

    loadMoreBook_render() {
        if (
            this.state.newBookList && (this.state.newBookList! || []).length
            &&
            !(this.state.pager_limit > (this.state.newBookList! || []).length)
        ) {
            return (
                <>
                    <BtnLoader
                        btnClassName="btn btn-light btn-block text-capitalize mt-4"
                        loading={this.state.loadMoreBtnLoader}
                        onClick={() => this.loadMoreBook()}
                    >
                        {Localization.load_more}
                    </BtnLoader>
                </>
            );
        }
    }
    loadMoreBook() {
        this.setState(
            { ...this.state, pager_offset: this.state.pager_offset + this.state.pager_limit },
            this.fetchBooks
        );
    }

    render() {
        return (
            <>
                <div className="search-wrapper mt-3">
                    {this.newReleaseBook_render()}
                    {this.loadMoreBook_render()}
                </div>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
    }
}

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        library: state.library,
    }
}

export const Search = connect(state2props, dispatch2props)(SearchComponent);
