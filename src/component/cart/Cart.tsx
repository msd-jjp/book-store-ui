import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { IUser } from "../../model/model.user";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import { History } from "history";
// import { IToken } from "../../model/model.token";
import { ToastContainer } from "react-toastify";
import { ICartItems, ICartItem } from "../../redux/action/cart/cartAction";
import { action_add_to_cart, action_remove_from_cart, action_update_cart_item, action_clear_cart } from "../../redux/action/cart";
import { Localization } from "../../config/localization/localization";
import { BOOK_TYPES } from "../../enum/Book";
import { IBook } from "../../model/model.book";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { OrderService } from "../../service/service.order";
import { Store2 } from "../../redux/store";
import { PriceService } from "../../service/service.price";
import { CmpUtility } from "../_base/CmpUtility";
import { Utility } from "../../asset/script/utility";
import { AccountService } from "../../service/service.account";
import { IncreaseCredit } from "../increase-credit/IncreaseCredit";
import { PaymentResult } from "../increase-credit/payment-result/PaymentResult";
import { action_set_library_data } from "../../redux/action/library";
import { LibraryService } from "../../service/service.library";
// import { IBook } from "../../model/model.book";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  cart: ICartItems;
  add_to_cart: (cartItem: ICartItem) => any;
  remove_from_cart: (cartItem: ICartItem) => any;
  update_cart_item: (cartItem: ICartItem) => any;
  clear_cart: () => any;
  network_status: NETWORK_STATUS;
  match: any;
}

interface IState {
  buy_loader: boolean;
  fetchPrice_loader: boolean;
  totalPrice: number | string;
  mainAccountValue: number;
  mainAccount_loader: boolean;
  modal_increaseCredit_show: boolean;
  modal_increaseCredit_defaultValue: number | undefined;
  modal_paymentResult_show: boolean;
}

class CartComponent extends BaseComponent<IProps, IState> {
  state = {
    totalPrice: 0,
    buy_loader: false,
    fetchPrice_loader: false,
    mainAccountValue: 0,
    mainAccount_loader: false,
    modal_increaseCredit_show: false,
    modal_increaseCredit_defaultValue: undefined,
    modal_paymentResult_show: this.is_paymentResult_visible(),
  };

  private _orderService = new OrderService();
  private _priceService = new PriceService();
  private _accountService = new AccountService();
  private _libraryService = new LibraryService();

  componentWillMount() {
    this.removeParam_paymentStatus();
  }
  private removeParam_paymentStatus() {
    if (this.props.match.params && this.props.match.params.paymentStatus) {
      this.props.history.replace(`/cart`);
    }
  }
  componentDidMount() {
    this.fetchPrice(false);
    this.getUserMainAccount(false, false);
  }

  private async getUserMainAccount(toastError: boolean = true, loader: boolean = true) {
    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

    loader && this.setState({ mainAccount_loader: true });
    let res = await this._accountService.getUserMainAccount().catch(error => {
      this.handleError({
        error: error.response,
        notify: toastError,
        toastOptions: { toastId: 'getUserMainAccount_error' }
      });
      this.setState({ mainAccount_loader: false });
    });
    if (res) {
      let mainAccountValue = res.data.result[0].value;
      this.setState({ mainAccountValue: mainAccountValue, mainAccount_loader: false });
    }
  }

  private openModal_increaseCredit(modal_defaultValue: number | undefined) {
    this.setState({ modal_increaseCredit_show: true, modal_increaseCredit_defaultValue: modal_defaultValue });
  }
  private closeModal_increaseCredit() {
    this.setState({ modal_increaseCredit_show: false });
  }

  private get_increaseCredit_defaultValue(): number | undefined {
    if (typeof this.state.totalPrice === 'number') {
      if (this.state.mainAccountValue < this.state.totalPrice) {
        return this.state.totalPrice - this.state.mainAccountValue;
      }
    }
  }

