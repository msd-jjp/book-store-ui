import { EACTIONS } from "../../ActionEnum";
import { ICollectionAction } from "./collectionAction";
import { ICollection } from "../../../model/model.collection";
import { COLLECTION_VIEW } from "../../../enum/Library";

export function action_set_collections_data(data: ICollection[]): ICollectionAction {
    return {
        type: EACTIONS.SET_COLLECTION_DATA,
        payload: data
    }
}

export function action_clear_collections(): ICollectionAction {
    return {
        type: EACTIONS.CLEAR_COLLECTION,
        payload: null
    }
}

export function action_set_collections_view(view: COLLECTION_VIEW): ICollectionAction {
    return {
        type: EACTIONS.SET_COLLECTION_VIEW,
        payload: view
    }
}

