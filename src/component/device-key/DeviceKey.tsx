import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
import { Modal } from 'react-bootstrap';
import { DeviceKeyService } from '../../service/service.device-key';
import { Store2 } from '../../redux/store';
import { appLocalStorage } from '../../service/appLocalStorage';
import { BaseService } from '../../service/service.base';
import { Utility, IBrowserDetail } from '../../asset/script/utility';
import { IDeviceKey } from '../../model/model.device-key';
import { IUser } from '../../model/model.user';

interface IProps {
    internationalization: TInternationalization;
    // network_status: NETWORK_STATUS;
}

interface IState {
    modal_deviceList: {
        show: boolean;
        list: IDeviceKey[];
        loading: boolean;
        errorText: string | undefined;
    }
}

class DeviceKeyComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_deviceList: {
            show: false,
            list: [],
            loading: false,
            errorText: undefined
        }
    };
    private _deviceKeyService = new DeviceKeyService();

    componentWillMount() {
        this.check();
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }

    private getUserId(): IUser['id'] | undefined {
        const user = Store2.getState().logged_in_user;
        return user ? user.id : undefined;
    }

    private async check() {
        const user_id = this.getUserId();
        if (!user_id) return;
        const _deviceKey = appLocalStorage.find_deviceKeyByUserId(user_id);

        if (!_deviceKey) {

            if (BaseService.isAppOffline()) {
                this.toastNotify(
                    Localization.msg.ui.device_key_not_found_reload,
                    { autoClose: false, toastId: 'check_book_error_error' },
                    'error'
                );
                return;
            }

            this.generate();

        } else {
            if (BaseService.isAppOffline()) return;
            await this._deviceKeyService.getById(_deviceKey.id).catch(e => {
                if (e.response && e.response.status === 404) {
                    appLocalStorage.removeFromCollection('clc_deviceKey', _deviceKey.id);
                    this.generate();
                }
            });
        }
    }

    private async generate() {
        await this._deviceKeyService.generate(JSON.stringify(Utility.browserDetail())).catch(e => {
            if (e && e.response && e.response.data && e.response.data.msg === 'maximum_active_device') {
                debugger;
                this.toastNotify(
                    Localization.msg.ui.you_reached_maximum_active_device,
                    { autoClose: false, toastId: 'deviceKeyGenerate_error' },
                    'error'
                );
                this.openModal_deviceList();
            }
        });
    }

    private async fetch_deviceKeyList() {
        const user_id = this.getUserId(); if (!user_id) return;
        this.setState({
            ...this.state, modal_deviceList: { ...this.state.modal_deviceList, loading: true, errorText: undefined }
        });
        const res = await this._deviceKeyService.getAllByUserId(user_id).catch(e => {
            const errObj = this.handleError({ error: e, toastOptions: { toastId: 'fetch_deviceKeyList_error' }, notify: false });
            this.setState({
                ...this.state, modal_deviceList: {
                    ...this.state.modal_deviceList, errorText: errObj.body, loading: false
                }
            });
        });
        if (res) {
            // this.setState({ deviceKeyList: res.data.result });
            this.setState({
                ...this.state, modal_deviceList: {
                    ...this.state.modal_deviceList,
                    list: res.data.result,
                    loading: false
                }
            });
        }
    }

    private removeDeviceKey_inProgressList: string[] = [];
    private async removeDeviceKey(deviceKeyId: IDeviceKey['id']) {
        debugger;
        if (this.removeDeviceKey_inProgressList.includes(deviceKeyId)) return;
        this.removeDeviceKey_inProgressList.push(deviceKeyId);

        const res = await this._deviceKeyService.remove(deviceKeyId).catch(e => {
            this.handleError({ error: e, toastOptions: { toastId: 'removeDeviceKey_error' } });
        });
        if (res) {
            const list: IDeviceKey[] = [...this.state.modal_deviceList.list];
            const index = list.findIndex(dk => dk.id === deviceKeyId);
            if (index !== -1) {
                list.splice(index, 1);
                this.setState({
                    ...this.state, modal_deviceList: { ...this.state.modal_deviceList, list }
                });
            }
        }

        const inProgress_index = this.removeDeviceKey_inProgressList.indexOf(deviceKeyId);
        inProgress_index !== -1 && this.removeDeviceKey_inProgressList.splice(inProgress_index);
    }

    //#region modal_deviceList
    openModal_deviceList() {
        this.fetch_deviceKeyList();
        this.setState({ ...this.state, modal_deviceList: { ...this.state.modal_deviceList, show: true } });
    }

    closeModal_deviceList() {
        this.setState({ ...this.state, modal_deviceList: { ...this.state.modal_deviceList, show: false } });
    }

    getDeviceKey_parsedName(deviceKeyName: IDeviceKey['name']) {
        let parsedName;
        try { parsedName = JSON.parse(deviceKeyName) } catch (e) { };
        let rtn = '';
        if (!parsedName) rtn = Localization.unknown;
        else {
            const pn = (parsedName as IBrowserDetail);
            const os = Localization.operating_system;
            const browser = Localization.browser;
            const version = Localization.version;
            rtn = `${os}: ${pn.OSName},  ${browser}: ${pn.browserName},  ${version}: ${pn.majorVersion}`;
        }
        return rtn;
    }

    modal_deviceList_render() {
        return (
            <>
                <Modal show={this.state.modal_deviceList.show} onHide={() => this.closeModal_deviceList()} centered>
                    <Modal.Header closeButton className="border-bottom-0 pb-0">
                        {/* <Modal.Title className="text-danger_">app info</Modal.Title> */}
                        <div className="modal-title h6">{Localization.active_device_list}</div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <div className=" table-responsive">
                                    <table className="table table-striped table-borderless table-hover table-sm mb-0">
                                        <caption className={
                                            'px-2 text-center ' +
                                            ((this.state.modal_deviceList.loading || this.state.modal_deviceList.errorText) ?
                                                '' : 'd-none')
                                        }>{
                                                this.state.modal_deviceList.loading ? Localization.loading_with_dots :
                                                    this.state.modal_deviceList.errorText ?
                                                        <>
                                                            <div className="text-danger">{this.state.modal_deviceList.errorText}</div>
                                                            <button className="btn btn-light" onClick={() => this.fetch_deviceKeyList()}>
                                                                {Localization.retry}&nbsp;
                                                            <i className="fa fa-refresh"></i>
                                                            </button>
                                                        </> : ''
                                            }</caption>

                                        <tbody>
                                            {(this.state.modal_deviceList.list! as Array<IDeviceKey> || []).map((item, itemIndex) => (
                                                <tr key={itemIndex}>
                                                    <td className="max-w-25px-- align-middle">{itemIndex + 1}</td>
                                                    <td className="text-nowrap-ellipsis">
                                                        <small className="text-muted">{this.getFromNowDate(item.creation_date)}</small>
                                                        <div>{this.getDeviceKey_parsedName(item.name)}</div>
                                                    </td>
                                                    {/* <td className="text-nowrap-ellipsis">
                                                        {this.getFromNowDate(item.creation_date)}
                                                    </td> */}
                                                    <td className="cursor-pointer text-center max-w-25px-- align-middle"
                                                        onClick={() => this.removeDeviceKey(item.id)}
                                                        title={Localization.remove}
                                                    >
                                                        <i className="fa fa-times text-danger"></i>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_deviceList()}>
                            {Localization.close}
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    //#endregion


    render() {

        return (
            <>
                {this.modal_deviceList_render()}
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
        // network_status: state.network_status,
    }
}

export const DeviceKey = connect(state2props, dispatch2props)(DeviceKeyComponent);
