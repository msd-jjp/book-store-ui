import React from 'react';
import { Setup, TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';
import { toast, ToastOptions, ToastContainerProps } from 'react-toastify';
//
import moment from 'moment';
import moment_jalaali from "moment-jalaali";
import 'moment/locale/fa';
import 'moment/locale/ar';
import { Utility } from '../../asset/script/utility';
import { IPerson } from '../../model/model.person';
import { CmpUtility } from './CmpUtility';
import { Store2 } from '../../redux/store';
import { IBook } from '../../model/model.book';
import { BOOK_TYPES } from '../../enum/Book';
import { History } from "history";
import { action_user_logged_out } from '../../redux/action/user';
import { action_remove_token } from '../../redux/action/token';
import { BaseService } from '../../service/service.base';
import { action_remove_authentication } from '../../redux/action/authentication';
import { appLocalStorage } from '../../service/appLocalStorage';
import { LoginService } from '../../service/service.login';
import { action_clear_cart } from '../../redux/action/cart';
import { action_clear_library } from '../../redux/action/library';
import { LibraryService } from '../../service/service.library';
import { CollectionService } from '../../service/service.collection';
import { action_clear_collections } from '../../redux/action/collection';
import { action_reset_sync } from '../../redux/action/sync';
import { action_reset_reader } from '../../redux/action/reader';
import { action_reset_device_Key } from '../../redux/action/device-key';
import { action_reset_downloading_book_file } from '../../redux/action/downloading-book-file';
import { DeviceKeyService } from '../../service/service.device-key';

interface IHandleError {
    error?: any;
    notify?: boolean;
    type?: 'ui' | 'back';
    body?: string;
    timeout?: number;
    toastOptions?: ToastOptions;
}
export interface IHandleErrorResolve {
    body: string;
}

interface IBaseProps {
    internationalization: TInternationalization;
}

export abstract class BaseComponent<p extends IBaseProps, S = {}, SS = any> extends React.Component<p, S, SS> {
    image_pre_url = CmpUtility.image_pre_url; // '/api/serve-files';
    defaultBookImagePath = CmpUtility.defaultBookImagePath; // "/static/media/img/icon/default-book.png";
    defaultPersonImagePath = "/static/media/img/icon/avatar.png";

    /* async  */
    handleError(handleErrorObj: IHandleError): IHandleErrorResolve { // Promise<IHandleErrorResolve>
        // return new Promise<IHandleErrorResolve>(resolve => {
        const defaults: IHandleError = {
            // error: {},
            notify: true,
            type: 'ui',
            // body: '', // Localization.msg.ui.msg2,
            timeout: Setup.notify.timeout.error
        };
        let obj = Object.assign({}, defaults, handleErrorObj);

        const status = (obj.error || {}).status;

        if (!obj.body) {
            if (obj.error) {
                if (obj.error.data) {
                    if (obj.error.data.msg) {
                        obj.body = this.translateErrorMsg(obj.error.data) || Localization.msg.ui.msg2;
                    } else {
                        obj.body = Localization.msg.ui.msg2;
                    }
                } else {
                    obj.body = Localization.msg.ui.msg2;
                }
            } else {
                obj.body = Localization.msg.ui.no_network_connection;
            }
        }


        if (status === 401) {

        } else if (status === 403) {
            //

        } else if (status === 406) {
            //

        } else if (status === 409) {
            //

        } else if (status === 486) {
            //

        } else if (status === 502) {
            //"msg6": "خطا در برقراری ارتباط با سرور رخ داد.",

        } else if (status === 504) {

        } else if (status >= 500) {

        } else {
            //
        }

        if (obj.notify) {
            // toast.configure(this.getNotifyContainerConfig());
            const toastOptions = Object.assign((obj.toastOptions || {}), { autoClose: obj.timeout, render: obj.body });
            if (toastOptions.toastId && toast.isActive(toastOptions.toastId)) {
                toast.update(toastOptions.toastId, this.getNotifyConfig(toastOptions));
            } else {
                toast.error(obj.body, this.getNotifyConfig(toastOptions));
            }
        }
        // resolve({ body: obj.body! });
        return { body: obj.body! };
        // });
    }

    translateErrorMsg(errorData: { [key: string]: any, msg: any }) {
        if (errorData.msg_ui) {
            return Localization.msg.ui[errorData.msg_ui];
        }
        if (errorData.msg === 'msg4') {
            return Localization.formatString(Localization.msg.back.already_has_valid_key, errorData.time);
        } else {
            return Localization.msg.back[errorData.msg];
        }
    }

    apiSuccessNotify(
        notifyBody: string = Localization.msg.ui.msg1,
        config: ToastOptions = { autoClose: Setup.notify.timeout.success },
    ) {
        toast.success(notifyBody, this.getNotifyConfig(config));
    }

    toastNotify(notifyBody: string, config: ToastOptions, toastType: 'info' | 'success' | 'error' | 'warn') {
        if (config.toastId && toast.isActive(config.toastId)) {
            toast.update(config.toastId, this.getNotifyConfig({ ...config, ...{ render: notifyBody } }));
        } else {
            toast[toastType](notifyBody, this.getNotifyConfig(config));
        }
    }

    waitOnMe(timer: number = 500): Promise<boolean> {
        return new Promise((res, rej) => {
            setTimeout(function () {
                res(true);
            }, timer);
        });
    }

    getNotifyConfig(config?: ToastOptions): ToastOptions {
        const defaults: ToastOptions = {
            position: "top-center",
            autoClose: Setup.notify.timeout.error,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
            pauseOnHover: true,
        };
        return Object.assign(defaults, config);
    }

    getNotifyContainerConfig(config?: ToastContainerProps): ToastContainerProps {
        const defaults: ToastContainerProps = {
            newestOnTop: true,
            rtl: this.props.internationalization.rtl,
            closeButton: false,
        };
        return Object.assign(defaults, config);
    }

    gotoTop() {
        window.scrollTo(0, 0);
    }

    getImageUrl(imageId: string): string {
        return this.image_pre_url + '/' + imageId;
    }

    /**
     * @param timestamp: number in second
     */
    protected getFromNowDate(timestamp: number): string {
        moment.locale(this.props.internationalization.flag);
        return moment.unix(timestamp).fromNow();
    }

    /* jalaliDateToTimestamp(jDate: string): number {
        moment_jalaali.loadPersian({ usePersianDigits: false });
        let date = moment_jalaali(jDate, 'jYYYY/jM/jD');
        return +date.format('x');
    } */

    /**
     * @param timestamp: number in second
     */
    protected timestamp_to_fullFormat(timestamp: number): string {
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

    /**
     * @param timestamp: number in milisecond
     */
    protected timestamp_to_date(timestamp: number) {
        try {
            if (this.props.internationalization.flag === "fa") {
                return moment_jalaali(timestamp * 1000).locale("en").format('jYYYY/jM/jD');
            } else {
                return moment(timestamp * 1000).locale("en").format('YYYY/MM/DD');
            }
        } catch (e) { console.error('baseCMP method timestamp_to_date:', e) }
    }

    isDeviceMobileOrTablet(): boolean {
        return Utility.mobileAndTabletcheck();
    }

    imageOnError(e: any, defaultImagePath: string) {//React.SyntheticEvent<HTMLImageElement, Event>
        // let defaultImagePath = "/static/media/img/icon/default-book.png";
        // let target  = (<React.SyntheticEvent<HTMLImageElement>>e.target).src
        if (e.target.src !== window.location.origin + defaultImagePath) {
            // e.target.onerror = null;
            e.target.src = defaultImagePath;
        }
    }

    bookImageOnError(e: any) {
        return this.imageOnError(e, "/static/media/img/icon/broken-book.png");
    }

    personImageOnError(e: any) {
        return this.imageOnError(e, "/static/media/img/icon/broken-avatar.png");
    }

    getPersonFullName(person: IPerson): string {
        let name = person.name || '';
        let last_name = person.last_name || '';
        name = name ? name + ' ' : '';
        return (name + last_name).trim();
    }

    readerEngineNotify(): void {
        const downloading = Store2.getState().reader_engine.reader_status === 'downloading' ||
            Store2.getState().reader_engine.wasm_status === 'downloading';
        const failed = Store2.getState().reader_engine.status === 'failed';

        let msg = Localization.msg.ui.initing_reader_security_content;
        let color: "info" | "error" = 'info';

        if (failed) {
            msg = Localization.msg.ui.reader_security_content_failed;
            color = 'error';
        } else if (downloading) { msg = Localization.msg.ui.downloading_reader_security_content; }

        this.toastNotify(msg, { autoClose: Setup.notify.timeout[color], toastId: 'readerEngineNotify_info' }, color);
    }

    openBookByReader(book: IBook, history: History, isOriginalFile: boolean): void {
        if (Store2.getState().reader_engine.status !== 'inited') {
            this.readerEngineNotify();
            return;
        }
        const isAudio = book.type === BOOK_TYPES.Audio;
        if (isAudio) {
            history.push(`/reader/${book.id}/${isOriginalFile}/audio`);
        } else {
            history.push(`/reader/${book.id}/${isOriginalFile}/reading`);
        }
    }

    async onApplogout(history: History, remove_deviceKey_fromServer: boolean) {
        // debugger;
        const _deviceKey = Store2.getState().device_key.deviceKey;
        const deviceKey_id = _deviceKey ? _deviceKey.id : undefined;
        deviceKey_id && appLocalStorage.removeFromCollection('clc_deviceKey', deviceKey_id);
        Store2.dispatch(action_reset_device_Key());
        if (remove_deviceKey_fromServer && deviceKey_id) {
            (new DeviceKeyService()).remove(deviceKey_id).catch(e => { });
        }

        Store2.dispatch(action_user_logged_out());
        Store2.dispatch(action_remove_token());
        BaseService.removeToken();
        Store2.dispatch(action_remove_authentication());
        appLocalStorage.removeFromCollection('clc_eTag', LoginService.generalId_profile);

        Store2.dispatch(action_clear_cart());

        Store2.dispatch(action_clear_library());
        appLocalStorage.removeFromCollection('clc_eTag', LibraryService.generalId);
        Store2.dispatch(action_clear_collections());
        appLocalStorage.removeFromCollection('clc_eTag', CollectionService.generalId);

        Store2.dispatch(action_reset_sync());
        Store2.dispatch(action_reset_reader());
        // Store2.dispatch(action_reset_device_Key());
        Store2.dispatch(action_reset_downloading_book_file());

        appLocalStorage.afterAppLogout();

        history.push('/login');

    }

}