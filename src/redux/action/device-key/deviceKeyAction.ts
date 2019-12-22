import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { IDeviceKey } from "../../../model/model.device-key";

export interface IDeviceKey_schema {
    deviceKey: IDeviceKey | undefined;
    show: boolean;
    notExistInServer: boolean;
}

export interface IDeviceKeyAction extends Action<EACTIONS> {
    payload: IDeviceKey_schema | undefined;
}
