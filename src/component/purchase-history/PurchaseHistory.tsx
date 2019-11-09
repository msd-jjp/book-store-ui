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
import { Localization } from "../../config/localization/localization";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { action_user_logged_in } from "../../redux/action/user";
import { OrderService } from "../../service/service.order";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { IOrder, IOrderItem } from "../../model/model.order";
import { Modal } from "react-bootstrap";
import { BOOK_TYPES } from "../../enum/Book";
import { CmpUtility } from "../_base/CmpUtility";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  // token: IToken;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
}

interface IState {
  fetchOrder_loader: boolean;

  orderList: IOrder[] | undefined;
  newOrderList: IOrder[] | undefined;
  orderError: string | undefined;
  pager_offset: number;
  pager_limit: number;
  loadMoreBtnLoader: boolean;

  modal_orderItems: {
    show: boolean;
    orderItems: IOrderItem[] | undefined;
    order: IOrder | undefined;
    loading: boolean;
    errorText: string | undefined;
  };
}

class PurchaseHistoryComponent extends BaseComponent<IProps, IState> {
  state = {
    fetchOrder_loader: false,

    orderList: undefined,
    newOrderList: undefined,
    orderError: undefined,
    pager_offset: 0,
    pager_limit: 10,
    loadMoreBtnLoader: false,

    modal_orderItems: {
      show: false,
      orderItems: undefined,
      order: undefined,
      loading: false,
      errorText: undefined
    }
  };

  private _orderService = new OrderService();

  // constructor(props: IProps) {
  //   super(props);

  //   this._orderService.setToken(this.props.token);
  // }

  componentDidMount() {
    this.gotoTop();
    this.fetchUserOrders();
  }

  private async fetchUserOrders() {
    this.setState({ ...this.state, orderError: undefined, loadMoreBtnLoader: true });

    let res = await this._orderService.search_userOrder(
      this.state.pager_limit,
      this.state.pager_offset,
      {
        // person_id: this.props.logged_in_user!.person.id,
        status: 'Invoiced'
      }
    ).catch(error => {

      let errorMsg = this.handleError({ error: error.response, toastOptions: { toastId: 'fetchUserOrders_error' } });
      this.setState({ ...this.state, orderError: errorMsg.body, loadMoreBtnLoader: false });
    });
    // debugger;
    if (res) {
      if (res.data.result) {
        this.setState({
          ...this.state,
          newOrderList: res.data.result,
          orderList: [...this.state.orderList || [], ...res.data.result],
          loadMoreBtnLoader: false
        });
      }
    }
  }

  private async fetchOrderItems(order: IOrder) {
    this.setState({
      ...this.state, modal_orderItems: {
        show: true,
        orderItems: undefined,
        order,
        loading: true,
        errorText: undefined
      }
    });
    let res = await this._orderService.getOrderItems(order.id).catch(error => {
      let errorMsg = this.handleError(
        { error: error.response, toastOptions: { toastId: 'fetchOrderItems_error' }, notify: false }
      );
      this.setState({
        ...this.state,
        modal_orderItems: {
          ...this.state.modal_orderItems,
          loading: false,
          orderItems: undefined,
          errorText: errorMsg.body
        }
      });
    });
    // debugger;
    if (res) {
      if (res.data.result) {
        this.setState({
          ...this.state,
          modal_orderItems: {
            ...this.state.modal_orderItems,
            loading: false,
            orderItems: res.data.result,
            errorText: undefined
          }
        });
      }
    }
  }

