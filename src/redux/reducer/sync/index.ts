import { EACTIONS } from "../../ActionEnum";
import { ISync_schema, ISyncAction } from "../../action/sync/syncAction";

const sync_reset: ISync_schema = {
    syncDate: undefined,
    isSyncing_hidden: false,
    isSyncing_visible: false,
    errorText: undefined
};

export function reducer(state: ISync_schema, action: ISyncAction): ISync_schema {
    switch (action.type) {
        case EACTIONS.SET_SYNC:
            return action.payload as ISync_schema;
        case EACTIONS.RESET_SYNC:
            return sync_reset;
    }
    if (state) { return state; }
    return sync_reset;
}
