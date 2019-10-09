import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";

export interface ISync_schema {
    syncDate: number | undefined;
    isSyncing_hidden: boolean;
    isSyncing_visible: boolean;
    errorText: string | undefined;
}

export interface ISyncAction extends Action<EACTIONS> {
    payload: ISync_schema;
}
