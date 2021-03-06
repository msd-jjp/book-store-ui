import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import { AxiosError } from "axios";

export interface ISync_schema {
    /** latest sync date*/
    syncDate: number | undefined;
    /** true if in syncing progress*/
    isSyncing_hidden: boolean;
    /** true if user clicked syncing*/
    isSyncing_visible: boolean;
    /** if syncing occurs an error*/
    errorList: AxiosError[];
}

export interface ISyncAction extends Action<EACTIONS> {
    payload: ISync_schema | undefined;
}