  private order_list_render() {
    return (
      <>
        <div className="order-list-wrapper mt-3__ table-responsive">
          <table className="table text-center table-striped table-borderless table-hover">
            <thead className="thead-dark-- bg-system text-white">
              <tr>
                <th>#</th>
                <th>{Localization.purchase_date}</th>
                <th>{Localization.total_price}</th>
                <th>{Localization.detail}</th>
              </tr>
            </thead>
            <tbody>
              {(this.state.orderList || []).map((order: IOrder, orderIndex) => (
                <Fragment key={orderIndex}>
                  <tr>
                    <td>{orderIndex + 1}</td>
                    <td>
                      {this.getOrderDate(order) ? this.timestamp_to_date(this.getOrderDate(order)!) : ''}
                      <div className="d-sm-none"></div>
                      {
                        this.getOrderDate(order) ?
                          <small>&nbsp;({this.getOrderDate(order) ? this.getFromNowDate(this.getOrderDate(order)!) : ''})</small>
                          : ''
                      }
                    </td>
                    <td>{order.total_price ? order.total_price.toLocaleString() : ''}</td>
                    <td className="cursor-pointer" onClick={() => this.openModal_orderItems(order)}>
                      <i className="fa fa-info-circle"></i>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  getOrderDate(order: IOrder): number | undefined {
    // return order.creation_date;
    return order.modification_date;
  }

  private gotoBookDetail(bookId: string) {
    this.props.history.push(`/book-detail/${bookId}`);
  }

  //#region modal_orderItems
  private openModal_orderItems(order: IOrder) {
    // this.setState({
    //   ...this.state, modal_orderItems: {
    //     show: true,
    //     orderItems: undefined,
    //     order,
    //     loading: true,
    //     errorText: undefined
    //   }
    // });
    this.fetchOrderItems(order);
  }

  private closeModal_orderItems() {
    this.setState({
      ...this.state, modal_orderItems: {
        show: false,
        orderItems: undefined,
        order: undefined,
        loading: false,
        errorText: undefined
      }
    });
  }

  private modal_orderItems_render() {
    const modalOrder: IOrder | undefined = this.state.modal_orderItems.order;
    return (
      <>
        <Modal show={this.state.modal_orderItems.show} onHide={() => this.closeModal_orderItems()} centered>
          {
            modalOrder ?
              <Modal.Header closeButton className="border-bottom-0 pb-0">
                <div className="modal-title h6 text-muted">
                  {Localization.purchase_date}:
                  &nbsp;
                  {this.getOrderDate(modalOrder!) ? this.timestamp_to_date(this.getOrderDate(modalOrder!)!) : ''}
                  {/* <div className="d-sm-none"></div> */}
                  {
                    this.getOrderDate(modalOrder!) ?
                      <small>&nbsp;({this.getOrderDate(modalOrder!) ? this.getFromNowDate(this.getOrderDate(modalOrder!)!) : ''})</small>
                      : ''
                  }
                  <div className="clearfix"></div>
                  {Localization.total_price}:&nbsp;{modalOrder!.total_price ? modalOrder!.total_price.toLocaleString() : ''}
                </div>
              </Modal.Header> : ''
          }
          <Modal.Body>
            <div className="order-list-wrapper table-responsive">
              <table className="table text-center table-striped table-borderless table-hover table-sm mb-0">
                <caption className={
                  'px-2 text-center ' +
                  ((this.state.modal_orderItems.loading || this.state.modal_orderItems.errorText) ?
                    '' : 'd-none')
                }>{
                    this.state.modal_orderItems.loading ? Localization.loading_with_dots :
                      this.state.modal_orderItems.errorText ?
                        <>
                          <div className="text-danger">{this.state.modal_orderItems.errorText}</div>
                          <button className="btn btn-light" onClick={() => this.fetchOrderItems(this.state.modal_orderItems.order! as IOrder)}>
                            {Localization.retry}&nbsp;
                          <i className="fa fa-refresh"></i>
                          </button>
                        </> : ''
                  }</caption>
                <thead className="thead-dark-- bg-info text-white">
                  <tr>
                    <th>#</th>
                    <th className="min-w-100px max-w-250px white-space-nowrap">{Localization.title}</th>
                    <th className="white-space-nowrap">{Localization.type}</th>
                    <th className="white-space-nowrap">{Localization.count}</th>
                    <th className="white-space-nowrap">{Localization.unit_price}</th>
                    <th className="white-space-nowrap">{Localization.total_price}</th>
                  </tr>
                </thead>
                <tbody>
                  {(this.state.modal_orderItems.orderItems! as Array<IOrderItem> || []).map((orderItem: IOrderItem, orderItemIndex) => (
                    <Fragment key={orderItemIndex}>
                      <tr>
                        <td>{orderItemIndex + 1}</td>
                        <td className="text-nowrap-ellipsis max-w-250px">
                          <span className="text-info cursor-pointer" onClick={() => this.gotoBookDetail(orderItem.book.id)}>
                            {orderItem.book.title}
                          </span>
                        </td>
                        {/* <td>{Localization.book_type_list[orderItem.book.type as BOOK_TYPES]}</td> */}
                        <td>
                          <img src={CmpUtility.getBookTypeIconUrl(orderItem.book.type as BOOK_TYPES)}
                            className="max-w-100"
                            loading="lazy"
                            title={Localization.book_type_list[orderItem.book.type as BOOK_TYPES]}
                            alt={Localization.book_type_list[orderItem.book.type as BOOK_TYPES]}
                          />
                        </td>
                        <td>{orderItem.count}</td>
                        <td>{orderItem.unit_price ? orderItem.unit_price.toLocaleString() : ''}</td>
                        <td>{orderItem.net_price ? orderItem.net_price.toLocaleString() : ''}</td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer className="pt-0 border-top-0">
            <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_orderItems()}>
              {Localization.close}
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }
  //#endregion

  private orderListWrapper_render() {
    if (this.state.orderList && (this.state.orderList! || []).length) {
      return (
        <>
          {this.order_list_render()}
        </>
      );
    } else if (this.state.orderList && !(this.state.orderList! || []).length) {
      return (
        <>
          <div className="text-center text-warning">{Localization.no_item_found}</div>
        </>
      );

    } else if (this.state.orderError) {
      return (
        <>
          <div>{this.state.orderError}</div>
          <button className="btn btn-light" onClick={() => this.fetchUserOrders()}>
            {Localization.retry}&nbsp;
            <i className="fa fa-refresh"></i>
          </button>
        </>
      );
    } else {
      return (
        <>
          <div>{Localization.loading_with_dots}</div>
        </>
      );
    }
  }

  private loadMoreOrder_render() {
    if (
      this.state.newOrderList && (this.state.newOrderList! || []).length
      &&
      !(this.state.pager_limit > (this.state.newOrderList! || []).length)
    ) {
      return (
        <>
          <BtnLoader
            btnClassName="btn btn-light btn-block text-capitalize mt-4--"
            loading={this.state.loadMoreBtnLoader}
            onClick={() => this.loadMoreOrder()}
          >
            {Localization.load_more}
          </BtnLoader>
        </>
      );
    }
  }
  private loadMoreOrder() {
    this.setState(
      { ...this.state, pager_offset: this.state.pager_offset + this.state.pager_limit },
      this.fetchUserOrders
    );
  }

  render() {
    return (
      <>
        <div className="purchase-history-wrapper mt-3 mb-5">
          {this.orderListWrapper_render()}
          {this.loadMoreOrder_render()}
        </div>

        {this.modal_orderItems_render()}
        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    // token: state.token,
    network_status: state.network_status,
  };
};

export const PurchaseHistory = connect(state2props, dispatch2props)(PurchaseHistoryComponent);
