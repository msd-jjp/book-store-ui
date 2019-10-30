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
import { action_remove_token } from '../../redux/action/token';
import { History } from 'history';
import { action_remove_authentication } from '../../redux/action/authentication';
import { Modal } from 'react-bootstrap';
import { ICartItems } from '../../redux/action/cart/cartAction';
import { action_clear_cart } from '../../redux/action/cart';
import { action_clear_library } from '../../redux/action/library';
import { action_clear_collections } from '../../redux/action/collection';
import { CmpUtility } from '../_base/CmpUtility';
import { action_reset_sync } from '../../redux/action/sync';
import { ISync_schema } from '../../redux/action/sync/syncAction';
import { SyncWorker } from '../../webworker/sync-worker/SyncWorker';
import { BaseService } from '../../service/service.base';
import { appLocalStorage } from '../../service/appLocalStorage';
import { NETWORK_STATUS } from '../../enum/NetworkStatus';
import { action_reset_reader } from '../../redux/action/reader';
// import { IToken } from '../../model/model.token';

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
    sync: ISync_schema;
    reset_sync: () => any;
    network_status: NETWORK_STATUS;
    reset_reader: () => any;
}

interface IState {
    modal_appInfo_show: boolean;
    modal_logout_show: boolean;
    // sync: {
    //     syncing: boolean;
    //     lastSynced: number | undefined;
    // };
}

class DashboardMoreComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_appInfo_show: false,
        modal_logout_show: false,
        // sync: {
        //     syncing: false,
        //     lastSynced: 1569323258125
        // }
    }
    private _syncWorker = new SyncWorker(/* this.props.token */);

    componentWillMount() {
        document.title = Localization.more;
    }
    componentWillUnmount() {
        document.title = Localization.app_title;
        this._syncWorker.terminate();
    }

    private change(lang: string) {
        // debugger;
        if (lang === 'fa') {
            // if (!this.props.internationalization.rtl) {
            document.body.classList.add('rtl');
            Localization.setLanguage('fa');
            document.title = Localization.more;
            this.props.change_app_flag({
                rtl: true,
                language: 'فارسی',
                flag: 'fa',
            });
            // }
        } else if (lang === 'en') {
            // if (this.props.internationalization.rtl) {
            document.body.classList.remove('rtl');
            Localization.setLanguage('en');
            document.title = Localization.more;
            this.props.change_app_flag({
                rtl: false,
                language: 'english',
                flag: 'en',
            });
            // }
        } else if (lang === 'ar') {
            document.body.classList.add('rtl');
            Localization.setLanguage('ar');
            document.title = Localization.more;
            this.props.change_app_flag({
                rtl: true,
                language: 'العربیه',
                flag: 'ar',
            });
        }

    }
    private logout() {
        // debugger;
        this.props.do_logout();
        this.props.remove_token();
        BaseService.removeToken();
        this.props.remove_authentication();
        this.props.clear_cart();
        this.props.clear_library();
        this.props.clear_collections();
        this.props.reset_sync();
        this.props.reset_reader();
        appLocalStorage.afterAppLogout();
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
                    <Modal.Body>
                        <p className="mb-1">{Localization.msg.ui.logout_erase_user_data_warning}</p>
                        <p className="mb-0">{Localization.sure_you_want_log_out}</p>
                    </Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-warning-- text-warning btn-sm text-uppercase min-w-70px" onClick={() => this.logout()}>
                            {Localization.log_out}
                        </button>
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_logout()}>
                            {Localization.cancel}
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    //#endregion

    private gotoCart() {
        this.props.history.push('/cart');
    }

    private gotoProfile() {
        this.props.history.push('/profile');
    }

    private async onSync_clicked() {
        if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
        if (this.props.sync.isSyncing_visible) return;
        this._syncWorker.postMessage('start_visible');
    }

    private gotoPurchaseHistory() {
        this.props.history.push('/purchase-history');
    }

    private sync_subText_render() {
        if (this.props.sync.isSyncing_visible) {
            return Localization.syncing_with_dots;
        } else if (this.props.sync.errorList.length) {
            return (
                <>
                    <span>{Localization.msg.ui.sync_error}</span>&nbsp;
                    <small>({Localization.retry}&nbsp;<i className="fa fa-refresh"></i>)</small>
                </>
            );
            // return this.handleError({ error: this.props.sync.errorList[0].response, notify: false }).body;
        } else if (this.props.sync.syncDate) {
            return Localization.last_synced_on + ' ' + this.timestamp_to_fullFormat(this.props.sync.syncDate!);
        }
        return;
        // return (
        //     <>
        //         {
        //             this.props.sync.isSyncing_visible ?
        //                 Localization.syncing_with_dots :
        //                 (
        //                     this.props.sync.syncDate ?
        //                         (
        //                             Localization.last_synced_on +
        //                             ' ' +
        //                             this.timestamp_to_fullFormat(this.props.sync.syncDate!)
        //                         ) :
        //                         ''
        //                 )
        //         }
        //     </>
        // )
    }

    render() {

        return (
            <>
                <div className="dashboard-more-wrapper">
                    <ul className="more-list list-group list-group-flush">
                        <li className={
                            "more-item list-group-item p-align-0 cursor-pointer "
                            + (this.props.network_status === NETWORK_STATUS.OFFLINE ? 'disabled' : '')
                        }
                            onClick={() => this.onSync_clicked()}
                        >
                            <div className="icon-wrapper mr-3">
                                <i className={"fa fa-refresh " + (this.props.sync.isSyncing_visible ? 'fa-spin' : '')}></i>
                            </div>
                            <div className="wrapper d-inline">
                                <span className="text">
                                    {Localization.sync}
                                    {
                                        this.props.network_status === NETWORK_STATUS.OFFLINE
                                            ? <i className="fa fa-wifi text-danger"></i> : ''
                                    }
                                </span>
                                <span className="sub-text d-block text-muted">
                                    {this.sync_subText_render()}
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

                        <li className="more-item list-group-item p-align-0 disabled">
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
                        <li className="more-item list-group-item p-align-0 disabled">
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
        reset_sync: () => dispatch(action_reset_sync()),
        reset_reader: () => dispatch(action_reset_reader()),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        cart: state.cart,
        sync: state.sync,
        network_status: state.network_status,
    }
}

export const DashboardMore = connect(state2props, dispatch2props)(DashboardMoreComponent);
