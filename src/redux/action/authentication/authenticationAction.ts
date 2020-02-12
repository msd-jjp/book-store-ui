import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export type TAuthentication_schema = null | string;

export interface IAuthenticationAction extends Action<EACTIONS> {
    payload: TAuthentication_schema;
}