import React, { Fragment } from "react";
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
import { FollowService } from "../../service/service.follow";
import { IToken } from "../../model/model.token";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { RateService } from "../../service/service.rate";
import { IUser } from "../../model/model.user";
import { action_user_logged_in } from "../../redux/action/user";
import { CommentService } from "../../service/service.comment";

interface IProps {
  internationalization: TInternationalization;
  match: any;
  token: IToken;
  logged_in_user?: IUser | null;
  onUserLoggedIn?: (user: IUser) => void;
}
interface IState {
  book: IBook | undefined;
  pageLoader: boolean;
  errorText: string | undefined;
  followWriter_loaderObj: { [key: string]: boolean };
  is_writeCommentBox_open: boolean;
}
class BookDetailComponent extends BaseComponent<IProps, IState> {
  state = {
    book: undefined,
    pageLoader: false,
    errorText: undefined,
    followWriter_loaderObj: {},
    is_writeCommentBox_open: false,
  };
  private _bookService = new BookService();
  bookId!: string;
  private _followService = new FollowService();
  private _rateService = new RateService();
  private _commentService = new CommentService();

  componentDidMount() {
    this.gotoTop();
    this._followService.setToken(this.props.token);
    this._rateService.setToken(this.props.token);
    this._commentService.setToken(this.props.token);

    this.bookId = this.props.match.params.bookId;
    this.fetchBook(this.bookId);
    this.fetchBook_comments(this.bookId);
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

  async fetchBook_comments(bookId: IBook["id"]) {
    debugger;
    // this.setState({ ...this.state, commentLoader: true });

    let res = await this._commentService.book_comments(bookId).catch(error => {
      const { body: commentErrorText } = this.handleError({ error: error.response });

      // this.setState({ ...this.state, commentLoader: false, commentErrorText });
    });

    if (res) {
      debugger;
      // this.setState({ ...this.state, book_comments: res.data, commentLoader: false, commentErrorText: undefined });
    }
  }

  book_detail_template(book: IBook) {
    const book_image = (book.images && book.images.length && this.getImageUrl(book.images[0])) ||
      "/static/media/img/icon/default-book.png";

    let writerList = book.roles.filter(
      r => r.role === BOOK_ROLES.Writer
    );
    let first_writer_fullName = '';
    if (writerList.length) {
      first_writer_fullName = writerList[0].person.name + ' ' + writerList[0].person.last_name;
    }

    let pressList = book.roles.filter(
      r => r.role === BOOK_ROLES.Press
    );

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
              <h6 className="book-writer">{first_writer_fullName}</h6>

              <Rating
                className="rating-star"
                emptySymbol="fa fa-star rating-empty"
                fullSymbol="fa fa-star rating-full"
                // fractions={2}
                direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                initialRating={book.rate}
                onChange={(newRate) => this.bookRateChange(newRate, book.id)}
              />
              <span className="book-total-rate pl-2">({book.rate_no})</span>
              <div className="book-selled-info-container mt-2">
                {/* <div className="book-selled-info">#1 Best Seller</div> */}
                {
                  (book.tags || []).map((book_tag, book_tag_index) => (
                    <div className="book-selled-info" key={book_tag_index}>{book_tag}</div>
                  ))
                }
                {/* <div className="clearfix"></div> */}
                {/* <span className="from-store">{Localization.in} {Localization.brand_name}</span> */}
              </div>
            </div>
            <div className="col-12">
              <button className="add-to-list btn btn-link p-align-0 mt-2">{Localization.add_to_list}</button>
            </div>
          </div>

        </section>

        {/* <section>
          <h5 className="text-uppercase">{Localization.about_bookstore_edition}</h5>
          <div className="book-detail-bordered-box py-2 mb-3">
            <div className="row">
              <div className="col-12">
                <ul className="my-2">
                  {
                    (book.pages || book.duration) &&
                    <li className="px-2">{Localization.Length}:&nbsp;
                      {book.pages && <span>{book.pages} {Localization.pages}</span>}
                      {(book.pages && book.duration) && <span>,&nbsp;</span>}
                      {book.duration && <span>{book.duration} {Localization.second}</span>}
                    </li>
                  }
                  
                </ul>
              </div>
              
            </div>

          </div>
        </section> */}

        {
          book.from_editor &&
          <section>
            <h5 className="text-uppercase">{Localization.from_the_editor}</h5>
            <div className="book-detail-bordered-box py-2 mb-3">
              <div className="row">
                <div className="col-12">
                  <p className="mb-3__ px-3">{book.from_editor}</p>
                  {/* <p className="pl-3">Lorem ipsum dolor sit amet consectetur.</p> */}
                </div>
                {/* <div className="col-2">
                <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
              </div> */}
              </div>
            </div>
          </section>
        }

        <section >
          <h5 className="text-uppercase">{Localization.about_this_item}</h5>
          <div className="book-detail-bordered-box py-2 px-3">
            {/* <h5 className="font-weight-bold text-uppercase">{Localization.description}</h5> */}
            <h5 className="font-weight-bold text-uppercase">{Localization.product_description}</h5>
            <p className="font-weight-bold">{book.description}</p>
            {/* <p className="font-weight-bold">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni alias quae deserunt, maiores eum praesentium.</p>
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
             */}
            {
              writerList && writerList.length && writerList[0].person.bio &&
              <>
                <h5 className="my-2 text-uppercase">{Localization.about_the_author}</h5>
                <p>{writerList[0].person.bio}</p>
              </>
            }

          </div>
          <div className="book-detail-bordered-box border-top-0 pb-2 pt-4 px-3 mb-3">

            <h5 className="font-weight-bold text-uppercase">{Localization.features_details}</h5>
            {/* <h5 className="font-weight-bold text-uppercase">{Localization.product_details}</h5> */}

            {
              (book.pages || book.duration) &&
              <h6 className="font-weight-bold">{Localization.Length}:&nbsp;
                {book.pages && <span>{book.pages} {Localization.pages}</span>}
                {(book.pages && book.duration) && <span>,&nbsp;</span>}
                {book.duration && <span>{book.duration} {Localization.second}</span>}
              </h6>
            }
            <h6 className="font-weight-bold">
              {Localization.publication_date}: <span> {book.pub_year}</span>
            </h6>
            <h6 className="font-weight-bold">
              {Localization.publisher}:&nbsp;
              {
                pressList && pressList.length &&
                <span>
                  {pressList.map((press_item, press_index) => (
                    <Fragment key={press_index}>
                      {press_item.person.name + ' ' + press_item.person.last_name}
                      {press_index + 1 < pressList.length && ', '}
                    </Fragment>
                  ))}
                </span>
              }
            </h6>
            <h6 className="font-weight-bold">
              {Localization.language}: <span className="text-capitalize"> {book.language}</span>
            </h6>
            <h6 className="font-weight-bold">
              <span className="text-uppercase">{Localization.book_isben}</span>: <span> {book.isben}</span>
            </h6>
            {/* <h6 className="font-weight-bold">
              {Localization.bookstore_sales_rank}: <span> 1</span>
            </h6> */}
          </div>
        </section>

        {
          writerList && writerList.length &&

          <section className="author">
            <h5 className="text-uppercase">{Localization.about_the_author}</h5>
            {
              writerList.map((ab_writer, ab_writerIndex) => {

                let ab_writer_fullName = ab_writer.person.name + ' ' + ab_writer.person.last_name;
                let ab_writer_image = ab_writer.person.image ? this.getImageUrl(ab_writer.person.image) :
                  "/static/media/img/icon/avatar.png";

                let followWriter_loaderObj: any = { ...this.state.followWriter_loaderObj };

                return (
                  // <>
                  <div className="author-info mb-3__ book-detail-bordered-box" key={ab_writerIndex}>
                    {
                      ab_writer.person.bio &&
                      <div className="author-about p-3">
                        <p className="mb-0">{ab_writer.person.bio}</p>
                      </div>
                    }
                    <div className="row author-profile py-4">
                      <div className="col-4">
                        <div className="ml-3">
                          <img src={ab_writer_image} alt="avatar" />
                        </div>
                      </div>
                      <div className="col-8 p-align-0">
                        <h6 className="author-name mr-3 text-capitalize">{ab_writer_fullName}</h6>
                        {/* <button
                          className="btn btn-block author-follow mr-3__"
                          onClick={() => this.follow_writer(ab_writer.person.id)}
                        >+ {Localization.follow}</button> */}

                        {
                          this.props.logged_in_user &&
                            this.props.logged_in_user.person &&
                            this.props.logged_in_user.person.following_list &&
                            this.props.logged_in_user.person.following_list.includes(ab_writer.person.id)
                            ?
                            <BtnLoader
                              btnClassName="btn btn-block author-follow mr-3__"
                              loading={!!followWriter_loaderObj[ab_writer.person.id]}
                              onClick={() => this.unfollow_writer(ab_writer.person.id)}
                            // disabled={!this.state.isFormValid}
                            >
                              - {Localization.unfollow}
                            </BtnLoader>
                            :
                            <BtnLoader
                              btnClassName="btn btn-block author-follow mr-3__"
                              loading={!!followWriter_loaderObj[ab_writer.person.id]}
                              onClick={() => this.follow_writer(ab_writer.person.id)}
                            // disabled={!this.state.isFormValid}
                            >
                              + {Localization.follow}
                            </BtnLoader>
                        }

                      </div>
                    </div>
                  </div>
                  // </>
                )
              })
            }
          </section>
        }

        <div className="section-separator my-2"></div>

        <section className="customer-reviews mt-3 mb-4">
          <div className="row">
            <div className="col-12">
              <div className="ml-1">
                <h5 className="mb-2 text-uppercase">{book.rate_no} {Localization.customer_review}</h5>
                <Rating
                  className="rating-star"
                  emptySymbol="fa fa-star rating-empty"
                  fullSymbol="fa fa-star rating-full"
                  // fractions={2}
                  direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                  initialRating={book.rate}
                  // onChange={(newRate) => this.bookRateChange(newRate)}
                  readonly
                />
                {/* <span className="ml-2">4.3 out of 5 stars</span> */}
                <span className="ml-2">{Localization.formatString(Localization.n_out_of_m_stars, book.rate, 5)}</span>
              </div>
            </div>
            {/* <div className="col-2">
              <i className="fa fa-angle-right-app fa-2x book-detail-bordered-box-icon"></i>
            </div> */}
          </div>
        </section>

        {/* <section className="read-reviews px-1">
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
          <button className="see-more btn btn-link p-align-0">
            <i className="fa fa-angle-down my-3__"></i>
            <span className="text ml-1">{Localization.see_more}</span>
          </button>
        </section> */}

        <section className="comments pb-3 px-1">
          <h5 className="mt-3 text-uppercase font-weight-bold">{Localization.top_reviews}</h5>
          {[1, 2].map((item, index) => (
            <div className="mb-4 mt-3 user-comment-box" key={index}>
              <div className="row">
                <div className="col-1 mr-3">
                  <div className="img">
                    <img src="/static/media/img/icon/avatar.png" alt="avatar" />
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
                direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                initialRating={2.5}
                readonly
              />
              {/* <span className="ml-2 purchase-state text-capitalize">{Localization.verified_purchase}</span> */}
              {/* <div className="row ml-1 my-1">
                <span className="text-muted text-capitalize">{Localization.format}:</span>
                <span className="text-muted pl-1 text-capitalize">{Localization.bookstore_edition}</span>
              </div> */}
              <h6 className="my-2 ml-1 font-weight-bold">What You Did</h6>
              <p className="txt mx-1 my-0 pb-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio repellendus nam corporis! Ducimus minima veniam officia repudiandae libero sed culpa quis amet deserunt necessitatibus, consectetur, mollitia assumenda vitae alias aliquid quo dolores fuga doloribus id laborum, cupiditate vel nostrum ullam?
                    <button className="btn btn-link p-0">{Localization.see_more}</button>
              </p>
              <span className="text-muted mx-1 small">9 {Localization.people_found_this_helpful}</span>
              <div className="comment-feedback row__ mt-1 pt-1">
                {/* <div className="col-5"> */}
                <button className="btn btn-block__ btn-helpful text-uppercase">{Localization.helpful}</button>
                <button className="text-success btn btn-link p-0">{Localization.thank_you_for_your_feedback}</button>
                {/* </div> */}
                {/* <div className="col-2 pt-2"> */}
                <button className="text-muted text-capitalize btn btn-link p-0 ml-3">{Localization.report}</button>
                {/* </div> */}
              </div>
            </div>
          ))}
        </section>

        <div className="section-separator my-2"></div>

        <div className="all-review mx-3_ my-3__ py-2 px-1 ">
          <div className="row">
            <div className="col-10">
              <h6 className="font-weight-bold text-capitalize">
                {/* {Localization.formatString(Localization.see_all_n_reviews, 127)} */}
                {Localization.more_reviews}
              </h6>
            </div>
            <div className="col-2">
              <i className="fa fa-angle-down fa-2x book-detail-bordered-box-icon"></i>
            </div>
          </div>
        </div>

        <div className="section-separator my-2"></div>

        <div className="my-3">
          <div className="write-review my-3__ py-2__ mx-1" onClick={() => this.toggleWriteComment()}>
            <div className="p-3 p-align-inverse-0">
              <div className="row">
                <div className="col-10">
                  <h6 className="text-uppercase">{Localization.write_a_review}</h6>
                </div>
                <div className="col-2">
                  <i className={
                    "fa fa-angle-down__ fa-2x book-detail-bordered-box-icon " +
                    (this.state.is_writeCommentBox_open ? 'fa-angle-up' : 'fa-angle-down')
                  }></i>
                </div>
              </div>
            </div>
          </div>
          <div className={"write-comment-box mx-1 mt-1 " + (!this.state.is_writeCommentBox_open ? 'd-none' : '')} >
            <textarea className="form-control" rows={4} placeholder={Localization.your_comment}></textarea>
            <BtnLoader
              btnClassName="btn btn-light btn-block mt-1"
              loading={false}
              onClick={() => { }}
            >
              {Localization.submit}
            </BtnLoader>
          </div>
        </div>

      </>
    )
  }

