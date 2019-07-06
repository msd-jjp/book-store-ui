import { EACTIONS } from "../../ActionEnum";
import { IToken } from "../../../model/model.token";
import { ITokenAction } from "../../action/token/tokenAction";

export function reducer(state: IToken | null , action: ITokenAction): IToken | null {
    switch (action.type) {
        case EACTIONS.SET_TOKEN:
            return action.payload;
        case EACTIONS.REMOVE_TOKEN:
            return action.payload;
    }
    if (state) { return state; }
    return null;
}