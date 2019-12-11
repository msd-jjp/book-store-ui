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
import { Utility, IBrowserDetail } from '../../asset/script/utility';
import { IDeviceKey } from '../../model/model.device-key';
import { IUser } from '../../model/model.user';
import { BtnLoader } from '../form/btn-loader/BtnLoader';
import { NETWORK_STATUS } from '../../enum/NetworkStatus';
import { IDeviceKey_schema } from '../../redux/action/device-key/deviceKeyAction';
import { action_update_device_Key } from '../../redux/action/device-key';

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
    device_key: IDeviceKey_schema;
    update_device_Key?: (data: IDeviceKey_schema) => any;
}

interface IState {
    modal_deviceList: {
        show: boolean;
        list: IDeviceKey[];
        loading: boolean;
        errorText: string | undefined;
        btn: {
            visible: boolean;
            enable: boolean;
            loading: boolean;
        };
        msg: string | undefined;
    }
}

class DeviceKeyComponent extends BaseComponent<IProps, IState> {
    state = {
        modal_deviceList: {
            show: false,
            list: [],
            loading: false,
            errorText: undefined,
            btn: {
                visible: false,
                enable: false,
                loading: false,
            },
            msg: undefined,
        }
    };
    private _deviceKeyService = new DeviceKeyService();

    componentWillMount() {
        if (this.props.device_key.show) {
            if (this.props.update_device_Key) {
                this.props.update_device_Key({ ...this.props.device_key, show: false });
            }
        }
        this.check();

    }
    componentWillReceiveProps(nextProps: IProps) {
        if (JSON.stringify(this.props.device_key) !== JSON.stringify(nextProps.device_key)) {
            if (nextProps.device_key.show && !this.props.device_key.show) {
                this.openModal_deviceList();

                if (this.props.update_device_Key) {
                    this.props.update_device_Key({ ...nextProps.device_key, show: false });
                }
            }
        }
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
        // const _deviceKey = appLocalStorage.find_deviceKeyByUserId(user_id);
        const _deviceKey = this.props.device_key.deviceKey;

        if (!_deviceKey) {

            if (this.props.network_status === NETWORK_STATUS.OFFLINE) {
                // if (BaseService.isAppOffline()) {
                this.toastNotify(
                    Localization.msg.ui.device_key_not_found_reload,
                    { autoClose: false, toastId: 'check_book_error_error' },
                    'error'
                );
                return;
            }

            this.generate();

        } else {
            // if (BaseService.isAppOffline()) return;
            if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
            await this._deviceKeyService.getById(_deviceKey.id).catch(e => {
                if (e.response && e.response.status === 404) {
                    appLocalStorage.removeFromCollection('clc_deviceKey', _deviceKey.id);
                    if (this.props.update_device_Key) {
                        this.props.update_device_Key({ ...this.props.device_key, deviceKey: undefined });
                    }
                    this.generate();
                }
            });
        }
    }

    private async generate(notify = false) {
        this.setState({
            modal_deviceList: {
                ...this.state.modal_deviceList,
                btn: { ...this.state.modal_deviceList.btn, loading: true, visible: true }
            }
        });
        const res = await this._deviceKeyService.generate(JSON.stringify(Utility.browserDetail())).catch(e => {
            if (notify) {
                this.handleError({ error: e.response, toastOptions: { toastId: 'generate_error' } });
            }
            if (e && e.response && e.response.data && e.response.data.msg === 'maximum_active_device') {
                this.setState({
                    modal_deviceList: {
                        ...this.state.modal_deviceList,
                        msg: Localization.msg.ui.you_reached_maximum_active_device,
                        btn: { ...this.state.modal_deviceList.btn, loading: false }
                    }
                });
                this.openModal_deviceList();
            } else {
                this.setState({
                    modal_deviceList: {
                        ...this.state.modal_deviceList,
                        btn: { ...this.state.modal_deviceList.btn, loading: false }
                    }
                });
            }
        });
        if (res) {
            const list: IDeviceKey[] = [...this.state.modal_deviceList.list];
            list.unshift(res.data);
            this.setState({
                modal_deviceList: {
                    ...this.state.modal_deviceList,
                    btn: { ...this.state.modal_deviceList.btn, loading: false, visible: false },
                    list
                }
            });

            if (this.props.update_device_Key) {
                this.props.update_device_Key({ ...this.props.device_key, deviceKey: res.data });
            }
        }
    }

