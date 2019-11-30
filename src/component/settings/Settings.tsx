import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
import { NETWORK_STATUS } from '../../enum/NetworkStatus';
import { ToastContainer } from 'react-toastify';
import { ConfirmNotify } from '../form/confirm-notify/ConfirmNotify';

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
}

interface IState {
    confirmNotify_gc_show: boolean;
    confirmNotify_css_show: boolean;
    confirmNotify_rr_show: boolean;
}

class SettingsComponent extends BaseComponent<IProps, IState> {
    state = {
        confirmNotify_gc_show: false,
        confirmNotify_css_show: false,
        confirmNotify_rr_show: false,
    };

    componentWillMount() {
        document.title = Localization.settings;
    }
    componentDidMount() {
        document.title = Localization.settings;
    }
    componentWillUnmount() {
        document.title = Localization.app_title;
    }

    private funccc() {
        debugger;
    }

    private open_confirmNotify_gc() {
        this.setState({ confirmNotify_gc_show: true });
    }
    private close_confirmNotify_gc() {
        this.setState({ confirmNotify_gc_show: false });
    }
    private confirmNotify_onConfirm_gc() {
        debugger;
    }


    render() {

        return (
            <>
                <div className="settings-wrapper">
                    <ul className="settings-list list-group list-group-flush">

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 pb-1 mt-4">
                            <div className="icon-wrapper d-flex mr-3"><i className="fa fa-archive"></i></div>
                            <small className="text-uppercase">{Localization.storage}</small>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.open_confirmNotify_gc()}>
                            <span className="text text-capitalize">{Localization.clear_general_content}</span>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.funccc()}>
                            <span className="text text-capitalize">{Localization.clear_content_security_system}</span>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 pb-1 mt-4">
                            <div className="icon-wrapper d-flex mr-3"><i className="fa fa-history"></i></div>
                            <small className="text-uppercase">{Localization.state}</small>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.funccc()}>
                            <span className="text text-capitalize">{Localization.reset_reader}</span>
                        </li>

                    </ul>
                </div>

                <ConfirmNotify
                    show={this.state.confirmNotify_gc_show}
                    onHide={() => this.close_confirmNotify_gc()}
                    onConfirm={() => this.confirmNotify_onConfirm_gc()}
                    msg={Localization.msg.ui.clear_general_content}
                    confirmBtn_className='text-warning'
                />

                <ToastContainer {...this.getNotifyContainerConfig()} />
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
        network_status: state.network_status,
    }
}

export const Settings = connect(state2props, dispatch2props)(SettingsComponent);
