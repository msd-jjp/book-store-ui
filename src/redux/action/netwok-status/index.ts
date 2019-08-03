import { INetworkStatusAction } from "./NetworkStatusAction";
import { EACTIONS } from "../../ActionEnum";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";

export function action_set_network_status(network_status: NETWORK_STATUS): INetworkStatusAction {
    return {
        type: EACTIONS.SET_NETWORK_STATUS,
        payload: network_status
    }
}
