import { EACTIONS } from "../../ActionEnum";
import { ILibrary_schema, ILibraryAction } from "./libraryAction";
import { ILibrary } from "../../../model/model.library";
import { LIBRARY_VIEW } from "../../../enum/Library";
// import { ILibrary } from "../../../service/service.library";
// import { LIBRARY_VIEW } from "../../../component/library/Library";

// export function action_add_to_library_data() {
// }

// export function action_remove_from_library_data() {
// }

export function action_set_library_data(data: ILibrary[]): ILibraryAction {
    return {
        type: EACTIONS.SET_LIBRARY_DATA,
        payload: data
    }
}

export function action_clear_library(): ILibraryAction {
    return {
        type: EACTIONS.CLEAR_LIBRARY,
        payload: null
    }
}

export function action_set_library_view(view: LIBRARY_VIEW): ILibraryAction {
    return {
        type: EACTIONS.SET_LIBRARY_VIEW,
        payload: view
    }
}

export function action_set_library_dataVersion(version: string): ILibraryAction {
    return {
        type: EACTIONS.SET_LIBRARY_VIEW,
        payload: version
    }
}
