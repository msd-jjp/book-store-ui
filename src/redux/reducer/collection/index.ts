import { EACTIONS } from "../../ActionEnum";
import { COLLECTION_VIEW } from "../../../enum/Library";
import { ICollection_schema, ICollectionAction } from "../../action/collection/collectionAction";

let collection_schema_reset = {
    view: COLLECTION_VIEW.grid,
    data: [],
};

export function reducer(state: ICollection_schema, action: ICollectionAction): ICollection_schema {
    switch (action.type) {
        case EACTIONS.SET_COLLECTION_DATA:
            let newData: any = action.payload;
            return { ...state, data: newData };
        case EACTIONS.SET_COLLECTION_VIEW:
            let newView: any = action.payload;
            return { ...state, view: newView };
        case EACTIONS.CLEAR_COLLECTION:
            return collection_schema_reset;
    }
    if (state) { return state; }
    return collection_schema_reset;
}
