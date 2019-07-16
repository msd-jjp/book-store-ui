import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
import Rating from 'react-rating';
import { IBook } from '../../model/model.book';
import { BookService } from '../../service/service.book';
import { IToken } from '../../model/model.token';
import { History } from "history";

export interface IProps {
    logged_in_user?: IUser | null;
    // do_logout?: () => void;
    // change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
    token: IToken;
    history: History;
}

interface IState {
    recomendedBookList: IBook[] | undefined;
    recomendedBookError: string | undefined;
    newReleaseBookList: IBook[] | undefined;
    newReleaseBookError: string | undefined;
}

class StoreComponent extends BaseComponent<IProps, IState> {
    state = {
        recomendedBookList: undefined,
        recomendedBookError: undefined,
        newReleaseBookList: undefined,
        newReleaseBookError: undefined,
    };
    private _bookService = new BookService();

    componentDidMount() {
        this._bookService.setToken(this.props.token);
        this.fetchAllData();
    }

    fetchAllData() {
        this.fetchNewestBook();
        this.fetchRecomendedBook();
    }
    async fetchRecomendedBook() {
        this.setState({ ...this.state, recomendedBookError: undefined });

        let res = await this._bookService.recomended().catch(error => {
            let errorMsg = this.handleError({ error: error.response, notify: false });
            this.setState({ ...this.state, recomendedBookError: errorMsg.body });
        });
        if (res) {
            if (res.data.result /* && res.data.result.length */) {
                this.setState({ ...this.state, recomendedBookList: res.data.result });
            }
        }
    }
    async fetchNewestBook() {
        this.setState({ ...this.state, newReleaseBookError: undefined });

        let res = await this._bookService.newest().catch(error => {
            let errorMsg = this.handleError({ error: error.response, notify: false });
            this.setState({ ...this.state, newReleaseBookError: errorMsg.body });
        });
        if (res) {
            if (res.data.result/*  && res.data.result.length */) {
                this.setState({ ...this.state, newReleaseBookList: res.data.result });
            }
        }
    }

    top_picks_render() {
        return (
            <>
                {this.carousel_header_render('top picks for you')}
                {this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}])}
            </>
        )
    }
    recommended_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.recomendedBookList && (this.state.recomendedBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you)}
                    {this.carousel_render(this.state.recomendedBookList!)}
                </>
            )

        } else if (this.state.recomendedBookList && !(this.state.recomendedBookList! || []).length) {
            return;

        } else if (this.state.recomendedBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you)}

                    <div>{this.state.recomendedBookError}</div>
                    <div onClick={() => this.fetchRecomendedBook()}>
                        {Localization.retry}
                    </div>
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you)}

                    <div>{Localization.loading_with_dots}</div>
                </>
            );
        }
    }
    browsing_history_render() {
        return (
            <>
                {this.carousel_header_render('inspired by your browsing history')}
                {this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}])}
            </>
        )
    }
    wishlist_render() {
        return (
            <>
                {this.carousel_header_render(Localization.inspired_by_your_wishlist)}
                {this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}])}
            </>
        )
    }
    best_seller_render() {
        return (
            <>
                {this.carousel_header_render(Localization.best_seller)}
                {this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}])}
            </>
        )
    }

    new_releases_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.newReleaseBookList && (this.state.newReleaseBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore)}
                    {this.carousel_render(this.state.newReleaseBookList!)}
                </>
            )

        } else if (this.state.newReleaseBookList && !(this.state.newReleaseBookList! || []).length) {
            return;

        } else if (this.state.newReleaseBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore)}

                    <div>{this.state.newReleaseBookError}</div>
                    <div onClick={() => this.fetchNewestBook()}>
                        {Localization.retry}
                    </div>
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore)}

                    <div>{Localization.loading_with_dots}</div>
                </>
            );
        }
    }

    carousel_header_render(category: string) {
        return (
            <>
                <div className="category-wrapper d-flex justify-content-between mb-2"
                    onClick={() => this.gotoSearch_by_category('category_id')}>
                    <h6 className="category-title text-capitalize">{category}</h6>
                    <i className="category-icon fa fa-angle-right-app text-muted"></i>
                </div>
            </>
        )
    }
    carousel_render(bookList: any[]/* IBook[] */) {
        return (
            <>
                <div className="carousel-wrapper mb-4">
                    {bookList.map((book, bookIndex) => (
                        <div className="carousel-item" key={bookIndex}>
                            <div className="img-wrapper" onClick={() => this.gotoBookDetail(book.id)}>
                                <img src="static/media/img/icon/default-book.png" alt="book" />
                            </div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="clearfix"></div>
                            <Rating
                                className="rating-star"
                                emptySymbol="fa fa-star rating-empty"
                                fullSymbol="fa fa-star rating-full"
                                direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                                initialRating={2.5}
                                readonly
                            />
                            <span className="rate-count ml-2">(243)</span>
                        </div>
                    ))}
                </div>
            </>
        )
    }
    gotoSearch_by_category(category: string) {
        debugger;
    }
    gotoBookDetail(bookId: string) {
        this.props.history.push(`book-detail/${bookId}`);
    }

    render() {
        return (
            <>

                <div className="store-wrapper">

                    {/* <div className="input-group mb-3 mt-2 store-search-box" >
                        <div className="input-group-prepend open-menu-icon">
                            <span className="input-group-text">
                                <i className="fa fa-bars"></i>
                            </span>
                        </div>
                        <input type="text" className="form-control search-input"
                            placeholder="search in book store" />
                        <div className="input-group-append search-icon">
                            <span className="input-group-text">
                                <i className="fa fa-search"></i>
                            </span>
                        </div>
                    </div>

                    <h5 className="heading-main pt-4 mx-3--">bookstore eBooks</h5>
                    <div className="link-group px-0 mx-3--">
                        <span className="text-muted ml-2 text-capitalize">Browse</span>
                        <a href="" className="book-group-link mx-0">Book Categories</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Kindle Unlimited</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Prime Reading</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Amazon Charts</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Editors' Picks</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Books with Audible Narration</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Kindle Newsstand</a>
                        <span> | </span>
                        <a href="" className="book-group-link mx-0">Deals</a>
                    </div> */}
                    <h4 className="mt-3 mb-4">{Localization.bookstore_books}:</h4>

                    {/* {this.top_picks_render()} */}
                    {this.recommended_render()}
                    {/* {this.browsing_history_render()} */}
                    {this.wishlist_render()}
                    {this.best_seller_render()}
                    {this.new_releases_render()}

                    <h6 className="mb-3 text-capitalize">{Localization.more_to_explore}</h6>
                    <div className="list-group more-to-explore">
                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Kindle Singles</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Amazom Charts</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>

                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Literature & Fiction</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Mystery, Thiller & Suspense</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>

                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Romance</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>

                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Science Fiction & Fantasy</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>

                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">Biographies & Memoirs</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">History</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        {/* <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">More Categorise</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button> */}
                    </div>

                </div>

            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        // do_logout: () => dispatch(action_user_logged_out()),
        // change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        token: state.token
    }
}

export const Store = connect(state2props, dispatch2props)(StoreComponent);
