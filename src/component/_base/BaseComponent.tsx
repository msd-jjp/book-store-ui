import React from 'react';
import { Setup, TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';

interface IHandleError {
    error?: any;
    notify?: boolean;
    type?: 'ui' | 'back';
    title?: string;
    body?: string;
    timeout?: number;
}
interface IHandleErrorResolve {
    title: string | undefined;
    body: string | undefined;
}

interface IBaseProps {
    internationalization: TInternationalization;
}

export abstract class BaseComponent<p extends IBaseProps, S = {}, SS = any> extends React.Component<p, S, SS> {

    async handleError(obj: IHandleError): Promise<IHandleErrorResolve> {
        return new Promise<any>(resolve => {
            const defaults = {
                error: {},
                returnText: true,
                type: 'ui',
                title: '',
                body: '',
                timeout: ''
            };
            obj = Object.assign({}, defaults, obj);

            const status = obj.error.status;
            // 
            // const SnotifyConfig = { timeout: obj.timeout || Setup.notify.timeout.error };

            let notifyBody; // = this._translateService.instant('msg.UI.msg5');
            // const notifyTitle = obj.title || status; // note: remove status later
            let notifyTitle;

            //   this._translateService.get('test').subscribe(async test_tr => {
            // debugger;
            notifyBody = Localization.msg.ui.msg2; // this._translateService.instant('msg.UI.msg5');
            if (obj.title) {
                /* let gholi:any = obj.title;
                if(Localization.hasOwnProperty(obj.title) && obj.title in Object.keys(Localization) ){
                    Object.keys(Localization).includes(obj.title) && Localization[obj.title];   
                } */
                notifyTitle = Localization[obj.title] || obj.title; // this._translateService.instant(obj.title);
            } else {
                notifyTitle = status; // note: remove status later
            }
            // const notifyTitle = this._translateService.instant(obj.title) || status; // note: remove status later

            if (status === 401) {
                // ServiceBaseClass.removeToken();
                // AccessService.removeAppAccessList();

                //"msg4": "مجددا وارد سیستم شوید.",
                /* notifyBody = obj.body || this._translateService.instant('msg.UI.msg4');
                if (!obj.returnText) {
                  ServiceBaseClass.removeToken();
                  // AccessService.removeAppAccessList();
                  // UserService.clearUserProfile();
      
                  this._snotifyService.error(notifyBody, notifyTitle, this.getSnotifyConfig(SnotifyConfig));
                  await this.waitOnMe(this._appSetup.snotifyConfigObj.timeout);
                  this._snotifyService.clear();
                  // AuthService.redirectUrl = this._router.url;
                  // this._router.navigate(['login']);
                  resolve({title: notifyTitle, body: notifyBody});
                  return;
                } */

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
                //   notifyBody = obj.body || this._translateService.instant('msg.UI.msg6');

            } else if (status === 504) {
                //   notifyBody = obj.body || this._translateService.instant('msg.UI.msg6');

            } else if (status >= 500) {
                //   notifyBody = obj.body || this._translateService.instant('msg.UI.msg6');

            } else {
                //
            }
            if (obj.notify) {
                //   this._snotifyService.error(notifyBody, notifyTitle, this.getSnotifyConfig(SnotifyConfig));
            }
            resolve({ title: notifyTitle, body: notifyBody });
            //   });
        });
    }

    apiSuccessNotify() {
        /* this._translateService.get('msg.UI.msg2').subscribe(notifyBody => {
          this._snotifyService.success(notifyBody, '', this.getSnotifyConfig({timeout: this._appSetup.notify.timeout.success}));
        }); */
    }

    waitOnMe(timer: number = 500): Promise<boolean> {
        return new Promise((res, rej) => {
            setTimeout(function () {
                res(true);
            }, timer);
        });
    }

    getNotifyConfig(config?: any) {
        let obj = {
            position: "top-center",
            autoClose: Setup.notify.timeout.error,
            hideProgressBar: false,
            newestOnTop: true,
            closeOnClick: true,
            rtl: this.props.internationalization.rtl,
            pauseOnVisibilityChange: true,
            draggable: true,
            pauseOnHover: true,
        }
        obj = Object.assign(obj, config);

        return obj;
    }

}