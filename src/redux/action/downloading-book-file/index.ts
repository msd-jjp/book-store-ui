import { EACTIONS } from "../../ActionEnum";
// import { ISyncAction, ISync_schema } from "./syncAction";
import { IDownloadingBookFile_schema, IDownloadingBookFileAction } from "./downloadingBookFileAction";

export function action_update_downloading_book_file(data: IDownloadingBookFile_schema[]): IDownloadingBookFileAction {
    return {
        type: EACTIONS.UPDATE_DOWNLOADING_BOOK_FILE,
        payload: data
    }
}

export function action_reset_downloading_book_file(): IDownloadingBookFileAction {
    return {
        type: EACTIONS.RESET_DOWNLOADING_BOOK_FILE,
        payload: undefined
    }
}
