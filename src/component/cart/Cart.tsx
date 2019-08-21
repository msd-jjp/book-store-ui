import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { IUser } from "../../model/model.user";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../model/model.token";
import { ToastContainer } from "react-toastify";
import { ICartItems, ICartItem } from "../../redux/action/cart/cartAction";
import { action_add_to_cart, action_remove_from_cart, action_update_cart_item } from "../../redux/action/cart";
import { Localization } from "../../config/localization/localization";
import { BOOK_TYPES } from "../../enum/Book";
import { IBook } from "../../model/model.book";
// import { IBook } from "../../model/model.book";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
  cart: ICartItems;
  add_to_cart: (cartItem: ICartItem) => any;
  remove_from_cart: (cartItem: ICartItem) => any;
  update_cart_item: (cartItem: ICartItem) => any;
}

interface IState {

}

class CartComponent extends BaseComponent<IProps, IState> {
  state = {
    totalPrice: this.getCartPrice()
  };

  componentWillReceiveProps(nextProps: IProps) {
    debugger;
    this.setState({ ...this.state, totalPrice: this.getCartPrice(nextProps.cart) });
  }

  getCartPrice(cart: ICartItems = this.props.cart): number {
    let price = 0;

    cart.forEach(cartItem => {
      price += (cartItem.book.price || 96500) * cartItem.count; // || 0
    });

    return price;
  }

  removeFromCart(cartItem: ICartItem) {
    this.props.remove_from_cart(cartItem);
  }

  updateCartItem_up(cartItem: ICartItem) {
    if (!this.is_countable_book(cartItem.book)) {
      return;
    }
    let ci = { ...cartItem };
    ci.count++;
    this.props.update_cart_item(ci);
  }

  updateCartItem_down(cartItem: ICartItem) {
    if (!this.is_countable_book(cartItem.book)) {
      return;
    }
    let ci = { ...cartItem };
    if (ci.count === 1) return;

    ci.count--;
    this.props.update_cart_item(ci);
  }

  is_countable_book(book: IBook): boolean {
    if (book.type === BOOK_TYPES.Hard_Copy) {
      return true;
    }
    return false;
  }

  fetchPrice() {

  }

  gotoBookDetail(bookId: string) {
    this.props.history.push(`/book-detail/${bookId}`);
  }

  render() {
    return (
      <>
        <div className="cart-wrapper mt-3">
          <div className="row">
            <div className="col-12">
              {
                (this.props.cart && this.props.cart.length)
                  ?

                  <ul className="cart-list list-group list-group-flush">
                    {this.props.cart.map((cartItem: ICartItem, index: number) => {

                      const book = cartItem.book;
                      const book_image = (book.images && book.images.length && this.getImageUrl(book.images[0])) ||
                        this.defaultBookImagePath;

                      book.price = book.price || 96500; // todo _DELETE_ME

                      const book_type: any = book.type;
                      const book_type_str: BOOK_TYPES = book_type;

                      return (<Fragment key={index}>

                        <li className="cart-item-wrapper list-group-item">
                          <button className="remove-btn btn btn-light btn-sm mr-3" onClick={() => this.removeFromCart(cartItem)}>
                            <i className="fa fa-times"></i>
                          </button>

                          <div className="item-img-wrapper mr-3" onClick={() => this.gotoBookDetail(book.id)}>
                            <img src={book_image} alt="" className="item-img img-thumbnail rounded" />
                          </div>

                          <div className="item-title mr-3">
                            {book.title}
                          </div>

                          <div className="item-type mr-3">
                            {Localization.book_type_list[book_type_str]}
                          </div>

                          <div className="item-count-wrapper text-center mr-3">
                            {
                              this.is_countable_book(cartItem.book) ?
                                <div className="btn btn-light btn-sm cursor-pointer"
                                  onClick={() => this.updateCartItem_up(cartItem)}>
                                  <i className="fa fa-angle-up"></i>
                                </div>
                                : ''
                            }

                            {
                              this.is_countable_book(cartItem.book) ?
                                <div className="item-count rounded">{cartItem.count}</div>
                                :
                                <div className="item-count rounded disable">{cartItem.count}</div>
                            }
                            {
                              this.is_countable_book(cartItem.book) ?
                                <div className={
                                  "btn btn-light btn-sm cursor-pointer " +
                                  (cartItem.count < 2 ? 'disabled' : '')
                                }
                                  onClick={() => this.updateCartItem_down(cartItem)}>
                                  <i className="fa fa-angle-down"></i>
                                </div>
                                : ''
                            }
                          </div>

                          <div className="item-price">
                            {
                              book.price
                                ?
                                book.price * cartItem.count
                                : ''
                            }
                          </div>
                        </li>

                      </Fragment>)
                    })}
                  </ul>
                  :
                  <h3 className="text-center">{Localization.your_shopping_cart_is_empty}!</h3>
              }
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              discount code:
            </div>
            <div className="col-12 mt-3">
              <h4>total price: {this.state.totalPrice.toLocaleString()}</h4>
            </div>
            <div className="col-12 mt-3">
              <div className="btn btn-info">check price</div>
            </div>
            <div className="col-12 mt-3">
              <div className="btn btn-info">buy</div>
            </div>
          </div>
        </div>

        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    add_to_cart: (cartItem: ICartItem) => dispatch(action_add_to_cart(cartItem)),
    remove_from_cart: (cartItem: ICartItem) => dispatch(action_remove_from_cart(cartItem)),
    update_cart_item: (cartItem: ICartItem) => dispatch(action_update_cart_item(cartItem)),
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    token: state.token,
    cart: state.cart
  };
};

export const Cart = connect(state2props, dispatch2props)(CartComponent);
