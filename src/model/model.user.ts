import { BaseModel } from "./model.base";
import { IPerson } from "./model.person";

export interface IUser extends BaseModel {
    name: string;
    avatar?: string;
    username: string;
    password: string;
    // person_id: string;
    person: IPerson;
}
