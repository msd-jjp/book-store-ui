import { IUser } from "./model.user";

export interface IToken {
    expiration_date: number;
    id: string;
    username: IUser["username"];
}