import { IUser } from "./model.user";
import { BaseModel } from "./model.base";
// import { IBrowserDetail } from "../asset/script/utility";

export interface IDeviceKey extends BaseModel {
    code: string;
    user_id: IUser["id"];
    name: string; // Stringified<IBrowserDetail>;
}