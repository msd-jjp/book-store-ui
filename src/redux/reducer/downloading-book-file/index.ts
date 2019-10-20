import { EACTIONS } from "../../ActionEnum";
import { IDownloadingBookFile_schema, IDownloadingBookFileAction } from "../../action/downloading-book-file/downloadingBookFileAction";

export function reducer(state: IDownloadingBookFile_schema[], action: IDownloadingBookFileAction): IDownloadingBookFile_schema[] {
    switch (action.type) {
        case EACTIONS.UPDATE_DOWNLOADING_BOOK_FILE:
            return action.payload as IDownloadingBookFile_schema[];
        case EACTIONS.RESET_DOWNLOADING_BOOK_FILE:
            return [];
    }
    if (state) { return state; }
    return [];
}