  private is_buyable_cart(): boolean {
    if (typeof this.state.totalPrice === 'number') {
      if (this.state.mainAccountValue < this.state.totalPrice) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  private is_paymentResult_visible(): boolean {
    if (this.props.match.params && this.props.match.params.paymentStatus) {
      return true;
    }
    return false;
  }
  private closeModal_paymentResult() {
    this.setState({ modal_paymentResult_show: false });
  }
  private _modal_paymentResult_status: string | undefined;
  private getModal_paymentResult_status(): string | undefined {
    if (!this._modal_paymentResult_status) {
      if (this.props.match.params && this.props.match.params.paymentStatus) {
        this._modal_paymentResult_status = this.props.match.params.paymentStatus;
      }
    }
    return this._modal_paymentResult_status;
  }

  private getCartItem(): ICartItems {
    return Store2.getState().cart;
  }

  private setCartPrice(toastError?: boolean) {
    // this.setState({ ...this.state, totalPrice: this.getCartPrice() });
    this.fetchPrice(toastError);
  }

  private async fetchPrice(toastError: boolean = true) {
    if (!this.props.logged_in_user) return;
    if (!this.props.cart || !this.props.cart.length) return;

    this.setState({ ...this.state, fetchPrice_loader: true });

    // let order_items = this.props.cart.map(ci => {
    let order_items = this.getCartItem().map(ci => {
      return {
        book_id: ci.book.id,
        count: ci.count
      }
    });

    let res_fetchPrice = await this._priceService.calcPrice(
      order_items,
      this.props.logged_in_user!.person.id
    ).catch(error => {
      let msgObj = this.handleError({
        error: error.response,
        notify: toastError,
        toastOptions: { toastId: 'fetchPrice_error' }
      });
      this.setState({ ...this.state, fetchPrice_loader: false, totalPrice: msgObj.body });
    });

    // this.setState({ ...this.state, fetchPrice_loader: false });

    if (res_fetchPrice) {
      this.setState({ ...this.state, totalPrice: res_fetchPrice.data.total_price, fetchPrice_loader: false });
    }
  }

  private removeFromCart(cartItem: ICartItem) {
    this.props.remove_from_cart(cartItem);
    this.setCartPrice(false);
  }

  private updateCartItem_up(cartItem: ICartItem) {
    if (!this.is_countable_book(cartItem.book)) {
      return;
    }
    let ci = { ...cartItem };
    ci.count++;
    this.props.update_cart_item(ci);
    this.setCartPrice(false);
  }

  private updateCartItem_down(cartItem: ICartItem) {
    if (!this.is_countable_book(cartItem.book)) {
      return;
    }
    let ci = { ...cartItem };
    if (ci.count === 1) return;
    ci.count--;
    this.props.update_cart_item(ci);
    this.setCartPrice(false);
  }

  private is_countable_book(book: IBook): boolean {
    if (book.type === BOOK_TYPES.Hard_Copy || book.type === BOOK_TYPES.DVD) {
      return true;
    }
    return false;
  }

  private gotoBookDetail(bookId: string) {
    this.props.history.push(`/book-detail/${bookId}`);
  }

  private async buy() {
    if (!this.props.logged_in_user) return;
    if (!this.props.cart || !this.props.cart.length) return;


    if (typeof this.state.totalPrice === 'number') {
      if (this.state.mainAccountValue < this.state.totalPrice) {
        this.openModal_increaseCredit(this.get_increaseCredit_defaultValue());
        return false;
      } else {
        // return true;
      }
    } else {
      return false;
    }


    this.setState({ ...this.state, buy_loader: true });

    let order_items = this.props.cart.map(ci => {
      return {
        book_id: ci.book.id,
        count: ci.count
      }
    });

    // let person_id = this.props.logged_in_user!.person.id;

    let res_order = await this._orderService.userOrder(order_items).catch(error => {
      this.handleError({ error: error.response, toastOptions: { toastId: 'buy_error' } });
      this.setState({ ...this.state, buy_loader: false });
    });

    if (res_order) {
      let res_checkout = await this._orderService.userCheckout(res_order.data.id).catch(error => {
        this.handleError({ error: error.response, toastOptions: { toastId: 'buy_error' } });
        this.setState({ ...this.state, buy_loader: false });
      });

      if (res_checkout) {
        // this.apiSuccessNotify(Localization.msg.ui.your_purchase_completed);
        this.props.clear_cart();
        this.props.history.push('/dashboard');
        this.apiSuccessNotify(Localization.msg.ui.your_purchase_completed);
        this.updateLibrary();
      }
    }
  }

  private async updateLibrary() {
    const res = await this._libraryService.getAll().catch(error => { });
    if (res) Store2.dispatch(action_set_library_data(res.data.result));
  }

  totalPrice_render() {
    if (typeof this.state.totalPrice === 'string') {
      return <small className="text-danger">{this.state.totalPrice}</small>
    } else {
      return (this.state.totalPrice || '').toLocaleString();
    }
  }

  itemPrice_render(price: number, count: number) {
    if ((!price && price !== 0) || (!count && count !== 0)) return '';
    const total = price * count;
    return (total || '').toLocaleString();
  }

  render() {
    return (
      <>
        <div className="cart-wrapper mt-3 mb-5">
          <div className="row">
            <div className="col-12">
              {
                (this.props.cart && this.props.cart.length)
                  ?

                  <ul className="cart-list list-group list-group-flush pr-0">
                    {this.props.cart.map((cartItem: ICartItem, index: number) => {

                      const book = { ...cartItem.book };
                      const book_image = (book.images && book.images.length && this.getImageUrl(book.images[0])) ||
                        this.defaultBookImagePath;

                      book.price = book.price || 0;

                      // const book_type: any = book.type;
                      // const book_type_str: BOOK_TYPES = book_type;

                      return (<Fragment key={index}>

                        <li className="cart-item-wrapper list-group-item">
                          <button className="remove-btn btn btn-light btn-sm mr-3" onClick={() => this.removeFromCart(cartItem)}>
                            <i className="fa fa-times"></i>
                          </button>

                          <div className="item-img-wrapper mr-3 cursor-pointer" onClick={() => this.gotoBookDetail(book.id)}>
                            {/* <img src={book_image}
                              alt="book"
                              className="item-img img-thumbnail rounded center-el-in-box"
                              onError={e => this.bookImageOnError(e)}
                            /> */}

                            <div className="img-scaffolding-container">
                              <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />

                              <img src={book_image}
                                alt="book"
                                className="main-img center-el-in-box"
                                onError={e => CmpUtility.bookImageOnError(e)}
                                loading="lazy"
                              />
                            </div>
                          </div>

                          <div className="item-title mr-3">
                            {book.title}
                          </div>

                          <div className="item-type mr-3">
                            {/* {Localization.book_type_list[book_type_str]} */}
                            <img src={CmpUtility.getBookTypeIconUrl(book.type as BOOK_TYPES)}
                              className="max-w-100"
                              loading="lazy"
                              title={Localization.book_type_list[book.type as BOOK_TYPES]}
                              alt={Localization.book_type_list[book.type as BOOK_TYPES]}
                            />
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
                              this.itemPrice_render(book.price, cartItem.count)
                              // book.price
                              //   ?
                              //   book.price * cartItem.count
                              //   : ''
                            }
                          </div>
                        </li>

                      </Fragment>)
                    })}
                  </ul>
                  :
                  <>
                    <div className="text-center">
                      <h3>{Localization.your_shopping_cart_is_empty}!</h3>
                      <img src="/static/media/img/icon/empty-shopping-cart.svg"
                        className="w-200px"
                        loading="lazy"
                        alt="empty shopping cart" />
                    </div>
                  </>
              }
            </div>
          </div>

          {
            (this.props.cart && this.props.cart.length)
              ?
              <div className="row mt-5">
                <div className="col-12 mt-3">
                  {/* {this.state.totalPrice.toLocaleString()} */}
                  <h4 className="d-inline-block text-muted">{Localization.total_price}: </h4>
                  <BtnLoader
                    btnClassName="btn btn-link-- py-0"
                    loading={this.state.fetchPrice_loader}
                    onClick={() => this.fetchPrice()}
                  // disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                  >
                    <h4 className="mb-0 text-info">
                      {this.totalPrice_render()}
                      <small className="ml-3">({Localization.recalculate} <i className="fa fa-refresh ml-1"></i>)</small>
                    </h4>
                  </BtnLoader>
                </div>

                <div className="col-12 mt-3">
                  <div className="d-flex justify-content-between w-100">
                    <div>
                      <span className="text text-capitalize">{Localization.account_balance}:</span>
                      <span className="ml-2">{Utility.prettifyNumber(this.state.mainAccountValue)}</span>

                      <BtnLoader
                        btnClassName="btn btn-sm py-0"
                        loading={this.state.mainAccount_loader}
                        onClick={() => this.getUserMainAccount()}
                        disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                      >
                        <small>({Localization.recalculate}
                          <i className="fa fa-refresh ml-1"></i>
                          {this.props.network_status === NETWORK_STATUS.OFFLINE
                            ? <i className="fa fa-wifi text-danger"></i> : ''})</small>
                      </BtnLoader>
                    </div>
                    <div>
                      <span className="badge badge-pill badge-success cursor-pointer"
                        onClick={() => this.openModal_increaseCredit(undefined)}
                      >
                        <i className="fa fa-plus-circle mr-1"></i>
                        {Localization.increase_credit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <BtnLoader
                    btnClassName="btn btn-system btn-block btn-lg"
                    loading={this.state.buy_loader}
                    onClick={() => this.buy()}
                    disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                  >
                    <h4 className="mb-0 d-inline">
                      {Localization.buy}&nbsp;
                      <i className={"fa fa-money " + (!this.is_buyable_cart() ? 'text-danger' : '')}></i>
                    </h4>
                    {
                      this.props.network_status === NETWORK_STATUS.OFFLINE
                        ? <i className="fa fa-wifi text-danger"></i> : ''
                    }
                  </BtnLoader>
                </div>
              </div>
              : ''
          }
        </div>

        <IncreaseCredit
          existing_credit={this.state.mainAccountValue}
          show={this.state.modal_increaseCredit_show}
          onHide={() => this.closeModal_increaseCredit()}
          // match={this.props.match}
          defaultValue={this.state.modal_increaseCredit_defaultValue}
        />

        <PaymentResult
          existing_credit={this.state.mainAccountValue}
          show={this.state.modal_paymentResult_show}
          onHide={() => this.closeModal_paymentResult()}
          status={this.getModal_paymentResult_status()}
        />

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
    clear_cart: () => dispatch(action_clear_cart()),
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    // token: state.token,
    cart: state.cart,
    network_status: state.network_status,
  };
};

export const Cart = connect(state2props, dispatch2props)(CartComponent);
