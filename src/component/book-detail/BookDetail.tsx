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
import Rating from 'react-rating';

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
    let writer_fullName = '';
    const book_image = (book.images && book.images.length && book.images[0]) ||
      "static/media/img/icon/default-book.png";
    // const book_title = '';
    const book_rate = 4;
    const book_totalRate = 127;

    let writerList = book.roles.filter(
      r => r.role === BOOK_ROLES.Writer
    );
    if (writerList.length) {
      writer_fullName = writerList[0].person.name + ' ' + writerList[0].person.last_name;
    }

    return (
      <>
        <section className="book-detail">
          <div className="row">
            <div className="col-5">
              <div className="book-image-wrapper">
                {/* <div className="slide-book"> */}
                <img src={book_image} alt="book" />
                {/* </div> */}
              </div>
            </div>
            <div className="book-info-wrapper col-7 p-align-0">
              <h5>{book.title}</h5>
              <h6 className="book-writer">{writer_fullName}</h6>

              <Rating
                className="rating-star"
                emptySymbol="fa fa-star rating-empty"
                fullSymbol="fa fa-star rating-full"
                // fractions={2}
                direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                initialRating={book_rate}
                onChange={(newRate) => this.bookRateChange(newRate)}
              />
              <span className="book-total-rate pl-2">({book_totalRate})</span>
              <div className="book-selled-info-container mt-2">
                <div className="book-selled-info">#1 Best Seller</div>
                <div className="clearfix"></div>
                <span className="from-store">{Localization.in} {Localization.brand_name}</span>
              </div>
            </div>
            <div className="col-12">
              <button className="add-to-list btn btn-link p-align-0 mt-2">{Localization.add_to_list}</button>
            </div>
          </div>

        </section>

        <section className="about mx-3">
          <h4 className="my-1 mx-2">ABOUT THE KINDLE EDITION</h4>
          <div className="px-0 py-2 mx-1 my-3">
            <ul className="my-2">
              <li className="px-2">Length: 282 pages</li>
              <li className="px-2">Word Wise: Enabled</li>
              <li className="px-2">Screen Reader: Supported</li>
              <li className="px-2">Enhanced Typesetting: Enabled</li>
              <li className="px-2">Page Flip: Enabled</li>
            </ul>
          </div>
        </section>
      </>
    )
  }
  bookRateChange(newRate: number) {
    debugger;
    //todo: request to update this book's overAllrate & overallRate count: with this user's rate
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
