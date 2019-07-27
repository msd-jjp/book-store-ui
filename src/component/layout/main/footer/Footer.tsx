import React from "react";
import { NavLink } from "react-router-dom";
import { Localization } from "../../../../config/localization/localization";
import { redux_state } from "../../../../redux/app_state";
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { TInternationalization } from "../../../../config/setup";
import { IUser } from "../../../../model/model.user";
import { BaseComponent } from "../../../_base/BaseComponent";

export interface IProps {
    internationalization: TInternationalization;
    logged_in_user?: IUser | null;
}

class LayoutMainFooterComponent extends BaseComponent<IProps, any>{

    currentBook_render() {
        if (
            this.props.logged_in_user &&
            this.props.logged_in_user.person &&
            this.props.logged_in_user.person.current_book
        ) {
            let current_book = this.props.logged_in_user.person.current_book;
            let current_book_img = (current_book.images && current_book.images.length && this.getImageUrl(current_book.images[0]))
                ||
                this.defaultBookImagePath;

            return (
                <>
                    <div className="item text-center selected-book">
                        <NavLink to="/dashboard" className="nav-link" activeClassName="active pointer-events-none">
                            <img src={current_book_img} alt="selected-book" onError={e => this.bookImageOnError(e)} />
                        </NavLink>
                    </div>
                </>
            )
        }

    }

    render() {
        return (
            <>
                <footer className="footer fixed-bottom">
                    <div className="footer-menu d-flex justify-content-between mx-2">
                        <div className="item text-center">
                            <NavLink to="/dashboard" className="nav-link text-dark" activeClassName="active pointer-events-none">
                                <i className="fa fa-home"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.home}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/library" className="nav-link text-dark" activeClassName="active pointer-events-none">
                                <i className="fa fa-leanpub"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.library}</span>
                            </NavLink>
                        </div>
                        {this.currentBook_render()}
                        <div className="item text-center">
                            <NavLink to="/store" className="nav-link text-dark" activeClassName="active pointer-events-none">
                                <i className="fa fa-shopping-cart"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.store}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/dashboard-more" className="nav-link text-dark" activeClassName="active pointer-events-none">
                                <i className="fa fa-list-ul"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.more}</span>
                            </NavLink>
                        </div>
                    </div>
                </footer>
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
        logged_in_user: state.logged_in_user,
    }
}

export const LayoutMainFooter = connect(state2props, dispatch2props)(LayoutMainFooterComponent);
