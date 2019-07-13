import React from 'react';
import { Setup, TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';
import { toast, ToastOptions, ToastContainerProps } from 'react-toastify';

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
                obj.body = Localization.msg.ui.msg2;
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

    apiSuccessNotify() {

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

}