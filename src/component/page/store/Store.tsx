import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { TInternationalization } from '../../../config/setup';
import { BaseComponent } from '../../_base/BaseComponent';
import { Localization } from '../../../config/localization/localization';
import Rating from 'react-rating';
import { IBook } from '../../../model/model.book';
import { BookService } from '../../../service/service.book';
import { History } from "history";
import { BOOK_GENRE, BOOK_ROLES } from '../../../enum/Book';
import { category_routeParam_categoryType } from '../category/Category';
import { CmpUtility } from '../../_base/CmpUtility';

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    history: History;
}

interface IState {
    recomendedBookList: IBook[] | undefined;
    recomendedBookError: string | undefined;
    newReleaseBookList: IBook[] | undefined;
    newReleaseBookError: string | undefined;
    bestSellerBookList: IBook[] | undefined;
    bestSellerBookError: string | undefined;
    wishListBookList: IBook[] | undefined;
    wishListBookError: string | undefined;
}

class StoreComponent extends BaseComponent<IProps, IState> {
    state = {
        recomendedBookList: undefined,
        recomendedBookError: undefined,
        newReleaseBookList: undefined,
        newReleaseBookError: undefined,
        bestSellerBookList: undefined,
        bestSellerBookError: undefined,
        wishListBookList: undefined,
        wishListBookError: undefined,
    };
    private _bookService = new BookService();
    private recomendedBookCarousel_el!: HTMLDivElement | null;
    private newReleaseBookCarousel_el!: HTMLDivElement | null;
    private bestSellerBookCarousel_el!: HTMLDivElement | null;
    private wishListBookCarousel_el!: HTMLDivElement | null;

    componentDidMount() {
        // this._bookService.setToken(this.props.token);
        this.fetchAllData();
    }

