import { EACTIONS } from "../../ActionEnum";
import { ILibraryAction, ILibrary_schema } from "../../action/library/libraryAction";
import { LIBRARY_VIEW } from "../../../enum/Library";
// import { LIBRARY_VIEW } from "../../../component/library/Library";

let library_schema_reset = {
    view: LIBRARY_VIEW.grid,
    data: [],
    data_version: undefined,
};

export function reducer(state: ILibrary_schema, action: ILibraryAction): ILibrary_schema {
    switch (action.type) {
        case EACTIONS.SET_LIBRARY_DATA:
            let newData: any = action.payload;
            return { ...state, data: newData };
        case EACTIONS.SET_LIBRARY_VIEW:
            let newView: any = action.payload;
            return { ...state, view: newView };
        case EACTIONS.SET_LIBRARY_VERSION:
            let newVersion: any = action.payload;
            return { ...state, data_version: newVersion };
        case EACTIONS.CLEAR_LIBRARY:
            return library_schema_reset;
    }
    if (state) { return state; }
    return library_schema_reset;
}
