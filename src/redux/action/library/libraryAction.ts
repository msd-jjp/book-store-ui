import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
// import { LIBRARY_VIEW } from "../../../component/library/Library";
import { ILibrary } from "../../../model/model.library";
import { LIBRARY_VIEW } from "../../../enum/Library";

export interface ILibrary_schema {
    view: LIBRARY_VIEW;
    data: ILibrary[];
    data_version: string | undefined;
}

export interface ILibraryAction extends Action<EACTIONS> {
    payload: ILibrary_schema | ILibrary[] | LIBRARY_VIEW | string | null;
}
