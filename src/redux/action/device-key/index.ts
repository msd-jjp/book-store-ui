import { EACTIONS } from "../../ActionEnum";
import { IDeviceKeyAction, IDeviceKey_schema } from "./deviceKeyAction";

export function action_update_device_Key(data: IDeviceKey_schema): IDeviceKeyAction {
    return {
        type: EACTIONS.UPDATE_DEVICE_KEY,
        payload: data
    }
}

export function action_reset_device_Key(): IDeviceKeyAction {
    return {
        type: EACTIONS.RESET_DEVICE_KEY,
        payload: undefined
    }
}
