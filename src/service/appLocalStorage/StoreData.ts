import { appLocalStorage, TCollectionName, TCollectionData, IOrderItemStore, IEtag, ICreationDate } from ".";
import { Collection } from "lokijs";
import { IOrderItem } from "../../model/model.order";

export class StoreData {
    static addDataToCollection(collectionName: TCollectionName, data: TCollectionData[] | TCollectionData) {
        let coll: Collection<any> = appLocalStorage[collectionName];

        //todo: only update found one : here we search twice if found.
        if (Array.isArray(data)) {
            data.forEach(obj => {
                let found = coll.findOne({ id: obj.id });
                if (found) {
                    /* coll.findAndUpdate({ id: obj.id }, oldObj => {
                        return obj;
                    }); */
                    StoreData.updateData_byId(collectionName, obj.id, obj);
                } else {
                    coll.insert(obj);
                }
            })
        } else {
            let found = coll.findOne({ id: data.id });
            if (found) {
                // coll.findAndUpdate({ id: data.id }, oldObj => {
                //     /* const newData = { ...data, $loki: undefined, meta: undefined };
                //     newData['$loki'] = oldObj['$loki'];
                //     newData['meta'] = oldObj['meta'];
                //     // oldObj = data;
                //     // return data;
                //     return newData; */
                //     return data;
                // });
                StoreData.updateData_byId(collectionName, data.id, data);
                // appLocalStorage.app_db.
            } else {
                coll.insert(data);
            }
        }

        appLocalStorage.manualSaveDB();
    }

    static storeData_userInvoicedOrderItem(data: IOrderItem[]) {
        let coll: Collection<IOrderItemStore> = appLocalStorage.clc_userInvoicedOrderItem;
        if (!data || !data.length) return;

        const order_id = data[0].order.id;
        const newData: IOrderItemStore = { id: order_id, items: data };

        let found = coll.findOne({ id: order_id });
        if (found) {
            /* coll.findAndUpdate({ id: order_id }, oldObj => {
                return newData;
            }); */
            StoreData.updateData_byId('clc_userInvoicedOrderItem', order_id, newData);
        } else {
            coll.insert(newData);
        }

        appLocalStorage.manualSaveDB();
    }

    private static updateData_byId(collectionName: TCollectionName, id: string, newData: any) {
        let coll: Collection<any> = appLocalStorage[collectionName];
        /* coll.chain().find({ id: id })
            // .update(newData);
            .update(function (obj) {
                // obj = newData;
                return newData;
            }); */
        // coll.update({});
        const oldData = coll.findOne({ id });
        if (!oldData) return;
        const newDataLoki = { ...newData, $loki: undefined, meta: undefined };
        newDataLoki['$loki'] = oldData['$loki'];
        newDataLoki['meta'] = oldData['meta'];
        coll.update(newDataLoki);
    }

    // todo: use general store
    static store_eTag(data: IEtag) {
        let coll: Collection<any> = appLocalStorage.clc_eTag;

        let found = coll.findOne({ id: data.id });
        if (found) {
            StoreData.updateData_byId('clc_eTag', data.id, data);
        } else {
            coll.insert(data);
        }

        appLocalStorage.manualSaveDB();
    }

    // todo: use general store
    static store_creationDate(data: ICreationDate) {
        let coll: Collection<any> = appLocalStorage.clc_creationDate;

        let found = coll.findOne({ id: data.id });
        if (found) {
            StoreData.updateData_byId('clc_creationDate', data.id, data);
        } else {
            coll.insert(data);
        }

        appLocalStorage.manualSaveDB();
    }

}
