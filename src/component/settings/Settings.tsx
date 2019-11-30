import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
import { NETWORK_STATUS } from '../../enum/NetworkStatus';
import { ToastContainer } from 'react-toastify';

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
}

interface IState {
    modal_logout_show: boolean;
}

class SettingsComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_logout_show: false,
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
                            onClick={() => this.funccc()}>
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
