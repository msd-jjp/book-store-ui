import { EACTIONS } from "../../ActionEnum";
import { IToken } from "../../../model/model.token";
import { ICartItem, ICartAction } from "../../action/cart/cartAction";

export function reducer(state: ICartItem[], action: ICartAction): ICartItem[] {
    switch (action.type) {
        case EACTIONS.ADD_TO_CART:
            if (!isCartItemExist(state, action.payload)) {
                return [...state, action.payload];
            } else {
                return state;
            }
        case EACTIONS.REMOVE_FROM_CART:
            return removeFromCart(state, action.payload);
    }
    if (state) { return state; }
    return [];
}

const isCartItemExist = (state: ICartItem[], cartItem: ICartItem): boolean => {
    let exist = false;
    let book_id = cartItem.book.id;

    for (let i = 0; i < state.length; i++) {
        if (book_id === state[i].book.id) {
            exist = true;
            break;
        }
    }
    return exist;
}

const removeFromCart = (state: ICartItem[], cartItem: ICartItem): ICartItem[] => {
    let book_id = cartItem.book.id;

    for (let i = 0; i < state.length; i++) {
        if (book_id === state[i].book.id) {
            state.splice(i, 1);
            break;
        }
    }
    return state;
}