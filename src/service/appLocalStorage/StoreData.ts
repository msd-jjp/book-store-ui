import { appLocalStorage, TCollectionName, TCollectionData, IBook_file_store, IOrderItemStore } from ".";
import { Collection } from "lokijs";
import { IOrderItem } from "../../model/model.order";

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

    static storeData_userInvoicedOrderItem(data: IOrderItem[]) {
        let coll: Collection<IOrderItemStore> = appLocalStorage.clc_userInvoicedOrderItem;
        if (!data || !data.length) return;

        const order_id = data[0].order.id;
        const newData: IOrderItemStore = { id: order_id, items: data };

        let found = coll.findOne({ id: order_id });
        if (found) {
            coll.findAndUpdate({ id: order_id }, oldObj => {
                return newData;
            });
        } else {
            coll.insert(newData);
        }
    }
}
