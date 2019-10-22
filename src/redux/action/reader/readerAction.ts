import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

type IReader_schema_epub_fontName = 'zar' | 'iransans' | 'nunito';
export interface IReader_schema {
    audio: {};
    epub: {
        fontColor: number;
        bgColor: number;
        fontSize: number;
        fontName: IReader_schema_epub_fontName;
        pageSize: { width: number, height: number };
        fontFiles: {
            [key in IReader_schema_epub_fontName]?: Array<number>;
        }
    };
}

export interface IReaderAction extends Action<EACTIONS> {
    payload: IReader_schema | undefined;
}
