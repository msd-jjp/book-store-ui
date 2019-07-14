import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
import Rating from 'react-rating';
import { IBook } from '../../model/model.book';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

class StoreComponent extends BaseComponent<IProps, any> {

    top_picks_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'top picks for you');
    }
    recommended_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'recommended for you');
    }
    browsing_history_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'inspired by your browsing history');
    }
    wishlist_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'inspired by your wishlist');
    }
    best_seller_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'best seller');
    }
    new_releases_render() {
        return this.carousel_render([{}, {}, {}, {}, {}, {}, {}, {}, {}], 'new releases for you');
    }
    carousel_render(bookList: any[]/* IBook[] */, category: string) {
        return (
            <>
                <div className="slider-header d-flex justify-content-between">
                    <h6 className="category-title text-capitalize">{category}</h6>
                    <a href="" className="slide-angle">
                        <i className="angle fa fa-angle-right-app text-muted"></i>
                    </a>
                </div>
                <div className="slide-container mb-3">
                    {bookList.map(book => (
                        <div className="book-detail">
                            <div className="slide-book ">
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
    render() {

        return (
            <>

                <div className="store-wrapper">

                    <div className="input-group mb-3 mt-2 store-search-box" >
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
                    </div>

                    {this.top_picks_render()}
                    {this.recommended_render()}
                    {this.browsing_history_render()}
                    {this.wishlist_render()}
                    {this.best_seller_render()}
                    {this.new_releases_render()}

                    <h6 className="slide-txt___mx-3-- mb-3 text-capitalize">More to Explore</h6>
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
                        <button type="button" className="list-group-item list-group-item-action">
                            <span className="text-capitalize">More Categorise</span>
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
        do_logout: () => dispatch(action_user_logged_out()),
        change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization
    }
}

export const Store = connect(state2props, dispatch2props)(StoreComponent);
