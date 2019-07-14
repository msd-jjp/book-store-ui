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

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

class StoreComponent extends BaseComponent<IProps, any> {

    render() {

        return (
            <>

                <div className="store-wrapper">
                    {/* <div className="sherch-box-wrapper row mx-1 py-2 mr-0">
                        <div className="icon-wrapper col-1 mr-0 pr-0">
                            <a className="icon-link" href="">
                                <i className="icon fa fa-bars"></i>
                            </a>
                        </div>
                        <div className="search-wrapper col-11">
                            <div className="search-group input-group ml-2">
                                <input className="search-box btn" type="text" name="" id="" placeholder="Search in Kindle Store" />
                                <button className="search-btn" type="submit">
                                    <i className="icon fa fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div> */}

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

                    <h3 className="heading-main pt-4 mx-3--">Kindle eBooks</h3>
                    <div className="link-group px-0 mx-3--">
                        <span className="txt text-muted">Browse</span>
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
                    <div className="slider-header d-flex justify-content-between mx-3--">
                        <h4 className="slide-txt">Best Sellers</h4>
                        <a href="" className="slide-angle">
                            <i className="angle fa fa-angle-right text-muted"></i>
                        </a>
                    </div>
                    <div className="slide-container1 pb-3">
                        <div className="book-detail first-slide">
                            <div className="slide-book "></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                    </div>
                    <div className="slider-header d-flex justify-content-between mx-3--">
                        <h4 className="slide-txt">Best Sellers</h4>
                        <a href="" className="slide-angle">
                            <i className="angle fa fa-angle-right text-muted"></i>
                        </a>
                    </div>
                    <div className="slide-container1 pb-3">
                        <div className="book-detail first-slide">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                        <div className="book-detail">
                            <div className="slide-book"></div>
                            <span className="writer-name">Claire McGowan</span>
                            <div className="rate-book">
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star checked"></span>
                                <span className="fa fa-star"></span>
                                <span className="star-counter">(243)</span>
                            </div>
                        </div>
                    </div>

                    <h5 className="slide-txt___mx-3-- mb-3 text-capitalize">More to Explore</h5>
                    {/* <div className="store-main-menu-link mx-3--">
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Kindle Singles</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Amazom Charts</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Literature & Fiction</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Mystery, Thiller & Suspense</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Romance</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Science Fiction & Fantasy</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">Biographies & Memoirs</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">History</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                        <div className="link-box d-flex justify-content-between py-3">
                            <span className="ml-4">More Categorise</span>
                            <a href="" className="slide-angle mr-4">
                                <i className="angle fa fa-angle-right text-muted"></i>
                            </a>
                        </div>
                    </div> */}

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
