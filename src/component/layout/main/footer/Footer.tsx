import React from "react";
import { NavLink } from "react-router-dom";
import { Localization } from "../../../../config/localization/localization";
import { redux_state } from "../../../../redux/app_state";
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { TInternationalization } from "../../../../config/setup";

export interface IProps {
    internationalization: TInternationalization;
}

class LayoutMainFooterComponent extends React.Component<IProps, any>{
    render() {
        return (
            <>
                <footer className="footer fixed-bottom">
                    <div className="footer-menu d-flex justify-content-between mx-2">
                        <div className="item text-center">
                            <NavLink to="/dashboard" className="nav-link text-dark">
                                <i className="fa fa-home"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.home}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/library" className="nav-link text-dark">
                                <i className="fa fa-leanpub"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.library}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center selected-book">
                            <NavLink to="/dashboard" className="nav-link">
                                <img src="static/media/img/sample-book/sample-book.png" alt="selected-book" />
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/store" className="nav-link text-dark">
                                <i className="fa fa-shopping-cart"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.store}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/dashboard-more" className="nav-link text-dark">
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

// export const LayoutMainFooter = LayoutMainFooterComponent;


const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
    }
}

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization
    }
}

export const LayoutMainFooter = connect(state2props, dispatch2props)(LayoutMainFooterComponent);
