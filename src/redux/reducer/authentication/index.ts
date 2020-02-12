import { EACTIONS } from "../../ActionEnum";
import { IAuthenticationAction, TAuthentication_schema } from "../../action/authentication/authenticationAction";

export function reducer(state: string | null, action: IAuthenticationAction): TAuthentication_schema {
    switch (action.type) {
        case EACTIONS.SET_AUTHENTICATION:
            return action.payload;
        case EACTIONS.REMOVE_AUTHENTICATION:
            return action.payload;
    }
    if (state) { return state; }
    return null;
}