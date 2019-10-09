import { EACTIONS } from "../../ActionEnum";
import { ISyncAction, ISync_schema } from "./syncAction";

export function action_set_sync(data: ISync_schema): ISyncAction {
    return {
        type: EACTIONS.SET_SYNC,
        payload: data
    }
}

export function action_reset_sync(): ISyncAction {
    return {
        type: EACTIONS.RESET_SYNC,
        payload: undefined
    }
}