    fetchAllData() {
        this.fetchNewestBook();
        this.fetchRecomendedBook();
        this.fetchWishListBook();
        this.fetchBestSellerBook();
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
    async fetchWishListBook() {
        // this.setState({ ...this.state, wishListBookError: undefined });

        /* let res = await this._bookService.wishList_search({
            limit: 10, offset: 0
        }).catch(error => {
            let errorMsg = this.handleError({ error: error.response, notify: false });
            this.setState({ ...this.state, wishListBookError: errorMsg.body });
        }); */
        // if (res) {
        //     if (res.data.result /* && res.data.result.length */) {
        //         this.setState({ ...this.state, wishListBookList: res.data.result });
        //     }
        // }
        await this.waitOnMe(0);
        if (this.props.logged_in_user && this.props.logged_in_user.person.wish_list) {
            let w_list = this.props.logged_in_user.person.wish_list.slice(0, 10);
            if (w_list) {
                this.setState({ ...this.state, wishListBookList: w_list });
            }
        }

    }
    async fetchBestSellerBook() {
        this.setState({ ...this.state, bestSellerBookError: undefined });

        let res = await this._bookService.search({
            limit: 10, skip: 0, filter: { tag: "best_seller" }
        }).catch(error => {
            let errorMsg = this.handleError({ error: error.response, notify: false });
            this.setState({ ...this.state, bestSellerBookError: errorMsg.body });
        });
        if (res) {
            if (res.data.result /* && res.data.result.length */) {
                this.setState({ ...this.state, bestSellerBookList: res.data.result });
            }
        }
    }

    recommended_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.recomendedBookList && (this.state.recomendedBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you, 'tag', 'recommended')}
                    {this.carousel_render(this.state.recomendedBookList!, this.recomendedBookCarousel_el)}
                </>
            )

        } else if (this.state.recomendedBookList && !(this.state.recomendedBookList! || []).length) {
            return;

        } else if (this.state.recomendedBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you, 'tag', 'recommended')}

                    {/* <div>{this.state.recomendedBookError}</div>
                    <div onClick={() => this.fetchRecomendedBook()}>
                        {Localization.retry}
                    </div> */}
                    {this.carousel_render_error(this.state.recomendedBookError!, () => this.fetchRecomendedBook())}
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.recomended_for_you, 'tag', 'recommended')}

                    {/* <div>{Localization.loading_with_dots}</div> */}
                    {this.carousel_render_preLoad()}
                </>
            );
        }
    }

    wishlist_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.wishListBookList && (this.state.wishListBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.inspired_by_your_wishlist, 'custom', 'wishlist')}
                    {this.carousel_render(this.state.wishListBookList!, this.wishListBookCarousel_el)}
                </>
            )

        } else if (this.state.wishListBookList && !(this.state.wishListBookList! || []).length) {
            return;

        } else if (this.state.wishListBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.inspired_by_your_wishlist, 'custom', 'wishlist')}

                    {/* <div>{this.state.wishListBookError}</div>
                    <div onClick={() => this.fetchWishListBook()}>
                        {Localization.retry}
                    </div> */}
                    {this.carousel_render_error(this.state.wishListBookError!, () => this.fetchWishListBook())}
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.inspired_by_your_wishlist, 'custom', 'wishlist')}

                    {/* <div>{Localization.loading_with_dots}</div> */}
                    {this.carousel_render_preLoad()}
                </>
            );
        }
    }

    best_seller_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.bestSellerBookList && (this.state.bestSellerBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.best_seller, 'tag', 'best_seller')}
                    {this.carousel_render(this.state.bestSellerBookList!, this.bestSellerBookCarousel_el)}
                </>
            )

        } else if (this.state.bestSellerBookList && !(this.state.bestSellerBookList! || []).length) {
            return;

        } else if (this.state.bestSellerBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.best_seller, 'tag', 'best_seller')}

                    {/* <div>{this.state.bestSellerBookError}</div>
                    <div onClick={() => this.fetchBestSellerBook()}>
                        {Localization.retry}
                    </div> */}
                    {this.carousel_render_error(this.state.bestSellerBookError!, () => this.fetchBestSellerBook())}
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.best_seller, 'tag', 'best_seller')}

                    {/* <div>{Localization.loading_with_dots}</div> */}
                    {this.carousel_render_preLoad()}
                </>
            );
        }
    }

    new_releases_render() {
        if (!this.props.logged_in_user) {
            return;
        }
        if (this.state.newReleaseBookList && (this.state.newReleaseBookList! || []).length) {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore, 'tag', 'new')}
                    {this.carousel_render(this.state.newReleaseBookList!, this.newReleaseBookCarousel_el)}
                </>
            )

        } else if (this.state.newReleaseBookList && !(this.state.newReleaseBookList! || []).length) {
            return;

        } else if (this.state.newReleaseBookError) {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore, 'tag', 'new')}

                    {/* <div>{this.state.newReleaseBookError}</div>
                    <div onClick={() => this.fetchNewestBook()}>
                        {Localization.retry}
                    </div> */}
                    {this.carousel_render_error(this.state.newReleaseBookError!, () => this.fetchNewestBook())}
                </>
            );
        } else {
            return (
                <>
                    {this.carousel_header_render(Localization.new_release_in_bookstore, 'tag', 'new')}

                    {/* <div>{Localization.loading_with_dots}</div> */}
                    {this.carousel_render_preLoad()}
                </>
            );
        }
    }

    carousel_header_render(headerTitle: string, categoryType: category_routeParam_categoryType, categoryTitle: string) {
        return (
            <>
                <div className="category-title-wrapper d-flex justify-content-between mb-2 cursor-pointer"
                    onClick={() => this.gotoCategory(categoryType, categoryTitle)}>
                    <h6 className="category-title text-capitalize cursor-pointer--">{headerTitle}</h6>
                    <i className="category-icon fa fa-angle-right-app text-muted"></i>
                </div>
            </>
        )
    }
    carousel_render(bookList: IBook[], carousel_el: HTMLDivElement | null) {
        return (
            <>
                <div className="carousel-wrapper">
                    <i className={
                        "carousel-arrow go-back fa fa-angle-left-app " +
                        (this.isDeviceMobileOrTablet() ? 'd-none' : '')
                    }
                        onClick={() => this.carousel_go_back(carousel_el)}></i>
                    <div ref={elRef => { carousel_el = elRef }} className="carousel-item-wrapper mb-4">
                        {bookList.map((book, bookIndex) => {

                            const book_image = CmpUtility.getBook_firstImg(book);
                            const firstWriterFullName = CmpUtility.getBook_role_fisrt_fullName(book, BOOK_ROLES.Writer);

                            // const book_image = (book.images && book.images.length && this.getImageUrl(book.images[0])) ||
                            //     this.defaultBookImagePath;
                            // let writerList = book.roles.filter(
                            //     r => r.role === BOOK_ROLES.Writer
                            // );
                            // let first_writer_fullName = '';
                            // if (writerList.length) {
                            //     // first_writer_fullName = writerList[0].person.name + ' ' + writerList[0].person.last_name;
                            //     first_writer_fullName = this.getPersonFullName(writerList[0].person);
                            // }

                            return (
                                <div className="carousel-item" key={bookIndex}>
                                    <div className="img-wrapper" onClick={() => this.gotoBookDetail(book.id)}>
                                        <img
                                            src={book_image}
                                            alt="book"
                                            onError={e => this.bookImageOnError(e)}
                                            className="center-el-in-box"
                                            loading="lazy"
                                        />
                                    </div>
                                    <span className="writer-name text-capitalize" title={firstWriterFullName}>
                                        {firstWriterFullName}
                                    </span>
                                    <div className="clearfix"></div>
                                    <Rating
                                        className="rating-star"
                                        emptySymbol="fa fa-star rating-empty"
                                        fullSymbol="fa fa-star rating-full"
                                        direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                                        initialRating={book.rate}
                                        readonly
                                    />
                                    <span className="rate-count ml-2">({book.rate_no})</span>
                                </div>
                            )
                        })}
                    </div>
                    <i className={
                        "carousel-arrow go-forward fa fa-angle-right-app " +
                        (this.isDeviceMobileOrTablet() ? 'd-none' : '')
                    }
                        onClick={() => this.carousel_go_forward(carousel_el)}></i>
                </div>
            </>
        )
    }

    carousel_go_back(el: HTMLDivElement | null) {
        if (this.props.internationalization.rtl) {
            // el && el.scrollBy(300, 0);
            el && el.scrollBy({
                top: 0,
                left: 300,
                behavior: 'smooth'
            });
        } else {
            // el && el.scrollBy(-300, 0);
            el && el.scrollBy({
                top: 0,
                left: -300,
                behavior: 'smooth'
            });
        }
    }
    carousel_go_forward(el: HTMLDivElement | null) {
        if (this.props.internationalization.rtl) {
            // el && el.scrollBy(-300, 0);
            el && el.scrollBy({
                top: 0,
                left: -300,
                behavior: 'smooth'
            });
        } else {
            // el && el.scrollBy(300, 0);
            el && el.scrollBy({
                top: 0,
                left: 300,
                behavior: 'smooth'
            });
        }
    }

    carousel_render_preLoad(slideCount: number = 5) {
        let list = [];
        for (let i = 0; i < slideCount; i++) { list.push(i); }

        return (
            <>
                <div className="carousel-wrapper carousel-wrapper-preloader" key="carousel-wrapper-preloader">
                    <div className="carousel-item-wrapper mb-4">
                        {list.map((_no: number, bookIndex) => {
                            return (
                                <div className="carousel-item" key={bookIndex}>
                                    <div className="img-wrapper">
                                        <img src={this.defaultBookImagePath} alt="" />
                                        <span className="item-loader-wrapper center-el-in-box">
                                            <div className="spinner-grow item-loader">
                                                <span className="sr-only">{Localization.loading_with_dots}</span>
                                            </div>
                                        </span>
                                    </div>
                                    <span className="writer-name text-capitalize"></span>
                                    <div className="clearfix"></div>
                                    <div className="rate-count">a</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </>
        )
    }

    carousel_render_error(errorMsg: string, onClick: () => void) {
        return (
            <>
                <div className="carousel-wrapper carousel-wrapper-error" key="carousel-wrapper-error">
                    <div className="carousel-item-wrapper mb-4">
                        <div className="carousel-item">
                            <div className="img-wrapper bg-transparent">
                                <img src={this.defaultBookImagePath} alt="" />
                            </div>
                            <span className="writer-name text-capitalize"></span>
                            <div className="clearfix"></div>
                            <div className="rate-count">a</div>
                        </div>
                    </div>
                    <div className="item-error-wrapper center-el-in-box text-center">
                        <div className="item-error">
                            <div className="mb-2">{errorMsg}</div>
                            <div onClick={() => onClick()} className="cursor-pointer">
                                {Localization.retry} <i className="fa fa-refresh"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    gotoBookDetail(bookId: string) {
        this.props.history.push(`book-detail/${bookId}`);
    }

    gotoCategory(searchType: category_routeParam_categoryType, searchValue: string) {
        this.props.history.push(`category/${searchType}/${searchValue}`);
    }

    render() {
        return (
            <>
                <div className="store-wrapper">
                    <h4 className="mt-3 mb-4">{Localization.bookstore_books}:</h4>
                    {this.recommended_render()}
                    {this.wishlist_render()}
                    {this.best_seller_render()}
                    {this.new_releases_render()}

                    <h6 className="mb-3 text-capitalize">{Localization.more_to_explore}</h6>
                    <div className="list-group more-to-explore">
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Classic)}>
                            <span className="text-capitalize">{Localization.category.classic}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Comedy)}>
                            <span className="text-capitalize">{Localization.category.comedy}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Drama)}>
                            <span className="text-capitalize">{Localization.category.drama}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Historical)}>
                            <span className="text-capitalize">{Localization.category.historical}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Religious)}>
                            <span className="text-capitalize">{Localization.category.religious}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Romance)}>
                            <span className="text-capitalize">{Localization.category.romance}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Science)}>
                            <span className="text-capitalize">{Localization.category.science}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => this.gotoCategory('genre', BOOK_GENRE.Social)}>
                            <span className="text-capitalize">{Localization.category.social}</span>
                            <i className="icon fa fa-angle-right-app fa-2x"></i>
                        </button>
                    </div>
                </div>
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
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        // token: state.token
    }
}

export const Store = connect(state2props, dispatch2props)(StoreComponent);
