import { IUser } from "./model.user";
import { BaseModel } from "./model.base";

export interface IDeviceKey extends BaseModel {
    code: string;
    user_id: IUser["id"];
}