import React from "react";
import { NavLink } from "react-router-dom";
import { Localization } from "../../../../config/localization/localization";

class LayoutMainFooterComponent extends React.Component<any>{
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
                            <NavLink to="/dashboard242" className="nav-link text-dark">
                                <i className="fa fa-leanpub"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.library}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center selected-book">
                            <NavLink to="/dashboard33" className="nav-link">
                                <img src="static/media/img/sample-book.png" alt="selected-book" />
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/dashboard2255" className="nav-link text-dark">
                                <i className="fa fa-shopping-cart"></i>
                                <div className="clearfix"></div>
                                <span className="text">{Localization.store}</span>
                            </NavLink>
                        </div>
                        <div className="item text-center">
                            <NavLink to="/dashboard225" className="nav-link text-dark">
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

export const LayoutMainFooter = LayoutMainFooterComponent;
