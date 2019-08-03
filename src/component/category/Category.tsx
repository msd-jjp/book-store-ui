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
import Rating from 'react-rating';
import { IBook } from '../../model/model.book';
import { BOOK_ROLES } from '../../enum/Book';
import { ToastContainer } from 'react-toastify';
import { IAPI_ResponseList } from '../../service/service.base';
import { IUser } from '../../model/model.user';

export type category_routeParam_categoryType = 'tag' | 'genre' | 'custom';

interface IProps {
    internationalization: TInternationalization;
    history: History;
    token: IToken;
    match: any;
    logged_in_user: IUser | null;
}
interface IState {
    categoryType: category_routeParam_categoryType | undefined;
    categoryTitle: string | undefined;
    categoryBookList: IBook[] | undefined;
    categoryBookError: string | undefined;
    pager_offset: number;
    pager_limit: number;
}

class CategoryComponent extends BaseComponent<IProps, IState>{
    state = {
        categoryType: undefined,
        categoryTitle: undefined,
        categoryBookList: undefined,
        categoryBookError: undefined,
        pager_offset: 0,
        pager_limit: 10
    };
    private _bookService = new BookService();
    // searchType!: 'tag' | 'genre';
    // searchValue!: string;

    componentDidMount() {
        this.gotoTop();
        this._bookService.setToken(this.props.token);
        // this.searchType = this.props.match.params.searchType;
        // this.searchValue = this.props.match.params.searchValue;
        this.setState({
            ...this.state,
            categoryType: this.props.match.params.searchType,
            categoryTitle: this.props.match.params.searchValue,
        }, this.fetchCategoryBooks);
    }
    async fetchCategoryBooks() {
        // todo: wait 500ms if no res --> setState "categoryBookList: undefined"
        this.setState({ ...this.state, categoryBookError: undefined, categoryBookList: undefined });
        let searchRequest;

        if (this.state.categoryType === 'custom' && this.state.categoryTitle === 'wishlist') {
            searchRequest = this.fetch_category_custom_wishlist();
        } else {
            let filter: any = {};
            filter[this.state.categoryType!] = this.state.categoryTitle;
            searchRequest = this._bookService.search({
                limit: this.state.pager_limit, offset: this.state.pager_offset, filter: filter
            });
        }

        let res = await searchRequest.catch(error => {
            let errorMsg = this.handleError({ error: error.response });
            this.setState({ ...this.state, categoryBookError: errorMsg.body });
        });

        if (res) {
            if (res.data.result) {
                this.setState({ ...this.state, categoryBookList: res.data.result });
            }
        }
    }
    fetch_category_custom_wishlist(): Promise<IAPI_ResponseList<IBook>> {
        /* return this._bookService.wishList_search({
            limit: this.state.pager_limit, offset: this.state.pager_offset
        }); */

        if (this.props.logged_in_user && this.props.logged_in_user.person.wish_list) {
            let w_list = this.props.logged_in_user.person.wish_list.slice(this.state.pager_offset, this.state.pager_limit);
            if (w_list) {
                return new Promise((res, rej) => {
                    res({ data: { result: w_list } });
                });
            }
        }
        return new Promise((res, rej) => {
            res({ data: { result: [] } });
        });
    }
    gotoBookDetail(bookId: string) {
        this.props.history.push(`/book-detail/${bookId}`);
    }
    card_render(book: IBook, bookIndex: any) {
        let book_img =
            (book.images && book.images.length && this.getImageUrl(book.images[0]))
            ||
            this.defaultBookImagePath;
        let writerList = book.roles.filter(r => r.role === BOOK_ROLES.Writer);
        let name = writerList && writerList.length && writerList[0].person.name;
        let last_name = writerList && writerList.length && writerList[0].person.last_name;
        let writerName = name + " " + last_name;

        let pressList: IBook['roles'] = book.roles.filter(
            r => r.role === BOOK_ROLES.Press
        );
        let first_press: IBook['roles'][0];
        let first_press_fullname;
        if (pressList && pressList.length) {
            first_press = pressList[0];
            first_press_fullname = (first_press.person.name || '') + ' ' + (first_press.person.last_name || '');
        }


        return (
            <>

                <div className="card-pattern tablet-hide kc-four-columns">
                    <div className="kc-rank-card-section-one">
                        <div className="kc-rank-card-rank-section">
                            <div className="kc-rank-card-rank">
                                {bookIndex + this.state.pager_offset + 1}
                            </div>
                        </div>
                        <div className="kc-book-title-img-section">
                            <div className="kc-book-title-img" onClick={() => this.gotoBookDetail(book.id)}>
                                <img src={book_img} alt="book" onError={e => this.bookImageOnError(e)} />
                            </div>
                        </div>
                    </div>
                    <div className="kc-rank-card-metadata">
                        <div className="metadata-card">
                            {/* <div className="kc-wol">42 weeks on the list</div> */}
                            <div className={book.title}>
                                {book.title}
                            </div>
                            <div className="kc-rank-card-author" title={writerName}>
                                {Localization.by_writerName} {writerName}
                            </div>
                            <div className="kc-rank-card-publisher" title={first_press_fullname}>
                                <span className="text-uppercase">{Localization.publisher}</span>
                                : {first_press_fullname}
                            </div>
                            {/* <div className="kc-rank-card-agent" title="Russell Galen">
                                <span className="text-uppercase">{Localization.agent}</span>
                                : {'Russell Galen'}
                            </div> */}
                            <div className="kc-rank-card-badge">
                            </div>
                        </div>
                    </div>
                    <div className="kc-rank-card-bar top-rated">
                        <div className="kc-data-story-content">
                            <div className="kc-data-story-mini-content">
                                <div className="kc-mini-data-story-heading-container">
                                    <div className="data-story-mini-icon data-story-icon-primary"></div>
                                    {/* <span className="kc-rank-card-bar-heading">{Localization.customer_reviews}</span> */}
                                    <span className="kc-rank-card-bar-heading">{Localization.customer_vote_s}</span>
                                </div>
                                <div className="star-rating">
                                    <Rating
                                        className="rating-star rating-star-m-15"
                                        emptySymbol="fa fa-star rating-empty"
                                        fullSymbol="fa fa-star rating-full"
                                        readonly
                                        direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                                        initialRating={book.rate}
                                    />

                                    <div className="numeric-star-data">
                                        <small className="text-uppercase">{book.rate} / {book.rate_no} {Localization.vote_s}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        )
    }
    bookResult_render() {
        if (this.state.categoryBookList && (this.state.categoryBookList! || []).length) {
            return (
                <>
                    {(this.state.categoryBookList || []).map((book: IBook, bookIndex: number) => (
                        <Fragment key={bookIndex}>
                            {this.card_render(book, bookIndex)}
                        </Fragment>
                    ))}
                </>
            );
        } else if (this.state.categoryBookList && !(this.state.categoryBookList! || []).length) {
            return (
                <>
                    <div className="text-center text-warning">{Localization.no_item_found}</div>
                </>
            );

        } else if (this.state.categoryBookError) {
            return (
                <>
                    <div>{this.state.categoryBookError}</div>
                    <div onClick={() => this.fetchCategoryBooks()}>{Localization.retry}</div>
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
    pager_previous_btn_render() {
        if (this.state.categoryBookList && (this.state.categoryBookList! || []).length) {
            return (
                <>
                    {
                        this.state.pager_offset > 0 &&
                        <div
                            className="btn btn-light text-capitalize"
                            onClick={() => this.onPreviousClick()}
                        >{Localization.previous}</div>
                    }
                </>
            );
        } else if (this.state.categoryBookList && !(this.state.categoryBookList! || []).length) {
            return (
                <>
                    {
                        this.state.pager_offset > 0 &&
                        <div
                            className="btn btn-light text-capitalize"
                            onClick={() => this.onPreviousClick()}
                        >{Localization.previous}</div>
                    }
                </>
            );

        } else if (this.state.categoryBookError) {
            return;
        } else {
            return;
        }
    }

    pager_next_btn_render() {
        if (this.state.categoryBookList && (this.state.categoryBookList! || []).length) {
            return (
                <>
                    {
                        !(this.state.pager_limit > (this.state.categoryBookList! || []).length) &&
                        <div
                            className="btn btn-light text-capitalize pull-right"
                            onClick={() => this.onNextClick()}
                        >{Localization.next}</div>
                    }
                </>
            );
        } else if (this.state.categoryBookList && !(this.state.categoryBookList! || []).length) {
            return;
        } else if (this.state.categoryBookError) {
            return;
        } else {
            return;
        }
    }
    onPreviousClick() {
        this.setState({
            ...this.state,
            pager_offset: this.state.pager_offset - this.state.pager_limit,
        }, () => {
            this.gotoTop();
            this.fetchCategoryBooks()
        });
    }
    onNextClick() {
        this.setState({
            ...this.state,
            pager_offset: this.state.pager_offset + this.state.pager_limit,
        }, () => {
            this.gotoTop();
            this.fetchCategoryBooks()
        });
    }

    render() {
        return (
            <>
                <div className="category-wrapper">
                    <div className="category-barnd text-center py-2">
                        <div className="brand-name ">
                            {
                                Localization.category[(this.state.categoryTitle! || '').toLowerCase()]
                                || Localization.category.category
                            }
                        </div>
                        <span className="page-count">
                            {Localization.from}&nbsp;
                            {this.state.pager_offset + 1}&nbsp;
                            {Localization.to}&nbsp;
                            {this.state.pager_offset + this.state.pager_limit}
                        </span>
                    </div>
                    <div className="cards-wrapper mt-3">
                        {this.bookResult_render()}
                    </div>

                    <div className="mt-4">
                        {this.pager_previous_btn_render()}
                        {this.pager_next_btn_render()}

                    </div>
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
        token: state.token,
        logged_in_user: state.logged_in_user,
    }
}

export const Category = connect(state2props, dispatch2props)(CategoryComponent);
