import { Action } from "redux";
import { EACTIONS } from "../../ActionEnum";
import {  COLLECTION_VIEW } from "../../../enum/Library";
import { ICollection } from "../../../model/model.collection";

export interface ICollection_schema {
    view: COLLECTION_VIEW;
    data: ICollection[];
}

export interface ICollectionAction extends Action<EACTIONS> {
    payload: ICollection[] | COLLECTION_VIEW | null;
}
