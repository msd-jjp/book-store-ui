import { EACTIONS } from "../../ActionEnum";
import { InternationalizationAction } from "../../action/internationalization/InternationalizationAction";
import { IInternationalization, Setup, TInternationalization } from "../../../config/setup";

export function reducer(state: TInternationalization, action: InternationalizationAction): TInternationalization {
    switch (action.type) {
        case EACTIONS.CHANGE_APP_FLAG:
            return action.payload;
    }
    if (state) { return state; }
    return Setup.internationalization;
}