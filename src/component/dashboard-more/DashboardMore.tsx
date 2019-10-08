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
import moment_jalaali from "moment-jalaali";
import moment from 'moment';
import { CmpUtility } from '../_base/CmpUtility';

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
    sync: {
        syncing: boolean;
        lastSynced: number | undefined;
    };
}

class DashboardMoreComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_appInfo_show: false,
        modal_logout_show: false,
        sync: {
            syncing: false,
            lastSynced: 1569323258125
        }
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
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_appInfo()}>
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
                        <button className="btn btn-warning-- text-warning btn-sm text-uppercase min-w-70px" onClick={() => this.logout()}>
                            {Localization.log_out}
                        </button>
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_logout()}>
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

    convert_timestamp_to_format(timestamp: number) {
        if (this.props.internationalization.flag === 'fa') {
            // moment_jalaali.locale('en');
            moment_jalaali.loadPersian({ usePersianDigits: false });
            return moment_jalaali(timestamp).format('jYYYY/jM/jD h:m A');

        } else {
            // moment_jalaali.locale('en');
            // moment_jalaali.loadPersian({ usePersianDigits: false });
            moment.locale('en');
            return moment(timestamp).format('YYYY/M/D h:m A');
        }
    }

    async onSync_clicked() {
        this.setState({ sync: { ...this.state.sync, syncing: true } });
        await this.waitOnMe(2000);
        // const date = new Date().toLocaleString();
        // const date = this.convert_timestamp_to_format(new Date().getTime());
        const date = new Date().getTime();
        this.setState({ sync: { ...this.state.sync, syncing: false, lastSynced: date } });
    }

    gotoPurchaseHistory() {
        this.props.history.push('/purchase-history');
    }

    render() {

        return (
            <>
                <div className="dashboard-more-wrapper">
                    <ul className="more-list list-group list-group-flush">
                        <li className="more-item list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.onSync_clicked()}
                        >
                            <div className="icon-wrapper mr-3">
                                <i className={"fa fa-refresh " + (this.state.sync.syncing ? 'fa-spin' : '')}></i>
                            </div>
                            <div className="wrapper d-inline">
                                <span className="text">{Localization.sync}</span>
                                <span className="sub-text d-block text-muted">
                                    {/* '06/12/2019, 11:25 AM' */}
                                    {
                                        this.state.sync.syncing ?
                                            Localization.syncing_with_dots :
                                            (
                                                this.state.sync.lastSynced ?
                                                    (
                                                        Localization.last_synced_on +
                                                        ' ' +
                                                        this.convert_timestamp_to_format(this.state.sync.lastSynced!)
                                                    ) :
                                                    ''
                                            )
                                    }
                                </span>
                            </div>
                        </li>
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-headphones mr-3"></i>
                            <span className="text text-capitalize">{Localization.read_listen_with_audible}</span>
                        </li> */}
                        <li className="more-item list-group-item p-align-0 cursor-pointer" onClick={() => this.gotoCart()}>
                            <div className="icon-wrapper mr-3"><i className="fa fa-shopping-cart"></i></div>
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
                        <li className="more-item list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.gotoPurchaseHistory()}>
                            <div className="icon-wrapper mr-3"><i className="fa fa-money"></i></div>
                            <span className="text text-capitalize">{Localization.purchase_history}</span>
                        </li>
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-leanpub mr-3"></i>
                            <span className="text text-capitalize">{Localization.book_update}</span>
                        </li> */}
                        {/* <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-free-code-camp mr-3"></i>
                            <span className="text text-capitalize">{Localization.reading_insights}</span>
                        </li> */}
                        <li className="more-item list-group-item p-align-0 cursor-pointer" onClick={() => this.gotoProfile()}>
                            <div className="icon-wrapper mr-3"><i className="fa fa-user-circle-o"></i></div>
                            <span className="text text-capitalize mr-3">{Localization.profile}</span>
                            <img className="w-50px h-50px radius-50px mr-3"
                                // src={
                                //     (this.props.logged_in_user!.person.image) ?
                                //         this.getImageUrl(this.props.logged_in_user!.person.image)
                                //         : this.defaultPersonImagePath
                                // }
                                src={CmpUtility.getPerson_avatar(this.props.logged_in_user!.person)}
                                alt="avatar"
                                onError={e => this.personImageOnError(e)}
                                loading="lazy"
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
                            <div className="icon-wrapper mr-3"><i className="fa fa-cog"></i></div>
                            <span className="text text-capitalize">{Localization.settings}</span>
                        </li>

                        <li className="more-item list-group-item p-align-0 flag">
                            <div className="icon-wrapper mr-3"><i className="fa fa-flag"></i></div>
                            <ul className="flag-list list-group list-group-horizontal list-group-flush__ text-center  p-0">
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('fa')}>
                                    <img src="/static/media/img/flag/ir.png" alt="فارسی" loading="lazy" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('en')}>
                                    <img src="/static/media/img/flag/us.png" alt="english" loading="lazy" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('ar')}>
                                    <img src="/static/media/img/flag/ar.png" alt="العربیه" loading="lazy" />
                                </button>
                            </ul>
                        </li>

                        <li className="more-item list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.openModal_appInfo()}>
                            <div className="icon-wrapper mr-3"><i className="fa fa-info-circle"></i></div>
                            <span className="text text-capitalize">{Localization.info}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <div className="icon-wrapper mr-3"><i className="fa fa-twitch"></i></div>
                            <span className="text text-capitalize">{Localization.help_feedback}</span>
                        </li>

                        <li className="more-item list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.openModal_logout()}>
                            <i className="icon-wrapper mr-3"><i className="fa fa-sign-out"></i></i>
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
