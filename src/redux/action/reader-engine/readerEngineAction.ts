import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IReaderEngine_schema {
    status: 'inited' | 'initing' | 'failed';
    reader_status: 'downloading' | 'idle';
    wasm_status: 'downloading' | 'idle';
    // downloadStatus: 'downloading' | 'idle'; //  | 'downloaded'
}

export interface IReaderEngineAction extends Action<EACTIONS> {
    payload: IReaderEngine_schema | undefined;
}
