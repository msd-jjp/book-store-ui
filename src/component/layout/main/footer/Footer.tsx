import React from "react";
import { NavLink } from "react-router-dom";
import { Localization } from "../../../../config/localization/localization";
import { redux_state } from "../../../../redux/app_state";
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { TInternationalization, Setup } from "../../../../config/setup";
import { IUser } from "../../../../model/model.user";
import { BaseComponent } from "../../../_base/BaseComponent";
import { CmpUtility } from "../../../_base/CmpUtility";
import { History } from "history";
import { IBook } from "../../../../model/model.book";
import { BOOK_TYPES } from "../../../../enum/Book";
import { is_book_downloaded, isReaderEngineDownloading } from "../../../library/libraryViewTemplate";

export interface IProps {
    internationalization: TInternationalization;
    logged_in_user?: IUser | null;
    history: History;
}

class LayoutMainFooterComponent extends BaseComponent<IProps, any>{

    currentBook_render() {
        if (
            this.props.logged_in_user &&
            this.props.logged_in_user.person &&
            this.props.logged_in_user.person.current_book
        ) {
            const current_book = this.props.logged_in_user.person.current_book;
            const current_book_img = CmpUtility.getBook_firstImg(current_book);
            const is_downloaded = is_book_downloaded(current_book.id, true);
            if (!is_downloaded) return;

            return (
                <>
                    <div className="item text-center selected-book">
                        {/* NavLink */}
                        <div
                            // to="/dashboard"
                            className="nav-link-- cursor-pointer"
                            // activeClassName="active pointer-events-none"
                            // onClick={() => this.gotoReader(current_book.id)}
                            onClick={() => this.before_gotoReader(current_book)}
                        >
                            <div className="img-scaffolding-container">
                                <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />

                                <img src={current_book_img}
                                    alt="book"
                                    className="main-img center-el-in-box"
                                    onError={e => CmpUtility.bookImageOnError(e)}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )
        }

    }

    // gotoReader(book_id: string) {
    //     this.props.history.push(`/reader/${book_id}/reading`);
    // }
    before_gotoReader(book: IBook) {
        const is_re_d_ing = isReaderEngineDownloading();
        if (is_re_d_ing) {
            this.readerEngineNotify();
            return;
        }

        // if (is_re_d_ing) return;

        let isAudio = false;
        if (book.type === BOOK_TYPES.Audio) {
            isAudio = true;
        }
        this.gotoReader(book.id, isAudio);
    }
    gotoReader(book_id: string, isAudio = false) {
        if (isAudio) {
            this.props.history.push(`/reader/${book_id}/audio`);
        } else {
            this.props.history.push(`/reader/${book_id}/reading`);
        }
    }

    readerEngineNotify(): void {
        this.toastNotify(Localization.msg.ui.downloading_reader_security_content,
            { autoClose: Setup.notify.timeout.info, toastId: 'readerEngineNotify_info' }, 'info');
    }

    render() {
        return (
            <>
                <footer className="footer fixed-bottom">
                    <div className="row">
                        <div className="col-lg-4 offset-lg-4 col-md-8 offset-md-2">

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
