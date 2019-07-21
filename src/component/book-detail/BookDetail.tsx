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
import { IComment } from "../../model/model.comment";
import { Input } from "../form/input/Input";

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
  commentLoader: boolean;
  commentErrorText: string | undefined;
  book_comments: IComment[] | undefined;
  newComment: {
    value: string | undefined;
    isValid: boolean;
    loader: boolean;
  };
  comment_actions: {
    like_loader_obj: { [key: string]: boolean };
    unlike_loader_obj: { [key: string]: boolean };
    report_loader_obj: { [key: string]: boolean };
    unreport_loader_obj: { [key: string]: boolean };
    comment_compress_obj: { [key: string]: boolean };
  };
}
class BookDetailComponent extends BaseComponent<IProps, IState> {
  state = {
    book: undefined,
    pageLoader: false,
    errorText: undefined,
    followWriter_loaderObj: {},
    is_writeCommentBox_open: false,
    commentLoader: false,
    commentErrorText: undefined,
    book_comments: undefined,
    newComment: {
      value: undefined,
      isValid: false,
      loader: false,
    },
    comment_actions: {
      like_loader_obj: {},
      unlike_loader_obj: {},
      report_loader_obj: {},
      unreport_loader_obj: {},
      comment_compress_obj: {},
    },
  };
  private _bookService = new BookService();
  bookId!: string;
  private _followService = new FollowService();
  private _rateService = new RateService();
  private _commentService = new CommentService();
  commentTextarea!: HTMLInputElement | HTMLTextAreaElement;

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
    // debugger;
    this.setState({ ...this.state, commentLoader: true, commentErrorText: undefined });

    // let res = await this._commentService.search(bookId, {limit:10, offset:0}).catch(error => {
    let res = await this._commentService.book_comments(bookId).catch(error => {
      const { body: commentErrorText } = this.handleError({ error: error.response });

      this.setState({ ...this.state, commentLoader: false, commentErrorText });
    });

    if (res) {
      if (res.data.result) {
        this.setState({ ...this.state, book_comments: res.data.result, commentLoader: false, commentErrorText: undefined });
      }
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

        {
          book.from_editor &&
          <section>
            <h5 className="text-uppercase">{Localization.from_the_editor}</h5>
            <div className="book-detail-bordered-box py-2 mb-3">
              <div className="row">
                <div className="col-12">
                  <p className="mb-3__ px-3">{book.from_editor}</p>
                </div>
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
                            >
                              - {Localization.unfollow}
                            </BtnLoader>
                            :
                            <BtnLoader
                              btnClassName="btn btn-block author-follow mr-3__"
                              loading={!!followWriter_loaderObj[ab_writer.person.id]}
                              onClick={() => this.follow_writer(ab_writer.person.id)}
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

        {this.comment_sections_render(book)}

      </>
    )
  }

  comment_sections_render(book: IBook) {
    return (
      <>
        <section className="customer-reviews mt-3 mb-4">
          <div className="row">
            <div className="col-12">
              <div className="ml-1">
                <h5 className="mb-2 text-uppercase">{book.rate_no} {Localization.customer_review}</h5>
                <Rating
                  className="rating-star"
                  emptySymbol="fa fa-star rating-empty"
                  fullSymbol="fa fa-star rating-full"
                  direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                  initialRating={book.rate}
                  readonly
                />
                <span className="ml-2">{Localization.formatString(Localization.n_out_of_m_stars, book.rate, 5)}</span>
              </div>
            </div>

          </div>
        </section>

        <section className="comments pb-3 px-1">
          <h5 className="mt-3 text-uppercase font-weight-bold">{Localization.top_reviews}</h5>
          {this.book_commentList_render()}

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
                  <h6 className="text-uppercase mb-0">{Localization.write_a_review}</h6>
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
            <Input
              defaultValue={this.state.newComment.value}
              onChange={(val, isValid) => { this.handleCommentInputChange(val, isValid) }}
              required
              placeholder={Localization.your_comment}
              is_textarea
              textarea_rows={4}
              elRef={txtarea => { this.commentTextarea = txtarea; }}
            />
            <BtnLoader
              btnClassName="btn btn-light btn-block mt-1__"
              loading={this.state.newComment.loader}
              disabled={!this.state.newComment.isValid}
              onClick={() => { this.addComment() }}
            >
              {Localization.submit}
            </BtnLoader>
          </div>
        </div>
      </>
    )
  }
  handleCommentInputChange(value: any, isValid: boolean) {
    this.setState({ ...this.state, newComment: { ...this.state.newComment, isValid, value } });
  }

