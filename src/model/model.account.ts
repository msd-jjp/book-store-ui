import { BaseModel } from "./model.base";

export interface IAccount extends BaseModel {
    value: number;
    type: string | 'Main';
    // person: IPerson;
}