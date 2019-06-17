import { BaseModel } from "./model.base";

export interface IUser extends BaseModel {
    name: string;
    avatar?: string;
    username: string;
    password: string;
}