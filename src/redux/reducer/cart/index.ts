import { EACTIONS } from "../../ActionEnum";
import { ICartItem, ICartAction, ICartItems } from "../../action/cart/cartAction";

export function reducer(state: ICartItems, action: ICartAction): ICartItems {
    switch (action.type) {
        case EACTIONS.ADD_TO_CART:
            if (!isCartItemExist(state, action.payload!)) {
                return [...state, action.payload!];
            } else {
                return state;
            }
        case EACTIONS.REMOVE_FROM_CART:
            return removeFromCart([...state], action.payload!);
        case EACTIONS.UPDATE_CART_ITEM:
            return updateCartItem([...state], action.payload!);
        case EACTIONS.CLEAR_CART:
            return [];
    }
    if (state) { return state; }
    return [];
}

const isCartItemExist = (state: ICartItems, cartItem: ICartItem): boolean => {
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

const removeFromCart = (state: ICartItems, cartItem: ICartItem): ICartItems => {
    let book_id = cartItem.book.id;

    for (let i = 0; i < state.length; i++) {
        if (book_id === state[i].book.id) {
            state.splice(i, 1);
            break;
        }
    }
    return state;
}

const updateCartItem = (state: ICartItems, cartItem: ICartItem): ICartItems => {
    if (cartItem.count < 1) return state;

    let book_id = cartItem.book.id;

    for (let i = 0; i < state.length; i++) {
        if (book_id === state[i].book.id) {
            state[i] = cartItem;
            break;
        }
    }
    return state;
}