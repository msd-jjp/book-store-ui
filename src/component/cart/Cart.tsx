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

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
}

interface IState {

}

class CartComponent extends BaseComponent<IProps, IState> {
  state = {
  };
  list: any[] = [];

  constructor(props: IProps) {
    super(props);

    for (let i = 0; i < 10; i++) {
      this.list.push({
        title: 'book ' + i,
        price: 250 + i
      });
    }
  }

  removeFromCart(index: number) {
    this.list.splice(index, 1);
    this.setState({ ...this.state });
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
              <ul className="cart-list list-group list-group-flush">
                {this.list.map((item: any, index: number) => {
                  return (<Fragment key={index}>

                    <li className="cart-item-wrapper list-group-item list-group-item-action">
                      <button className="remove-btn btn btn-light btn-sm" onClick={() => this.removeFromCart(index)}>
                        <i className="fa fa-times"></i>
                      </button>

                      <div className="item-img-wrapper d-inline-block">
                        <img src="" alt="" className="item-img img-thumbnail rounded" />
                      </div>

                      <span>{item.title}</span>
                      &nbsp; - &nbsp;
                      <span>{item.price}</span>
                      &nbsp; - &nbsp;
                      <span className="text-danger" onClick={() => this.removeFromCart(index)}>x</span>
                    </li>

                  </Fragment>)
                })}
              </ul>
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
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    token: state.token
  };
};

export const Cart = connect(state2props, dispatch2props)(CartComponent);
