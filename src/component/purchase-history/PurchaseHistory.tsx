import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { IUser } from "../../model/model.user";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../model/model.token";
import { ToastContainer, toast } from "react-toastify";
import { Localization } from "../../config/localization/localization";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { action_user_logged_in } from "../../redux/action/user";
import { OrderService } from "../../service/service.order";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { IOrder } from "../../model/model.order";
import moment from 'moment';
import moment_jalaali from 'moment-jalaali';

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
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
  };

  private _orderService = new OrderService();

  constructor(props: IProps) {
    super(props);

    this._orderService.setToken(this.props.token);
  }

  componentDidMount() {
    this.gotoTop();
    this.fetchUserOrders();
  }

  private async fetchUserOrders() {
    this.setState({ ...this.state, orderError: undefined, loadMoreBtnLoader: true });

    let res = await this._orderService.search(
      this.state.pager_limit,
      this.state.pager_offset,
      {
      }
    ).catch(error => {

      let errorMsg = this.handleError({ error: error.response });
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

  order_list_render() {
    return (
      <>
        <div className="order-list-wrapper mt-3__">
          {(this.state.orderList || []).map((book: IOrder, orderIndex) => (
            <Fragment key={orderIndex}>
              {this.item_render(book)}
            </Fragment>
          ))}
        </div>
      </>
    )
  }

  item_render(order: IOrder) {
    return (
      <>
        <div className="item-wrapper mb-3">
          <div>
            {Localization.purchase_date}:
            <span>{order.modification_date ? this.getTimestampToDate(order.modification_date) : ''}</span>
            ,
            <span>{order.modification_date ? this.getFromNowDate(order.modification_date) : ''}</span>
          </div>

          <div>
            {Localization.total_price}:
            {order.total_price ? order.total_price.toLocaleString() : ''}
          </div>
        </div>
      </>
    )
  }

  getTimestampToDate(timestamp: number) {
    if (this.props.internationalization.flag === "fa") {
      return moment_jalaali(timestamp * 1000).locale("en").format('jYYYY/jM/jD');
    } else {
      return moment(timestamp * 1000).format('YYYY/MM/DD');
    }
  }

  newReleaseOrder_render() {
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
          <div onClick={() => this.fetchUserOrders()}>{Localization.retry}</div>
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

  loadMoreOrder_render() {
    if (
      this.state.newOrderList && (this.state.newOrderList! || []).length
      &&
      !(this.state.pager_limit > (this.state.newOrderList! || []).length)
    ) {
      return (
        <>
          <BtnLoader
            btnClassName="btn btn-light btn-block text-capitalize mt-4"
            loading={this.state.loadMoreBtnLoader}
            onClick={() => this.loadMoreOrder()}
          // disabled={!this.state.isFormValid}
          >
            {Localization.load_more}
          </BtnLoader>
        </>
      );
    }
  }
  loadMoreOrder() {
    this.setState(
      { ...this.state, pager_offset: this.state.pager_offset + this.state.pager_limit },
      this.fetchUserOrders
    );
  }

  render() {
    return (
      <>
        <div className="purchase-history-wrapper mt-3 mb-5">
          {/* <div className="row">
            <div className="col-12">

            </div>
          </div> */}
          {this.newReleaseOrder_render()}
          {this.loadMoreOrder_render()}
        </div>

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
    token: state.token,
    network_status: state.network_status,
  };
};

export const PurchaseHistory = connect(state2props, dispatch2props)(PurchaseHistoryComponent);
