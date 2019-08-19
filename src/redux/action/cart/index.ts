import { EACTIONS } from "../../ActionEnum";
import { ICartAction, ICartItem } from "./cartAction";

export function action_add_to_cart(cartItem: ICartItem): ICartAction {
    return {
        type: EACTIONS.ADD_TO_CART,
        payload: cartItem
    }
}

export function action_remove_from_cart(cartItem: ICartItem): ICartAction {
    return {
        type: EACTIONS.REMOVE_FROM_CART,
        payload: cartItem
    }
}

export function action_update_cart_item(cartItem: ICartItem): ICartAction {
    return {
        type: EACTIONS.UPDATE_CART_ITEM,
        payload: cartItem
    }
}