import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { FILE_STORAGE_KEY } from "../../../service/appLocalStorage/FileStorage";

export interface IDownloadingBookFile_schema {
    /** collection name to store file */
    collectionName: FILE_STORAGE_KEY;
    /** unique id to store file in collection */
    fileId: string;
    /** always inProgress, if start: will pushed to download queue, if stop: will be removed from download queue. */
    status: 'start' | 'stop' | 'inProgress';
    /** a number between 0, 100 */
    progress: number;
    /** file size in byte */
    size?: number;
}

export interface IDownloadingBookFileAction extends Action<EACTIONS> {
    payload: IDownloadingBookFile_schema[] | undefined;
}
