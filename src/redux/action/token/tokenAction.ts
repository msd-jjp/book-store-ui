import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { IToken } from "../../../model/model.token";

export interface ITokenAction extends Action<EACTIONS> {
    payload: IToken| null;
}