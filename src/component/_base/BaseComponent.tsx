import React from 'react';
import { Setup, TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';
import { toast, ToastOptions, ToastContainerProps } from 'react-toastify';
//
import moment from 'moment';
// import moment_jalaali from "moment-jalaali";
import 'moment/locale/fa';
import 'moment/locale/ar';
import { Utility } from '../../asset/script/utility';

interface IHandleError {
    error?: any;
    notify?: boolean;
    type?: 'ui' | 'back';
    body?: string;
    timeout?: number;
}
export interface IHandleErrorResolve {
    body: string;
}

interface IBaseProps {
    internationalization: TInternationalization;
}

export abstract class BaseComponent<p extends IBaseProps, S = {}, SS = any> extends React.Component<p, S, SS> {
    image_pre_url = '/api/serve-files';
    defaultBookImagePath = "/static/media/img/icon/default-book.png";

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
            toast.error(obj.body, this.getNotifyConfig({ autoClose: obj.timeout }));
        }
        // resolve({ body: obj.body! });
        return { body: obj.body! };
        // });
    }

    translateErrorMsg(errorData: { [key: string]: any, msg: any }) {
        if (errorData.msg === 'msg4') {
            return Localization.formatString(Localization.msg.back.msg4, errorData.time);
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
        };
        return Object.assign(defaults, config);
    }

    gotoTop() {
        window.scrollTo(0, 0);
    }

    getImageUrl(imageId: string): string {
        return this.image_pre_url + '/' + imageId;
    }

    getFromNowDate(timestamp: number): string {
        moment.locale(this.props.internationalization.flag);
        return moment.unix(timestamp).fromNow();
    }

    /* jalaliDateToTimestamp(jDate: string): number {
        moment_jalaali.loadPersian({ usePersianDigits: false });
        let date = moment_jalaali(jDate, 'jYYYY/jM/jD');
        return +date.format('x');
    } */

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


}