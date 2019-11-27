import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IReaderEngine_schema {
    status: 'inited' | 'initing' | 'failed';
}

export interface IReaderEngineAction extends Action<EACTIONS> {
    payload: IReaderEngine_schema | undefined;
}
