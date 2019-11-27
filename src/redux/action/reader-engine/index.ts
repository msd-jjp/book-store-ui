import { EACTIONS } from "../../ActionEnum";
import { IReaderEngineAction, IReaderEngine_schema } from "./readerEngineAction";

export function action_update_reader_engine(data: IReaderEngine_schema): IReaderEngineAction {
    return {
        type: EACTIONS.UPDATE_READER_ENGINE,
        payload: data
    }
}
