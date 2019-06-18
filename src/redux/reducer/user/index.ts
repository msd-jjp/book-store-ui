import { UserAction } from "../../action/user/UserAction";
import { EACTIONS } from "../../ActionEnum";
import { IUser } from "../../../model/model.user";
import { AnyAction } from "redux";

export function reducer(state: IUser | null | undefined, action: UserAction | AnyAction): IUser | null {
    switch (action.type) {
        case EACTIONS.LOGGED_IN:
            return action.payload;
        case EACTIONS.LOGGED_OUT:
            return action.payload;
    }
    if (state) { return state; }
    return null;
}