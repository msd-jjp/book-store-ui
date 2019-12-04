import { DeviceKeyService } from "../../../service/service.device-key";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { Store2 } from "../../../redux/store";
import { BaseService } from "../../../service/service.base";
import { Utility } from "../../../asset/script/utility";

export class DeviceKey {
    private static _deviceKeyService = new DeviceKeyService();

    static async check() {

        let user_id;
        const user = Store2.getState().logged_in_user;
        if (user) user_id = user.id;
        if (!user_id) return;
        const _deviceKey = appLocalStorage.find_deviceKeyByUserId(user_id);
        if (!_deviceKey) {

            if (BaseService.isAppOffline()) {
                debugger;
                // todo:
                // _deviceKey nadari kolan,
                // error notify --> net ro vasl kon & reload kon. (show modal).
                
                /* this.toastNotify(
                    Localization.msg.ui.device_key_not_found_reload,
                    { autoClose: false, toastId: 'check_book_error_error' },
                    'error'
                ); */
                return;
            }

            DeviceKey.generate();

        } else {
            if (BaseService.isAppOffline()) return;
            await this._deviceKeyService.getById(_deviceKey.id).catch(e => {
                // debugger;
                if (e.response && e.response.status === 404) {
                    appLocalStorage.removeFromCollection('clc_deviceKey', _deviceKey.id);
                    DeviceKey.generate();
                }
            });
        }
    }

    private static async generate() {
        await this._deviceKeyService.generate(JSON.stringify(Utility.browserDetail())).catch(e => {
            // todo: if not allowed --> tell user: u reached maximum device number, remove at least one.
            //      show list of device
            debugger;
            if (e && e.response && e.response.data && e.response.data.msg === 'maximum_active_device') {
                //todo: open modal show list of active device
            }
        });
    }
}
