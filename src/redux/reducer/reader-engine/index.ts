import { EACTIONS } from "../../ActionEnum";
import { IReaderEngine_schema, IReaderEngineAction } from "../../action/reader-engine/readerEngineAction";

export function reducer(state: IReaderEngine_schema, action: IReaderEngineAction): IReaderEngine_schema {
    switch (action.type) {
        case EACTIONS.UPDATE_READER_ENGINE:
            return action.payload as IReaderEngine_schema;
    }
    if (state) { return state; }
    // return { status: 'initing', is_reader_downloaded: false, is_wasm_downloaded: false, downloadStatus: 'idle' };
    return { status: 'initing', reader_status: 'idle', wasm_status: 'idle' };
}
