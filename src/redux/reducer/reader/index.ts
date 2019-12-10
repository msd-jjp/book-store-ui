import { EACTIONS } from "../../ActionEnum";
import { IReader_schema, IReaderAction } from "../../action/reader/readerAction";
// import { color } from "../../../webworker/reader-engine/tools";

const reader_reset: IReader_schema = {
    audio: {
        volume: 1,
    },
    epub: {
        theme: 'white',
        pageSize: {
            width: 200,
            height: 300
        },
        fontName: 'iransans',
        fontSize: 16,
        fontFiles: {},
        zoom: 100,
    }
};

export function reducer(state: IReader_schema, action: IReaderAction): IReader_schema {
    switch (action.type) {
        case EACTIONS.UPDATE_READER:
            return action.payload as IReader_schema;
        case EACTIONS.RESET_READER:
            return reader_reset;
    }
    if (state) { return state; }
    return reader_reset;
}
