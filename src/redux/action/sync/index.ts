import { EACTIONS } from "../../ActionEnum";
import { ISyncAction, ISync_schema } from "./syncAction";

export function action_set_sync(data: ISync_schema): ISyncAction {
    return {
        type: EACTIONS.SET_SYNC,
        payload: data
    }
}
