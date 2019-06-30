import { InternationalizationAction } from "./InternationalizationAction";
import { EACTIONS } from "../../ActionEnum";
import { TInternationalization } from "../../../config/setup";

export function action_change_app_flag(internationalization: TInternationalization): InternationalizationAction {
    return {
        type: EACTIONS.CHANGE_APP_FLAG,
        payload: internationalization
    }
}
