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
import { BOOK_ROLES } from "../../enum/Book";

interface IProps {
  internationalization: TInternationalization;
  match: any;
}
interface IState {
  book: IBook | undefined;
  pageLoader: boolean;
  errorText: string | undefined;
}
class BookDetailComponent extends BaseComponent<IProps, IState> {
  state = {
    book: undefined,
    pageLoader: false,
    errorText: undefined,
  };
  private _bookService = new BookService();
  bookId!: string;

  componentDidMount() {
    this.bookId = this.props.match.params.bookId;
    this.fetchBook(this.bookId);
  }

  async fetchBook(bookId: IBook["id"]) {
    this.setState({ ...this.state, pageLoader: true });

    let res = await this._bookService.get(bookId).catch(error => {
      const { body: errorText } = this.handleError({ error: error.response });

      this.setState({ ...this.state, pageLoader: false, errorText });
    });

    if (res) {
      this.setState({ ...this.state, book: res.data, pageLoader: false, errorText: undefined });
    }
  }
  book_detail_template(book: IBook) {
    const writer_fullName = '';
    const book_image = (book.images && book.images.length && book.images[0]) ||
    "static/media/img/icon/default-book.png";
    const book_title = '';
    const book_rate = '';
    const book_totalRate = '';

    let writerList = book.roles.filter(
      r => r.role === BOOK_ROLES.Writer
    );
    if (writerList.length) {
      const writer_fullName = writerList[0].person.name + ' ' + writerList[0].person.last_name;
    }

    return (
      <>
        {/* <div>{Localization.title}: {(this.state.book || { title: "" }).title}</div> */}
        <section className="book-detail mx-3__">
          <div className="row">
            <div className="col-5 mr-1__">
              <div className="user-book">
                <div className="slide-book">
                  <img src={book_image} alt="book-image"/>
                </div>
              </div>
            </div>
            <div className="col-7 p-align-0 pr-0__pl-4">
              <h5 className="pl-2">{book.title}</h5>
              <h6 className="pl-2">{writer_fullName}</h6>
              <div className="rate-book pl-2">
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star checked"></span>
                <span className="fa fa-star"></span>
              </div>
              <span className="number pl-2">(127)</span>
              <div className="pointer-container mt-2 pl-2">
                <div className="pointer mr-1 mt-0 pt-0 px-1">#1 Best Seller</div>
                <span>in <a href="">Kindle Store</a></span>
              </div>
            </div>
          </div>
          <div className="row mx-2 my-2 add-link">
            <a href="">ADD TO LIST</a>
          </div>
        </section>


      </>
    )
  }
  book_render() {
    if (this.state.book) {
      return this.book_detail_template(this.state.book!);

    } else if (this.state.pageLoader) {
      return (
        <>
          <div>{Localization.loading_with_dots}</div>
        </>
      )
    } else if (this.state.errorText) {
      return (
        <>
          <div>{this.state.errorText}</div>
          <div onClick={() => this.fetchBook(this.bookId)}>
            {Localization.retry}
          </div>
        </>
      )
    }
  }
  render() {
    return (
      <>
        <div className="book-detail-wrapper mt-3">

          {this.book_render()}

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