  toggleWriteComment() {
    this.setState({ ...this.state, is_writeCommentBox_open: !this.state.is_writeCommentBox_open });
  }

  async bookRateChange(newRate: number, book_id: string) {
    await this._rateService.add(book_id, newRate).catch(error => {
      this.handleError({ error: error.response });
    });
  }

  async follow_writer(writer_id: string) {
    this.setState({
      ...this.state,
      followWriter_loaderObj: { ...this.state.followWriter_loaderObj, [writer_id]: true }
    });
    let res = await this._followService.follow_person(writer_id).catch(error => {
      this.handleError({ error: error.response });
    });
    this.setState({
      ...this.state,
      followWriter_loaderObj: { ...this.state.followWriter_loaderObj, [writer_id]: false }
    });

    if (res) {
      if (this.props.logged_in_user) {
        let profile = { ...this.props.logged_in_user };
        if (profile.person) {
          profile.person.following_list = profile.person.following_list || [];
          profile.person.following_list.push(writer_id);
          this.updateUserProfile(profile);
        }
      }
    }

  }

  async unfollow_writer(writer_id: string) {
    this.setState({
      ...this.state,
      followWriter_loaderObj: { ...this.state.followWriter_loaderObj, [writer_id]: true }
    });
    let res = await this._followService.unfollow_person(writer_id).catch(error => {
      this.handleError({ error: error.response });
    });
    this.setState({
      ...this.state,
      followWriter_loaderObj: { ...this.state.followWriter_loaderObj, [writer_id]: false }
    });

    if (res) {
      if (this.props.logged_in_user) {
        let profile = { ...this.props.logged_in_user };
        if (profile.person) {
          profile.person.following_list = profile.person.following_list || [];

          if (profile.person.following_list.indexOf(writer_id) > -1) {
            profile.person.following_list = profile.person.following_list.filter(id => id !== writer_id);
            this.updateUserProfile(profile);
          }
        }
      }
    }
  }

  updateUserProfile(newProfile: IUser) {
    this.props.onUserLoggedIn && this.props.onUserLoggedIn(newProfile);
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
  return {
    onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
  };
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
    token: state.token,
    logged_in_user: state.logged_in_user,
  };
};

export const BookDetail = connect(
  state2props,
  dispatch2props
)(BookDetailComponent);
