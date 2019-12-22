import { EACTIONS } from "../../ActionEnum";
import { IDeviceKey_schema, IDeviceKeyAction } from "../../action/device-key/deviceKeyAction";

export function reducer(state: IDeviceKey_schema, action: IDeviceKeyAction): IDeviceKey_schema {
    switch (action.type) {
        case EACTIONS.UPDATE_DEVICE_KEY:
            return action.payload as IDeviceKey_schema;
        case EACTIONS.RESET_DEVICE_KEY:
            return { deviceKey: undefined, show: false, notExistInServer: false };
    }
    if (state) { return state; }
    return { deviceKey: undefined, show: false, notExistInServer: false };
}
