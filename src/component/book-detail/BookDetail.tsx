import React from "react";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { BookService } from "../../service/service.book";
import { IBook } from "../../model/model.book";
import { ToastContainer } from "react-toastify";
import { Localization } from "../../config/localization/localization";

interface IProps {
  internationalization: TInternationalization;
  match: any;
}
interface IState {
  book: IBook | undefined;
}
class BookDetailComponent extends BaseComponent<IProps, IState> {
  state = {
    book: undefined
  };
  private _bookService = new BookService();

  componentDidMount() {
    this.fetchBook(this.props.match.params.bookId);
  }

  async fetchBook(bookId: IBook["id"]) {
    let res = await this._bookService.get(bookId).catch(error => {
      this.handleError({ error: error.response });
    });

    if (res) {
      this.setState({ ...this.state, book: res.data });
    }
  }

  render() {
    return (
      <>
        <div className="mt-5">
          {!this.state.book && <div>error occured</div>}

          {this.state.book && (
            <div>{Localization.title}: {(this.state.book || { title: "" }).title}</div>
          )}
        </div>

        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {};
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization
  };
};

export const BookDetail = connect(
  state2props,
  dispatch2props
)(BookDetailComponent);
