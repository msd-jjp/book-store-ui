import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { TInternationalization } from "../../../config/setup";

export interface IInternationalizationAction extends Action<EACTIONS> {
    payload: TInternationalization;
}