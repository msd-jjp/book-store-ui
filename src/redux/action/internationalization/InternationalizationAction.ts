import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { IInternationalization, TInternationalization } from "../../../config/setup";

export interface InternationalizationAction extends Action<EACTIONS> {
    payload: TInternationalization;
}