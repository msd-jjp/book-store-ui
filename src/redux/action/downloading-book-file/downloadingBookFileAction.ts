import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IDownloadingBookFile_schema {
    book_id: string;
    /** true if downloading book main file, false if it is sample file.*/
    mainFile: boolean;
    /** */
    status: 'start' | 'stop' | 'inProgress';
}

export interface IDownloadingBookFileAction extends Action<EACTIONS> {
    payload: IDownloadingBookFile_schema[] | undefined;
}
