import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IAuthenticationAction extends Action<EACTIONS> {
    payload: string | null;
}