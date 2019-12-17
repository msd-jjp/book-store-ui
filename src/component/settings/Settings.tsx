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
import { action_reset_reader } from '../../redux/action/reader';
import { appLocalStorage } from '../../service/appLocalStorage';
import { Store2 } from '../../redux/store';
import { action_update_reader_engine } from '../../redux/action/reader-engine';
import { READER_FILE_NAME } from '../../webworker/reader-engine/reader-download/reader-download';
import { FILE_STORAGE_KEY } from '../../service/appLocalStorage/FileStorage';
import { is_file_downloading } from '../library/libraryViewTemplate';
import { action_update_device_Key } from '../../redux/action/device-key';
import { IDeviceKey_schema } from '../../redux/action/device-key/deviceKeyAction';

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
    reset_reader: () => any;
    update_device_Key: (data: IDeviceKey_schema) => any;
}

interface IState {
    confirmNotify_gc_show: boolean;
    confirmNotify_css_js_show: boolean;
    confirmNotify_css_wasm_show: boolean;
    confirmNotify_rr_show: boolean;
}

class SettingsComponent extends BaseComponent<IProps, IState> {
    state = {
        confirmNotify_gc_show: false,
        confirmNotify_css_js_show: false,
        confirmNotify_css_wasm_show: false,
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

    private open_confirmNotify_gc() {
        this.setState({ confirmNotify_gc_show: true });
    }
    private close_confirmNotify_gc() {
        this.setState({ confirmNotify_gc_show: false });
    }
    private async confirmNotify_onConfirm_gc() {
        const deleted = await appLocalStorage.clearWorkbox();
        if (!deleted) {
            console.error('wokbox cache not deleted OR already deleted................');
        }
        this.setState({ confirmNotify_gc_show: false });
    }

    private open_confirmNotify_rr() {
        this.setState({ confirmNotify_rr_show: true });
    }
    private close_confirmNotify_rr() {
        this.setState({ confirmNotify_rr_show: false });
    }
    private confirmNotify_onConfirm_rr() {
        this.props.reset_reader();
        this.setState({ confirmNotify_rr_show: false });
    }

    private open_confirmNotify_css_js() {
        this.setState({ confirmNotify_css_js_show: true });
    }
    private close_confirmNotify_css_js() {
        this.setState({ confirmNotify_css_js_show: false });
    }
    private async confirmNotify_onConfirm_css_js() {
        // debugger;
        const ding_wasm = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
        if (ding_wasm) return;
        // const deleted = 
        await appLocalStorage.removeFileById(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.READER2_BOOK_ID);
        await appLocalStorage.removeFileById_partial(FILE_STORAGE_KEY.READER_ENGINE_PARTIAL, READER_FILE_NAME.READER2_BOOK_ID);
        /* if (deleted) {
            appLocalStorage.removeFromCollection('clc_creationDate', READER_FILE_NAME.READER2_BOOK_ID);
            appLocalStorage.removeFromCollection('clc_eTag', READER_FILE_NAME.READER2_BOOK_ID);
        } */
        if (Store2.getState().reader_engine.status !== 'failed') {
            Store2.dispatch(action_update_reader_engine({ ...Store2.getState().reader_engine, status: 'failed' }));
        }
        this.setState({ confirmNotify_css_js_show: false });
    }

    private open_confirmNotify_css_wasm() {
        this.setState({ confirmNotify_css_wasm_show: true });
    }
    private close_confirmNotify_css_wasm() {
        this.setState({ confirmNotify_css_wasm_show: false });
    }
    private async confirmNotify_onConfirm_css_wasm() {
        // debugger;
        const ding_wasm = is_file_downloading(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
        if (ding_wasm) return;
        // const deleted = 
        await appLocalStorage.removeFileById(FILE_STORAGE_KEY.READER_ENGINE, READER_FILE_NAME.WASM_BOOK_ID);
        await appLocalStorage.removeFileById_partial(FILE_STORAGE_KEY.READER_ENGINE_PARTIAL, READER_FILE_NAME.WASM_BOOK_ID);
        /* if (deleted) {
            appLocalStorage.removeFromCollection('clc_creationDate', READER_FILE_NAME.WASM_BOOK_ID);
            appLocalStorage.removeFromCollection('clc_eTag', READER_FILE_NAME.WASM_BOOK_ID);
        } */
        if (Store2.getState().reader_engine.status !== 'failed') {
            Store2.dispatch(action_update_reader_engine({ ...Store2.getState().reader_engine, status: 'failed' }));
        }
        this.setState({ confirmNotify_css_wasm_show: false });
    }

    css_js_text_render() {
        const creationDateObj = appLocalStorage.find_creationDateById(READER_FILE_NAME.READER2_BOOK_ID);
        const title = creationDateObj ?
            this.timestamp_to_fullFormat(creationDateObj.date) + '   ' + this.getFromNowDate(creationDateObj.date / 1000)
            : '';
        return (
            <span title={title}>
                <span>{Localization.javscript_file} </span>
                {creationDateObj ?
                    <small className="text-muted">({this.timestamp_to_date(creationDateObj.date / 1000)})</small>
                    : ''}
            </span>
        )
    }

    css_wasm_text_render() {
        const creationDateObj = appLocalStorage.find_creationDateById(READER_FILE_NAME.WASM_BOOK_ID);
        const title = creationDateObj ?
            this.timestamp_to_fullFormat(creationDateObj.date) + '   ' + this.getFromNowDate(creationDateObj.date / 1000)
            : '';
        return (
            <span title={title}>
                <span>{Localization.webassembly_file} </span>
                {creationDateObj ?
                    <small className="text-muted">({this.timestamp_to_date(creationDateObj.date / 1000)})</small>
                    : ''}
            </span>
        )
    }

    show_activeDeviceList() {
        const device_key = { ...Store2.getState().device_key };
        device_key.show = true;
        this.props.update_device_Key(device_key);
    }

    reloadApp() {
        window.location.reload();
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

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 flex-wrap">
                            <span className="text text-capitalize">{Localization.clear_content_security_system}:</span>
                            <div>
                                <button className="btn text-warning" onClick={() => this.open_confirmNotify_css_js()}
                                >{this.css_js_text_render()}</button>
                                <button className="btn text-warning" onClick={() => this.open_confirmNotify_css_wasm()}
                                >{this.css_wasm_text_render()}</button>
                            </div>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 pb-1 mt-4">
                            <div className="icon-wrapper d-flex mr-3"><i className="fa fa-history"></i></div>
                            <small className="text-uppercase">{Localization.state}</small>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.reloadApp()}>
                            <span className="text text-capitalize">{Localization.reload_app}</span>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.open_confirmNotify_rr()}>
                            <span className="text text-capitalize">{Localization.reset_reader}</span>
                        </li>

                        <li className="settings-item d-flex align-items-center list-group-item p-align-0 cursor-pointer"
                            onClick={() => this.show_activeDeviceList()}>
                            <span className="text text-capitalize">{Localization.active_device_list}</span>
                        </li>

                    </ul>
                </div>

                <ConfirmNotify
                    show={this.state.confirmNotify_gc_show}
                    onHide={() => this.close_confirmNotify_gc()}
                    onConfirm={() => this.confirmNotify_onConfirm_gc()}
                    msg={Localization.msg.ui.clear_general_content}
                    confirmBtn_className='text-warning'
                    confirmBtn_text={Localization.clear}
                />

                <ConfirmNotify
                    show={this.state.confirmNotify_rr_show}
                    onHide={() => this.close_confirmNotify_rr()}
                    onConfirm={() => this.confirmNotify_onConfirm_rr()}
                    msg={Localization.reset_reader}
                    confirmBtn_className='text-warning'
                />

                <ConfirmNotify
                    show={this.state.confirmNotify_css_js_show}
                    onHide={() => this.close_confirmNotify_css_js()}
                    onConfirm={() => this.confirmNotify_onConfirm_css_js()}
                    msg={Localization.clear_content_security_system + ": " + Localization.javscript_file}
                    confirmBtn_className='text-warning'
                    confirmBtn_text={Localization.clear}
                />

                <ConfirmNotify
                    show={this.state.confirmNotify_css_wasm_show}
                    onHide={() => this.close_confirmNotify_css_wasm()}
                    onConfirm={() => this.confirmNotify_onConfirm_css_wasm()}
                    msg={Localization.clear_content_security_system + ": " + Localization.webassembly_file}
                    confirmBtn_className='text-warning'
                    confirmBtn_text={Localization.clear}
                />

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        reset_reader: () => dispatch(action_reset_reader()),
        update_device_Key: (data: IDeviceKey_schema) => dispatch(action_update_device_Key(data)),
    }
}

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        network_status: state.network_status,
    }
}

export const Settings = connect(state2props, dispatch2props)(SettingsComponent);
