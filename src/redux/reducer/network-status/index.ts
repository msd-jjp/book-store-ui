import { EACTIONS } from "../../ActionEnum";
import { INetworkStatusAction } from "../../action/netwok-status/NetworkStatusAction";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
// import { BaseService } from "../../../service/service.base";

export function reducer(state: NETWORK_STATUS, action: INetworkStatusAction): NETWORK_STATUS {
    switch (action.type) {
        case EACTIONS.SET_NETWORK_STATUS:
            return action.payload;
    }
    if (state) { return state; }
    return NETWORK_STATUS.ONLINE;
    /* if (BaseService.isAppOffline) {
        return NETWORK_STATUS.OFFLINE;
    } else {
        return NETWORK_STATUS.ONLINE;
    } */
}