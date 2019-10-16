import React from "react";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { BookService } from "../../service/service.book";
import { ToastContainer } from "react-toastify";
import { IToken } from "../../model/model.token";
import { IUser } from "../../model/model.user";
// import { action_user_logged_in } from "../../redux/action/user";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
// import { ICartItems, ICartItem } from "../../redux/action/cart/cartAction";
// import { action_add_to_cart, action_remove_from_cart } from "../../redux/action/cart";
// import { ILibrary_schema } from "../../redux/action/library/libraryAction";

interface IProps {
    internationalization: TInternationalization;
    // match: any;
    token: IToken;
    logged_in_user: IUser | null;
    // onUserLoggedIn?: (user: IUser) => void;
    network_status: NETWORK_STATUS;
    // cart: ICartItems;
    // add_to_cart: (cartItem: ICartItem) => any;
    // remove_from_cart: (cartItem: ICartItem) => any;
    // library: ILibrary_schema;
}
interface IState {

}

class BookFileDownloadComponent extends BaseComponent<IProps, IState> {
    state = {

    };
    private _bookService = new BookService();
    constructor(props: IProps) {
        super(props);
        this._bookService.setToken(this.props.token);
    }

    componentDidMount() {
        debugger;
    }

    componentWillUnmount() {
        debugger;
    }

    componentWillReceiveProps(nextProps: IProps) {
        debugger;
    }

    render() {
        return (
            <>
                {/* <div className="book-file-download-wrapper mt-3">

                </div> */}
                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        );
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        // onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
        // add_to_cart: (cartItem: ICartItem) => dispatch(action_add_to_cart(cartItem)),
        // remove_from_cart: (cartItem: ICartItem) => dispatch(action_remove_from_cart(cartItem)),
    };
};

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        token: state.token,
        logged_in_user: state.logged_in_user,
        network_status: state.network_status,
        // cart: state.cart,
        // library: state.library,
    };
};

export const BookFileDownload = connect(
    state2props,
    dispatch2props
)(BookFileDownloadComponent);