    private async fetch_deviceKeyList(show = this.state.modal_deviceList.show) {
        const user_id = this.getUserId(); if (!user_id) return;
        const _deviceKey_list_local = appLocalStorage.getAll_deviceKeyByUserId(user_id);
        // const isAppOffline = BaseService.isAppOffline();
        const isAppOffline = this.props.network_status === NETWORK_STATUS.OFFLINE;
        // show = this.state.modal_deviceList.show;
        this.setState({
            ...this.state, modal_deviceList: {
                ...this.state.modal_deviceList,
                loading: !isAppOffline, errorText: undefined,
                list: _deviceKey_list_local || [],
                show
            }
        });
        if (isAppOffline) return;
        const res = await this._deviceKeyService.getAllByUserId(user_id).catch(e => {
            const errObj = this.handleError({ error: e.response, toastOptions: { toastId: 'fetch_deviceKeyList_error' }, notify: false });
            this.setState({
                ...this.state, modal_deviceList: {
                    ...this.state.modal_deviceList, errorText: errObj.body, loading: false
                }
            });
        });
        if (res) {
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
        if (this.props.network_status === NETWORK_STATUS.OFFLINE) { return; }
        if (this.removeDeviceKey_inProgressList.includes(deviceKeyId)) return;
        this.removeDeviceKey_inProgressList.push(deviceKeyId);

        const res = await this._deviceKeyService.remove(deviceKeyId).catch(e => {
            this.handleError({ error: e.response, toastOptions: { toastId: 'removeDeviceKey_error' } });
        });
        if (res) {
            const list: IDeviceKey[] = [...this.state.modal_deviceList.list];
            const index = list.findIndex(dk => dk.id === deviceKeyId);
            if (index !== -1) {
                list.splice(index, 1);
                this.setState({
                    ...this.state, modal_deviceList: { ...this.state.modal_deviceList, list, msg: undefined }
                });
            }

            if (this.props.update_device_Key && this.props.device_key.deviceKey && this.props.device_key.deviceKey.id === deviceKeyId) {
                this.props.update_device_Key({ ...this.props.device_key, deviceKey: undefined });
            }
        }

        const inProgress_index = this.removeDeviceKey_inProgressList.indexOf(deviceKeyId);
        inProgress_index !== -1 && this.removeDeviceKey_inProgressList.splice(inProgress_index);
    }

    //#region modal_deviceList
    openModal_deviceList() {
        this.fetch_deviceKeyList(true);
        /* const btn = { ...this.state.modal_deviceList.btn };
        if (!this.props.device_key.deviceKey) {
            btn.visible = true;
        } */

        /* this.setState({
            ...this.state, modal_deviceList: {
                ...this.state.modal_deviceList, show: true,
                // btn: { ...btn }
            }
        }); */
    }

    closeModal_deviceList() {
        this.setState({ ...this.state, modal_deviceList: { ...this.state.modal_deviceList, show: false } });
        /* if (this.props.update_device_Key) {
            this.props.update_device_Key({ ...this.props.device_key, show: false });
        } */
    }

    private getDeviceKey_parsedName(deviceKeyName: IDeviceKey['name']) {
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

    private checkIfThisDevice(id: IDeviceKey['id']): boolean {
        if (!this.props.device_key.deviceKey) return false;
        if (this.props.device_key.deviceKey.id === id) return true;
        return false;
    }
    checkIfThisDevice_render(id: IDeviceKey['id']): JSX.Element {
        if (this.checkIfThisDevice(id)) return <span className="ml-2 small badge badge-info">{Localization.this_device}</span>;
        else return <></>;
        // if (!this.props.device_key.deviceKey) return <></>;
        // if (this.props.device_key.deviceKey.id === id) return <span className="ml-2 small badge badge-info">{Localization.this_device}</span>;
        // return <></>;
    }

    private isBtnDisable(): boolean {
        if (this.props.network_status === NETWORK_STATUS.OFFLINE || this.state.modal_deviceList.msg !== undefined) {
            return true;
        }
        return false;
    }
    private isBtnVisible(): boolean {
        return this.state.modal_deviceList.btn.visible || this.props.device_key.deviceKey === undefined;
    }

    modal_deviceList_render() {
        return (
            <>
                <Modal show={this.state.modal_deviceList.show} onHide={() => this.closeModal_deviceList()} centered>
                    <Modal.Header /* closeButton */ className="border-bottom-0 pb-0">
                        {/* <Modal.Title className="text-danger_">app info</Modal.Title> */}
                        <div className="modal-title h6">{Localization.active_device_list}</div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <div className={"alert alert-danger " + (this.state.modal_deviceList.msg ? '' : 'd-none')}>
                                    {this.state.modal_deviceList.msg}
                                </div>
                            </div>
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
                                                        <small className="text-muted">
                                                            {this.getFromNowDate(item.creation_date)}
                                                            {this.checkIfThisDevice_render(item.id)}
                                                        </small>
                                                        <div>{this.getDeviceKey_parsedName(item.name)}</div>
                                                    </td>
                                                    <td className="cursor-pointer text-center max-w-25px-- align-middle"
                                                        onClick={() => this.removeDeviceKey(item.id)}
                                                        title={Localization.remove}
                                                    >
                                                        <i className="fa fa-times text-danger p-2 bg-light rounded"></i>
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
                        <BtnLoader
                            btnClassName={
                                "btn text-success btn-sm text-uppercase min-w-70px "
                                + (this.isBtnVisible() ? '' : 'd-none')
                            }
                            loading={this.state.modal_deviceList.btn.loading}
                            onClick={() => this.generate(true)}
                            disabled={this.isBtnDisable()}
                        >
                            {Localization.submit_this_device}
                            {
                                this.props.network_status === NETWORK_STATUS.OFFLINE
                                    ? <i className="fa fa-wifi text-danger"></i> : ''
                            }
                        </BtnLoader>

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
        update_device_Key: (data: IDeviceKey_schema) => dispatch(action_update_device_Key(data)),
    }
}

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        network_status: state.network_status,
        device_key: state.device_key
    }
}

export const DeviceKey = connect(state2props, dispatch2props)(DeviceKeyComponent);
