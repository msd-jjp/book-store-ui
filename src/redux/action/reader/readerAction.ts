import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IReader_schema {
    audio: {};
    epub: {
        fontColor: number;
        bgColor: number;
        fontSize: number;
        fontName: 'zar' | 'iransans' | 'nunito';
        pageSize: { width: number, height: number };
    };
}

export interface IReaderAction extends Action<EACTIONS> {
    payload: IReader_schema | undefined;
}
