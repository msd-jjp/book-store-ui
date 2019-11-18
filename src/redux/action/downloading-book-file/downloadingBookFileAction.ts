import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface IDownloadingBookFile_schema {
    book_id: string;
    /** true if downloading book main file, false if it is sample file.*/
    mainFile: boolean;
    /** always inProgress, if start: will pushed to download queue, if stop: will be removed from download queue. */
    status: 'start' | 'stop' | 'inProgress';
    /** a number between 0, 100 */
    progress: number;
}

export interface IDownloadingBookFileAction extends Action<EACTIONS> {
    payload: IDownloadingBookFile_schema[] | undefined;
}
