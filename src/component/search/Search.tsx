import React, { Fragment } from 'react';
import { BaseComponent } from '../_base/BaseComponent';
import { History } from "history";
import { TInternationalization } from '../../config/setup';
import { IToken } from '../../model/model.token';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { BookService } from '../../service/service.book';
import { Localization } from '../../config/localization/localization';
import { ToastContainer } from 'react-toastify';
import { IBook } from '../../model/model.book';
import { BOOK_ROLES } from '../../enum/Book';
import { BtnLoader } from '../form/btn-loader/BtnLoader';

interface IProps {
    internationalization: TInternationalization;
    history: History;
    token: IToken;
    match: any;
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
        // this._bookService.setToken(this.props.token);
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
    /* componentDidUpdate(a: any, b: any, c: any) {
        debugger;
    } */

    async fetchBooks() {
        this.setState({ ...this.state, bookError: undefined, loadMoreBtnLoader: true });

        let res = await this._bookService.search_phrase({
            limit: this.state.pager_limit,
            offset: this.state.pager_offset,
            filter: { search_phrase: this.searchQuery }
        }).catch(error => {

            let errorMsg = this.handleError({ error: error.response });
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
        let book_img =
            (book.images && book.images.length && this.getImageUrl(book.images[0]))
            ||
            this.defaultBookImagePath;
        let writerList = book.roles.filter(r => r.role === BOOK_ROLES.Writer);
        // let name = writerList && writerList.length && writerList[0].person.name;
        // let last_name = writerList && writerList.length && writerList[0].person.last_name;
        let writerName = ''; // name + " " + last_name;
        if(writerList && writerList.length){
            writerName = this.getPersonFullName(writerList[0].person);
        }
        

        return (
            <>
                <div className="book-list-item pb-2 mb-2">
                    <div className="row">
                        <div className="img-wrapper col-4" onClick={() => this.gotoBookDetail(book.id)}>
                            <div>
                                <img src={book_img} alt="book" onError={e => this.bookImageOnError(e)} />
                            </div>
                        </div>
                        <div className="detail-wrapper col-8 p-align-0">
                            <div className="book-title">{book.title}</div>
                            <span className="book-writer text-muted py-2 small">{writerName}</span>
                            <span className="book-progress mr-2 small">7%</span>
                            {/* todo: size */}
                            {/* <span className="book-volume small">789.3 kb</span> */}
                            <i className="fa fa-check-circle downloaded-icon"></i>
                        </div>
                    </div>
                </div>
            </>
        )
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
                    <div onClick={() => this.fetchBooks()}>{Localization.retry}</div>
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
                    // disabled={!this.state.isFormValid}
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
        token: state.token
    }
}

export const Search = connect(state2props, dispatch2props)(SearchComponent);
