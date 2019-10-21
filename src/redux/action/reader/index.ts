import { EACTIONS } from "../../ActionEnum";
import { IReader_schema, IReaderAction } from "./readerAction";

export function action_update_reader(data: IReader_schema): IReaderAction {
    return {
        type: EACTIONS.UPDATE_READER,
        payload: data
    }
}

export function action_reset_reader(): IReaderAction {
    return {
        type: EACTIONS.RESET_READER,
        payload: undefined
    }
}
