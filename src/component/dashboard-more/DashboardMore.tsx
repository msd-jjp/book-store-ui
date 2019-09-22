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
// import { NavLink } from 'react-router-dom';
import { action_remove_token } from '../../redux/action/token';

import { History } from 'history';
import { action_remove_authentication } from '../../redux/action/authentication';
import { Modal } from 'react-bootstrap';
import { ICartItems } from '../../redux/action/cart/cartAction';
import { action_clear_cart } from '../../redux/action/cart';
import { action_clear_library } from '../../redux/action/library';
import { action_clear_collections } from '../../redux/action/collection';

interface IProps {
    logged_in_user?: IUser | null;
    do_logout: () => void;
    change_app_flag: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
    remove_token: () => void;
    history: History;
    remove_authentication: () => void;
    cart: ICartItems;
    clear_cart: () => any;
    clear_library: () => any;
    clear_collections: () => any;
}

interface IState {
    modal_appInfo_show: boolean;
    modal_logout_show: boolean;
}

class DashboardMoreComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_appInfo_show: false,
        modal_logout_show: false,
    }
    change(lang: string) {
        // debugger;
        if (lang === 'fa') {
            // if (!this.props.internationalization.rtl) {
            document.body.classList.add('rtl');
            Localization.setLanguage('fa');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: true,
                language: 'فارسی',
                flag: 'fa',
            });
            // }
        } else if (lang === 'en') {
            // if (this.props.internationalization.rtl) {
            document.body.classList.remove('rtl');
            Localization.setLanguage('en');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: false,
                language: 'english',
                flag: 'en',
            });
            // }
        } else if (lang === 'ar') {
            document.body.classList.add('rtl');
            Localization.setLanguage('ar');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: true,
                language: 'العربیه',
                flag: 'ar',
            });
        }

    }
    logout() {
        // debugger;
        this.props.do_logout();
        this.props.remove_token();
        this.props.remove_authentication();
        this.props.clear_cart();
        this.props.clear_library();
        this.props.clear_collections();
        this.props.history.push('/login');
    }

    //#region modal_appInfo
    openModal_appInfo() {
        this.setState({ ...this.state, modal_appInfo_show: true });
    }

    closeModal_appInfo() {
        this.setState({ ...this.state, modal_appInfo_show: false });
    }

    modal_appInfo_render() {
        return (
            <>
                <Modal show={this.state.modal_appInfo_show} onHide={() => this.closeModal_appInfo()} centered>
                    <Modal.Header closeButton className="border-bottom-0 pb-0">
                        {/* <Modal.Title className="text-danger_">app info</Modal.Title> */}
                        <div className="modal-title h6">{Localization.app_info}</div>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <div>{process.env.NODE_ENV}</div> */}
                        <div className="mb-1">
                            <span className="text-muted">{Localization.app_title_}:</span>&nbsp;
                            {Localization.app_title}
                        </div>
                        <div className="mb-1">
                            <span className="text-muted">{Localization.version_mode}:</span>&nbsp;
                            {Localization.trial}
                        </div>
                        <div className="mb-1__">
                            <span className="text-muted">{Localization.version}:</span>&nbsp;
                            {process.env.REACT_APP_VERSION}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-light btn-sm" onClick={() => this.closeModal_appInfo()}>
                            {Localization.close}
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    //#endregion

    //#region modal_logout
    openModal_logout() {
        this.setState({ ...this.state, modal_logout_show: true });
    }

    closeModal_logout() {
        this.setState({ ...this.state, modal_logout_show: false });
    }

    modal_logout_render() {
        return (
            <>
                <Modal show={this.state.modal_logout_show} onHide={() => this.closeModal_logout()} centered>
                    <Modal.Body>{Localization.sure_you_want_log_out}</Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-warning btn-sm" onClick={() => this.logout()}>
                            {Localization.log_out}
                        </button>
                        <button className="btn btn-light btn-sm" onClick={() => this.closeModal_logout()}>
                            {Localization.close}
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    //#endregion

    gotoCart() {
        this.props.history.push('/cart');
    }

    gotoProfile() {
        this.props.history.push('/profile');
    }

    render() {

        return (
            <>
                <div className="dashboard-more-wrapper">
                    <ul className="more-list list-group list-group-flush">
                        <li className="more-item list-group-item p-align-0 d-flex align-items-center">
                            <i className="icon fa fa-refresh mr-3"></i>
                            <div className="wrapper d-inline">
                                <span className="text">{Localization.sync}</span>
                                <span className="sub-text d-block text-muted">Last synced on 06/12/2019, 11:25 AM</span>
                            </div>
                        </li>
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-headphones mr-3"></i>
                            <span className="text text-capitalize">{Localization.read_listen_with_audible}</span>
                        </li> */}
                        <li className="more-item list-group-item p-align-0" onClick={() => this.gotoCart()}>
                            <i className="icon fa fa-shopping-cart mr-3"></i>
                            <span className="text text-capitalize">
                                {Localization.shopping_cart}
                                {this.props.cart.length
                                    ?
                                    <>
                                        &nbsp;
                                        <small className="font-weight-bold">({this.props.cart.length})</small>
                                    </>
                                    : ''
                                }
                            </span>
                        </li>
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-leanpub mr-3"></i>
                            <span className="text text-capitalize">{Localization.book_update}</span>
                        </li> */}
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-free-code-camp mr-3"></i>
                            <span className="text text-capitalize">{Localization.reading_insights}</span>
                        </li> */}
                        <li className="more-item list-group-item p-align-0" onClick={() => this.gotoProfile()}>
                            <i className="icon fa fa-user-circle-o mr-3"></i>
                            <span className="text text-capitalize mr-3">{Localization.profile}</span>
                            <img className="w-50px h-50px radius-50px mr-3"
                                src={
                                    (this.props.logged_in_user!.person.image) ?
                                        this.getImageUrl(this.props.logged_in_user!.person.image)
                                        : this.defaultPersonImagePath
                                }
                                alt="avatar"
                                onError={e => this.personImageOnError(e)}
                                data-loading="lazy"
                            />
                            <span>
                                {this.props.logged_in_user!.username}
                                &nbsp;
                                <small>
                                    ({this.getPersonFullName(this.props.logged_in_user!.person)})
                                </small>
                            </span>
                        </li>

                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-cog mr-3"></i>
                            <span className="text text-capitalize">{Localization.settings}</span>
                        </li>

                        <li className="more-item list-group-item p-align-0 flag">
                            <i className="icon fa fa-flag mr-3"></i>

                            <ul className="flag-list list-group list-group-horizontal list-group-flush__ text-center  p-0">
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('fa')}>
                                    <img src="/static/media/img/flag/ir.png" alt="فارسی" width="50px" data-loading="lazy" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('en')}>
                                    <img src="/static/media/img/flag/us.png" alt="english" width="50px" data-loading="lazy" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('ar')}>
                                    <img src="/static/media/img/flag/ar.png" alt="العربیه" width="50px" data-loading="lazy" />
                                </button>
                            </ul>
                        </li>

                        <li className="more-item list-group-item p-align-0"
                            onClick={() => this.openModal_appInfo()}>
                            <i className="icon fa fa-info-circle mr-3"></i>
                            <span className="text text-capitalize">{Localization.info}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-twitch mr-3"></i>
                            <span className="text text-capitalize">{Localization.help_feedback}</span>
                        </li>

                        <li className="more-item list-group-item p-align-0"
                            onClick={() => this.openModal_logout()}>
                            <i className="icon fa fa-sign-out mr-3"></i>
                            <span className="text text-capitalize">{Localization.log_out}</span>
                        </li>
                    </ul>
                </div>

                {this.modal_appInfo_render()}
                {this.modal_logout_render()}
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        do_logout: () => dispatch(action_user_logged_out()),
        change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
        remove_token: () => dispatch(action_remove_token()),
        remove_authentication: () => dispatch(action_remove_authentication()),
        clear_cart: () => dispatch(action_clear_cart()),
        clear_library: () => dispatch(action_clear_library()),
        clear_collections: () => dispatch(action_clear_collections()),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        cart: state.cart
    }
}

export const DashboardMore = connect(state2props, dispatch2props)(DashboardMoreComponent);
