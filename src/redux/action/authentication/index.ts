import { EACTIONS } from "../../ActionEnum";
import { IAuthenticationAction } from "./authenticationAction";

export function action_set_authentication(authentication: string): IAuthenticationAction {
    return {
        type: EACTIONS.SET_AUTHENTICATION,
        payload: authentication
    }
}

export function action_remove_authentication(): IAuthenticationAction {
    return {
        type: EACTIONS.REMOVE_AUTHENTICATION,
        payload: null
    }
}