import { EACTIONS } from "../../ActionEnum";
import { IInternationalizationAction } from "../../action/internationalization/InternationalizationAction";
import { Setup, TInternationalization } from "../../../config/setup";

export function reducer(state: TInternationalization, action: IInternationalizationAction): TInternationalization {
    switch (action.type) {
        case EACTIONS.CHANGE_APP_FLAG:
            return action.payload;
    }
    if (state) { return state; }
    return Setup.internationalization;
}