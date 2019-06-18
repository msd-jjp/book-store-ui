import { UserAction } from "../../action/user/UserAction";
import { EACTIONS } from "../../ActionEnum";
import { IUser } from "../../../model/model.user";
import { AnyAction } from "redux";

export function reducer(state: IUser | undefined | null, action: UserAction | AnyAction): IUser | null {
    switch (action.type) {
        case EACTIONS.LOGGED_IN:
            return action.payload
        case EACTIONS.LOGGED_OUT:
            return action.payload; // undefined;
    }
    if (state) { return state; }
    return null;
    /* if (state === null) return state
    if (state === undefined) {
        return null;
        return {
            id: "1",
            username: '1',
            name: "1",
            password: "1234"
        };
    }
    return state; */
}