  async addComment() {
    this.setState({ ...this.state, newComment: { ...this.state.newComment, loader: true } });
    let res = await this._commentService.add(this.state.newComment.value!, this.bookId).catch(error => {
      this.handleError({ error: error.response });
      this.setState({ ...this.state, newComment: { ...this.state.newComment, loader: false } });
    });
    if (res) {
      this.commentTextarea.value = '';
      res.data.person = this.props.logged_in_user!.person!;
      let new_book_comments: IComment[] = this.state.book_comments || [];
      new_book_comments.unshift(res.data);
      this.setState({
        ...this.state,
        newComment: { isValid: false, loader: false, value: undefined },
        book_comments: new_book_comments
      });
      this.apiSuccessNotify(Localization.msg.ui.your_comment_submited);
    }
  }

  book_commentList_render() {

    if (this.state.book_comments && (this.state.book_comments! || []).length) {
      return (
        <>
          {(this.state.book_comments! || []).map((bk_cmt: IComment, index) => {

            let cmt_person_fullName = (bk_cmt.person.name || '') + ' ' + (bk_cmt.person.last_name || '');
            let cmt_person_image = bk_cmt.person.image ? this.getImageUrl(bk_cmt.person.image) :
              "/static/media/img/icon/avatar.png";
            let like_loader_obj: any = { ...this.state.comment_actions.like_loader_obj };
            let unlike_loader_obj: any = { ...this.state.comment_actions.unlike_loader_obj };

            let report_loader_obj: any = { ...this.state.comment_actions.report_loader_obj };
            let unreport_loader_obj: any = { ...this.state.comment_actions.unreport_loader_obj };

            let comment_compress_obj: any = { ...this.state.comment_actions.comment_compress_obj };

            return (
              <Fragment key={index}>
                <div className="mb-4 mt-3 user-comment-box">
                  <div className="row">
                    <div className="col-1 mr-3">
                      <div className="img">
                        <img src={cmt_person_image} alt="avatar" />
                      </div>
                    </div>
                    <span className="pt-2 ml-3 mr-1">{cmt_person_fullName}</span>
                    <span className="pt-2 mx-2">.</span>
                    <span className="pt-2 ">{bk_cmt.creation_date}</span>
                  </div>

                  <Rating
                    className="rating-star"
                    emptySymbol="fa fa-star rating-empty"
                    fullSymbol="fa fa-star rating-full"
                    direction={this.props.internationalization.rtl ? 'rtl' : 'ltr'}
                    initialRating={2.5}
                    readonly
                  />

                  {/* <h6 className="my-2 ml-1 font-weight-bold">What You Did</h6> */}
                  <p className={
                    "comment-body mx-1 mb-0 pb-2 " +
                    (!comment_compress_obj[bk_cmt.id] ? 'comment-compress' : '')
                  }>
                    {bk_cmt.body}
                    {/* <button className="btn btn-link p-0">{Localization.see_more}</button> */}
                  </p>
                  <button className="btn btn-link p-0" onClick={() => this.toggleCommentCompress(bk_cmt.id)}>
                    {
                      !comment_compress_obj[bk_cmt.id]
                        ?
                        Localization.see_more
                        :
                        Localization.see_less
                    }

                  </button>
                  <div className="clearfix"></div>

                  {
                    (bk_cmt.likes && bk_cmt.likes > 0) ?
                      <span className="text-muted mx-1 small">
                        {
                          bk_cmt.likes === 1
                            ?
                            <>{bk_cmt.likes} {Localization.people_found_this_helpful_1}</>
                            :
                            <>{bk_cmt.likes} {Localization.people_found_this_helpful}</>
                        }
                        {/* {bk_cmt.likes} {Localization.people_found_this_helpful} */}
                      </span>
                      : ''
                  }
                  <div className="clearfix"></div>
                  {
                    !!(bk_cmt.reports && bk_cmt.reports > 0) &&
                    <span className="text-muted mx-1 small">
                      {
                        bk_cmt.reports === 1
                          ?
                          <>{bk_cmt.reports} {Localization.people_report_this_1}</>
                          :
                          <>{bk_cmt.reports} {Localization.people_report_this}</>
                      }
                      {/* {bk_cmt.likes} {Localization.people_found_this_helpful} */}
                    </span>
                  }
                  <div className="comment-feedback row__ mt-1 pt-1">
                    {
                      bk_cmt.liked_by_user
                        ?
                        <BtnLoader
                          btnClassName="text-success btn btn-link p-0"
                          loading={unlike_loader_obj[bk_cmt.id]}
                          onClick={() => { this.unlikeComment(bk_cmt.id) }}
                        >
                          {Localization.thank_you_for_your_feedback}&nbsp;
                          <span className="small">({Localization.remove})</span>
                        </BtnLoader>
                        :
                        <BtnLoader
                          btnClassName="btn btn-block__ btn-helpful text-uppercase"
                          loading={like_loader_obj[bk_cmt.id]}
                          onClick={() => { this.likeComment(bk_cmt.id) }}
                        >
                          {Localization.helpful}
                        </BtnLoader>
                    }
                    {
                      bk_cmt.reported_by_user
                        ?
                        <BtnLoader
                          btnClassName="text-warning text-capitalize btn btn-link p-0 ml-3"
                          loading={unreport_loader_obj[bk_cmt.id]}
                          onClick={() => { this.unreportComment(bk_cmt.id) }}
                        >
                          {Localization.your_report_submited}&nbsp;
                          <span className="small">({Localization.remove})</span>
                        </BtnLoader>
                        :
                        <BtnLoader
                          btnClassName="text-muted text-capitalize btn btn-link p-0 ml-3"
                          loading={report_loader_obj[bk_cmt.id]}
                          onClick={() => { this.reportComment(bk_cmt.id) }}
                        >
                          {Localization.report}
                        </BtnLoader>
                    }


                  </div>
                </div>
              </Fragment>
            )

          })}
        </>
      );
    } else if (this.state.book_comments && !(this.state.book_comments! || []).length) {
      return (
        <>
          <div>{Localization.no_item_found}</div>
        </>
      );

    } else if (this.state.commentErrorText) {
      return (
        <>
          <div>{this.state.commentErrorText}</div>
          <div onClick={() => this.fetchBook_comments(this.bookId)}>
            {Localization.retry}
          </div>
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

  async likeComment(comment_id: string) {
    this.setState({
      ...this.state,
      comment_actions: {
        ...this.state.comment_actions, like_loader_obj: {
          ...this.state.comment_actions.like_loader_obj, [comment_id]: true
        }
      }
    });
    let res = await this._commentService.like(comment_id).catch(error => {
      this.handleError({ error: error.response });
    });

    if (res) {
      let commentIndex = (this.state.book_comments || []).findIndex((cmt: IComment) => cmt.id === comment_id);
      let newBook_comments: IComment[] = [...this.state.book_comments || []];
      newBook_comments[commentIndex].liked_by_user = true;
      newBook_comments[commentIndex].likes = ++newBook_comments[commentIndex].likes;

      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, like_loader_obj: {
            ...this.state.comment_actions.like_loader_obj, [comment_id]: false
          }
        },
        book_comments: newBook_comments
      });

    } else {
      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, like_loader_obj: {
            ...this.state.comment_actions.like_loader_obj, [comment_id]: false
          }
        }
      });
    }
  }
  async unlikeComment(comment_id: string) {
    this.setState({
      ...this.state,
      comment_actions: {
        ...this.state.comment_actions, unlike_loader_obj: {
          ...this.state.comment_actions.unlike_loader_obj, [comment_id]: true
        }
      }
    });
    let res = await this._commentService.unlike(comment_id).catch(error => {
      this.handleError({ error: error.response });
    });

    if (res) {
      let commentIndex = (this.state.book_comments || []).findIndex((cmt: IComment) => cmt.id === comment_id);
      let newBook_comments: IComment[] = [...this.state.book_comments || []];
      newBook_comments[commentIndex].liked_by_user = false;
      newBook_comments[commentIndex].likes = --newBook_comments[commentIndex].likes;

      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, unlike_loader_obj: {
            ...this.state.comment_actions.unlike_loader_obj, [comment_id]: false
          }
        },
        book_comments: newBook_comments
      });

    } else {
      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, unlike_loader_obj: {
            ...this.state.comment_actions.unlike_loader_obj, [comment_id]: false
          }
        }
      });
    }
  }

  async reportComment(comment_id: string) {
    this.setState({
      ...this.state,
      comment_actions: {
        ...this.state.comment_actions, report_loader_obj: {
          ...this.state.comment_actions.report_loader_obj, [comment_id]: true
        }
      }
    });
    let res = await this._commentService.report(comment_id).catch(error => {
      this.handleError({ error: error.response });
    });

    if (res) {
      let commentIndex = (this.state.book_comments || []).findIndex((cmt: IComment) => cmt.id === comment_id);
      let newBook_comments: IComment[] = [...this.state.book_comments || []];
      newBook_comments[commentIndex].reported_by_user = true;
      newBook_comments[commentIndex].reports = ++newBook_comments[commentIndex].reports;

      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, report_loader_obj: {
            ...this.state.comment_actions.report_loader_obj, [comment_id]: false
          }
        },
        book_comments: newBook_comments
      });

    } else {
      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, report_loader_obj: {
            ...this.state.comment_actions.report_loader_obj, [comment_id]: false
          }
        }
      });
    }
  }

  async unreportComment(comment_id: string) {
    this.setState({
      ...this.state,
      comment_actions: {
        ...this.state.comment_actions, unreport_loader_obj: {
          ...this.state.comment_actions.unreport_loader_obj, [comment_id]: true
        }
      }
    });
    let res = await this._commentService.unreport(comment_id).catch(error => {
      this.handleError({ error: error.response });
    });

    if (res) {
      let commentIndex = (this.state.book_comments || []).findIndex((cmt: IComment) => cmt.id === comment_id);
      let newBook_comments: IComment[] = [...this.state.book_comments || []];
      newBook_comments[commentIndex].reported_by_user = false;
      newBook_comments[commentIndex].reports = --newBook_comments[commentIndex].reports;

      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, unreport_loader_obj: {
            ...this.state.comment_actions.unreport_loader_obj, [comment_id]: false
          }
        },
        book_comments: newBook_comments
      });

    } else {
      this.setState({
        ...this.state,
        comment_actions: {
          ...this.state.comment_actions, unreport_loader_obj: {
            ...this.state.comment_actions.unreport_loader_obj, [comment_id]: false
          }
        }
      });
    }
  }

  toggleCommentCompress(comment_id: string) {
    let comment_compress_obj: any = { ...this.state.comment_actions.comment_compress_obj };
    this.setState({
      ...this.state,
      comment_actions: {
        ...this.state.comment_actions,
        comment_compress_obj: {
          ...this.state.comment_actions.comment_compress_obj,
          [comment_id]: !comment_compress_obj[comment_id]
        }
      }
    });
  }

  toggleWriteComment() {
    this.setState({ ...this.state, is_writeCommentBox_open: !this.state.is_writeCommentBox_open });
  }

  async bookRateChange(newRate: number, book_id: string) {
    let res = await this._rateService.add(book_id, newRate).catch(error => {
      this.handleError({ error: error.response });
    });
    if (res) {
      this.apiSuccessNotify(Localization.msg.ui.your_rate_submited);
    }
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
