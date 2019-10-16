import { appLocalStorage, TCollectionName, TCollectionData, IBook_file_store } from ".";
import { Collection } from "lokijs";

export class StoreData {
    static addDataToCollection(collectionName: TCollectionName, data: TCollectionData[] | TCollectionData | IBook_file_store) {
        let coll: Collection<any> = appLocalStorage[collectionName];

        //todo: only update found one : here we search twice if found.
        if (Array.isArray(data)) {
            data.forEach(obj => {
                let found = coll.findOne({ id: obj.id });
                if (found) {
                    coll.findAndUpdate({ id: obj.id }, oldObj => {
                        return obj;
                    });
                } else {
                    coll.insert(obj);
                }
            })
        } else {
            let found = coll.findOne({ id: data.id });
            if (found) {
                coll.findAndUpdate({ id: data.id }, oldObj => {
                    return data;
                });
            } else {
                coll.insert(data);
            }
        }
    }
}
