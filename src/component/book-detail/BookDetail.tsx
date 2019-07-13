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

        <section>
          <h5 className="text-uppercase">{Localization.about_bookstore_edition}</h5>
          <div className="book-detail-bordered-box py-2 mb-3">
            <div className="row">
              <div className="col-10">
                <ul className="my-2">
                  <li className="px-2">{Localization.Length}: 282 {Localization.pages}</li>
                  <li className="px-2">Word Wise: Enabled</li>
                  <li className="px-2">Screen Reader: Supported</li>
                  <li className="px-2">Enhanced Typesetting: Enabled</li>
                  <li className="px-2">Page Flip: Enabled</li>
                </ul>
              </div>
              <div className="col-2">
                <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h5 className="text-uppercase">{Localization.from_the_editor}</h5>
          <div className="book-detail-bordered-box py-2 mb-3">
            <div className="row">
              <div className="col-10">
                <p className="mb-3 pl-3">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut repellendus eos earum optio?</p>
                <p className="pl-3">Lorem ipsum dolor sit amet consectetur.</p>
              </div>
              <div className="col-2">
                <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
              </div>
            </div>
          </div>
        </section>

        <section >
          <h5 className="text-uppercase">{Localization.about_this_item}</h5>
          <div className="book-detail-bordered-box py-2 px-3">
            <h5 className="font-weight-bold text-uppercase">{Localization.description}</h5>
            <h5 className="font-weight-bold text-uppercase">{Localization.product_description}</h5>
            <p className="font-weight-bold">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil beatae accusantium ipsum hic sapiente placeat neque, ducimus delectus aspernatur!</p>
            <p className="font-weight-bold">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt, maiores eum praesentium.</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore corporis numquam sint ex molestias quis! Aut quasi voluptas, unde sit, voluptatibus eveniet cupiditate deserunt facilis nesciunt, sequi asperiores. Temporibus, qui incidunt ipsum consequatur perspiciatis error.</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, ullam, quos incidunt explicabo asperiores aut optio iure blanditiis, at possimus tempora quam ea laborum neque. Earum optio molestias libero, exercitationem in laboriosam unde aperiam sint.</p>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi soluta illum quaerat nam esse ab animi dignissimos dolores nesciunt non!</p>
            <h5 className="my-2 text-uppercase">{Localization.review}</h5>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores, consequatur.</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mb-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi ab Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <p className="font-weight-bold mt-0">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt</p>
            <p className="mt-2">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto dolorem quam omnis aut inventore nostrum, explicabo, saepe magnam officia ipsum maiores eaque eum? Quaerat, optio? Vel ea quaerat corporis cum, reprehenderit voluptates earum facere vitae! Lorem, ipsum.</p>
            <h5 className="my-2 text-uppercase">{Localization.about_the_author}</h5>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni, ullam libero autem eius natus optio nostrum fugiat hic sapiente placeat velit veniam animi culpa, voluptatum officia id! Ullam tempora nesciunt eligendi saepe esse, iste quisquam molestiae enim quae perspiciatis vel.</p>
          </div>
          <div className="book-detail-bordered-box border-top-0 pb-2 pt-4 px-3 mb-3">
            <h5 className="font-weight-bold text-uppercase">{Localization.features_details}</h5>
            <h5 className="font-weight-bold text-uppercase">{Localization.product_details}</h5>
            <h6 className="font-weight-bold">
              {Localization.publication_date}: <span> August 1, 2019</span>
            </h6>
            <h6 className="font-weight-bold">
              {Localization.publisher}: <span> Thomas & Mercer</span>
            </h6>
            <h6 className="font-weight-bold">
              {Localization.language}: <span> English</span>
            </h6>
            <h6 className="font-weight-bold">
              ASIN: <span> B07KPFLD6Q</span>
            </h6>
            <h6 className="font-weight-bold">
              {Localization.bookstore_sales_rank}: <span> 1</span>
            </h6>
          </div>
        </section>

        <section className="author">
          <h5 className="text-uppercase">{Localization.about_the_author}</h5>
          <div className="author-info mb-3 book-detail-bordered-box">
            <div className="author-about p-3">
              <p className="mb-0">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium, cupiditate?</p>
            </div>
            <div className="row author-profile py-4">
              <div className="col-4">
                <div className="ml-3">
                  <img src="static/media/img/icon/avatar.png" alt="avatar" />
                </div>
              </div>
              <div className="col-8 p-align-0">
                <h6 className="author-name mr-3">Claire McGowan</h6>
                <button className="btn btn-block author-follow mr-3__">+ {Localization.follow}</button>
              </div>
            </div>
          </div>
        </section>

        <div className="section-separator my-2"></div>

        <section className="customer-reviews mt-3 mb-4">
          <div className="row">
            <div className="col-10">
              <div className="ml-1">
                <h5 className="mb-2 text-uppercase">127 {Localization.customer_review}</h5>
                <Rating
                  className="rating-star"
                  emptySymbol="fa fa-star rating-empty"
                  fullSymbol="fa fa-star rating-full"
                  // fractions={2}
                  direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                  initialRating={4.3}
                // onChange={(newRate) => this.bookRateChange(newRate)}
                />
                <span className="ml-2">4.3 out of 5 stars</span>
              </div>
            </div>
            <div className="col-2">
              <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
            </div>
          </div>
        </section>

        <section className="read-reviews px-1">
          <div className="text-uppercase mt-3 mb-2 font-weight-bold">{Localization.read_reviews_that_mention}</div>
          <div className="row">
            <div className="col-12">
              <button className="btn btn-light mr-3 mb-2">well written</button>
              <button className="btn btn-light mr-3 mb-2">page turner</button>
              <button className="btn btn-light mr-3 mb-2">main character</button>
              <button className="btn btn-light mr-3 mb-2">twists and turns</button>
              <button className="btn btn-light mr-3 mb-2">claire mcgowan</button>
              <button className="btn btn-light mr-3 mb-2">kept me guessing</button>
            </div>
          </div>
          <a href="#" className="see-more">
            <i className="fa fa-angle-down my-3"></i>
            <span className="text ml-1">{Localization.see_more}</span>
          </a>
        </section>

        <section className="comments pb-3 px-1">
          <h5 className="mt-3 text-uppercase font-weight-bold">{Localization.top_reviews}</h5>
          {[1, 2].map(() => (
            <div className="mb-4 mt-3 user-comment-box">
              <div className="row">
                <div className="col-1 mr-3">
                  <div className="img">
                    <img src="static/media/img/icon/avatar.png" alt="avatar" />
                  </div>
                </div>
                <span className="pt-2 ml-3 mr-1">Rose</span>
                <span className="pt-2 mx-2">.</span>
                <span className="pt-2 ">July 1, 2019</span>
              </div>

              <Rating
                className="rating-star"
                emptySymbol="fa fa-star rating-empty"
                fullSymbol="fa fa-star rating-full"
                // fractions={2}
                direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                initialRating={2.5}
              // onChange={(newRate) => this.bookRateChange(newRate)}
              />
              <span className="ml-2 purchase-state text-capitalize">{Localization.verified_purchase}</span>
              <div className="row ml-1 my-1">
                <span className="text-muted text-capitalize">{Localization.format}:</span>
                <span className="text-muted pl-1 text-capitalize">{Localization.bookstore_edition}</span>
              </div>
              <h6 className="my-2 ml-1 font-weight-bold">What You Did</h6>
              <p className="txt mx-1 my-0 pb-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio repellendus nam corporis! Ducimus minima veniam officia repudiandae libero sed culpa quis amet deserunt necessitatibus, consectetur, mollitia assumenda vitae alias aliquid quo dolores fuga doloribus id laborum, cupiditate vel nostrum ullam?
                    <a href="">{Localization.see_more}</a>
              </p>
              <span className="text-muted mx-1">9 {Localization.people_found_this_helpful}</span>
              <div className="helpful row mt-1 pt-1">
                <div className="col-5">
                  <a href=""><button className="btn btn-block text-uppercase">{Localization.helpful}</button></a>
                </div>
                <div className="col-2 pt-2">
                  <a href="" className="text-muted text-capitalize">{Localization.report}</a>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="section-separator my-2"></div>

        <div className="all-review mx-3_ my-3 px-1 ">
          <div className="row">
            <div className="col-10">
              <h6 className="font-weight-bold text-capitalize">
                {Localization.formatString(Localization.see_all_n_reviews, 127)}
              </h6>
            </div>
            <div className="col-2">
              <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
            </div>
          </div>
        </div>

        <div className="section-separator my-2"></div>

        <div className="write-review my-3 mx-1">
          <div className="p-3 p-align-inverse-0">
            <div className="row">
              <div className="col-10">
                <h6 className="text-uppercase">{Localization.write_a_review}</h6>
              </div>
              <div className="col-2">
                <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
              </div>
            </div>
          </div>
        </div>
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
