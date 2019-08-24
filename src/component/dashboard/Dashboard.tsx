import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { IUser } from "../../model/model.user";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import Slider, { Settings } from "react-slick";
import { Localization } from "../../config/localization/localization";

import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
// import { Dropdown, ButtonGroup } from 'react-bootstrap';

import { History } from "history";
import { IBook } from "../../model/model.book";
import { BookService } from "../../service/service.book";
import { IToken } from "../../model/model.token";
import { ToastContainer } from "react-toastify";
import { BOOK_ROLES } from "../../enum/Book";
import { NavLink } from "react-router-dom";

interface IProps {
  logged_in_user?: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
}

interface IState {
  recomendedBookList: IBook[] | undefined;
  recomendedBookError: string | undefined;
  newReleaseBookList: IBook[] | undefined;
  newReleaseBookError: string | undefined;
  byWriterBookList: IBook[] | undefined;
  byWriterBookError: string | undefined;
}

class DashboardComponent extends BaseComponent<IProps, IState> {
  state = {
    recomendedBookList: undefined,
    recomendedBookError: undefined,
    newReleaseBookList: undefined,
    newReleaseBookError: undefined,
    byWriterBookList: undefined,
    byWriterBookError: undefined
  };
  private _bookService = new BookService();
  // dragging!: boolean;
  sliderSetting: Settings = {
    dots: false,
    accessibility: false,
    // swipe: false,
    infinite: false,
    // className: "center2",
    //centerPadding: "60px",
    // centerPadding: '40px',
    slidesToShow: 3,
    swipeToSlide: true,
    // rtl: false, // this.props.internationalization.rtl,
    // rtl: this.props.internationalization.rtl,
    // adaptiveHeight: true,
    // slidesToScroll: 1,

    speed: 100 // 200, // 200,
    // touchThreshold: 100000000,
    // useCSS: false,
    // useTransform: false,

    // swipe: false,
    // initialSlide: 5,
    // beforeChange: () => this.dragging = true,
    // afterChange: () => this.dragging = false,
  };

  fetchBookByWriter_writerId!: string;
  fetchBookByWriter_current_book_id!: string;

  componentDidMount() {
    this._bookService.setToken(this.props.token);
    this.fetchAllData();
  }

  fetchAllData() {
    this.fetchNewestBook();

    if (this.props.logged_in_user) {
      this.fetchRecomendedBook();

      if (
        this.props.logged_in_user.person &&
        this.props.logged_in_user.person.current_book &&
        this.props.logged_in_user.person.current_book.roles &&
        this.props.logged_in_user.person.current_book.roles.length
      ) {
        let writerList = this.props.logged_in_user.person.current_book.roles.filter(
          r => r.role === BOOK_ROLES.Writer
        );
        if (writerList.length) {
          const writerId = writerList[0].person.id;
          this.fetchBookByWriter_writerId = writerId;

          const current_book_id = this.props.logged_in_user.person.current_book.id;
          this.fetchBookByWriter_current_book_id = current_book_id;

          this.fetchBookByWriter(writerId, current_book_id);
        }
      }
    }
  }

  gotoBookDetail(bookId: string) {
    this.props.history.push(`book-detail/${bookId}`);
  }
  // getRandomHelenBookUrl(): string {
  //   let r = Math.floor(Math.random() * 9) + 1;
  //   return `/static/media/img/sample-book/sample-book-h${r}.png`;
  // }
  // getRandomBookUrl(): string {
  //   let r = Math.floor(Math.random() * 12) + 1;
  //   return `/static/media/img/sample-book/sample-book${r}.png`;
  // }

  readNow() {
    debugger;
  }

  async fetchRecomendedBook() {
    this.setState({ ...this.state, recomendedBookError: undefined });

    let res = await this._bookService.recomended().catch(error => {
      let errorMsg = this.handleError({ error: error.response, notify: false });
      this.setState({ ...this.state, recomendedBookError: errorMsg.body });
    });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, recomendedBookList: res.data.result });
      }
    }
  }

  async fetchNewestBook() {
    this.setState({ ...this.state, newReleaseBookError: undefined });

    let res = await this._bookService.newest().catch(error => {
      // this.handleError({ error: error.response });

      let errorMsg = this.handleError({ error: error.response, notify: false });
      this.setState({ ...this.state, newReleaseBookError: errorMsg.body });
    });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, newReleaseBookList: res.data.result });
      }
    }
  }

  async fetchBookByWriter(person_id: string, book_id: string) {
    this.setState({ ...this.state, byWriterBookError: undefined });

    let res = await this._bookService
      .bookByWriter({ writer: person_id, book_id: book_id })
      .catch(error => {
        // this.handleError({ error: error.response });
        let errorMsg = this.handleError({
          error: error.response,
          notify: false
        });
        this.setState({ ...this.state, byWriterBookError: errorMsg.body });
      });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, byWriterBookList: res.data.result });
      }
    }
  }

  carousel_render(bookList: IBook[]) {
    if (bookList && bookList.length) {

      let initialSlide = 0;
      if (this.props.internationalization.rtl) {
        initialSlide = bookList.length - 1 - 2;
        bookList = [...bookList].reverse();
      }

      // bookList = bookList.slice(bookList.length - 1, bookList.length);

      return (
        <>
          <div className="app-carousel"
          // style={{ direction: "ltr" }}
          >
            <Slider {...this.sliderSetting} initialSlide={initialSlide}>
              {bookList.map((book: IBook, bookIndex) => (
                <div
                  key={bookIndex}
                  className="item"
                  onClick={() => this.gotoBookDetail(book.id)}
                >
                  <img
                    src={
                      (book.images && this.getImageUrl(book.images[0])) ||
                      this.defaultBookImagePath
                    }
                    alt="book"
                    onError={e => this.bookImageOnError(e)}
                  />
                  <span className="item-number">{bookIndex}</span>
                </div>
              ))}
            </Slider>
          </div>
        </>
      );
    }
  }

  currentBook_render() {
    // let aa: any = this.props.logged_in_user;
    if (!this.props.logged_in_user) {
      return;
    }

    // let current_book: IBook = aa.current_book;
    let current_book =
      this.props.logged_in_user &&
      this.props.logged_in_user.person &&
      this.props.logged_in_user.person.current_book;

    if (!current_book) {
      return;
    }

    let current_book_img =
      (current_book.images && current_book.images.length && this.getImageUrl(current_book.images[0]))
      ||
      this.defaultBookImagePath;
    let writerList = current_book.roles.filter(
      r => r.role === BOOK_ROLES.Writer
    );

    let name = writerList && writerList.length && writerList[0].person.name;
    let last_name =
      writerList && writerList.length && writerList[0].person.last_name;
    let writerName = name + " " + last_name;
    return (
      <>
        <div className="latestBook-wrapper row mt-3">
          <div className="col-4 book-img-wrapper">
            <img className="" src={current_book_img} alt="book" onError={e => this.bookImageOnError(e)} />
            <div className="book-progress-state">
              <div className="bp-state-number">
                <div className="text">7%</div>
              </div>
              <div className="bp-state-arrow" />
            </div>
            <div className="book-download">
              <i className="fa fa-check" />
            </div>
          </div>
          <div className="col-8 book-detail-wrapper p-align-0">
            <h6 className="title">{current_book.title}</h6>
            {/* <h6 className="more">parts 1,2,3</h6> */}
            <div className="writer text-muted mb-2 mt-1">
              <small>{writerName}</small>
            </div>

            <Dropdown as={ButtonGroup} className="book-btns">
              <Button
                variant="dark"
                className="btn-read-now"
                onClick={() => this.readNow()}
              >
                {Localization.read_now}
              </Button>

              <Dropdown.Toggle
                split
                variant="light"
                className="ml-2"
                id="dropdown-split-basic"
              >
                <i className="fa fa-ellipsis-v" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to={`/book-detail/${current_book.id}`}>
                  {/* {Localization.view_in_store} */}
                  {/* <NavLink to={`/book-detail/${current_book.id}`} > */}
                    {Localization.view_detail}
                  {/* </NavLink> */}
                </Dropdown.Item>
                <Dropdown.Item>{Localization.add_to_collection}</Dropdown.Item>
                <Dropdown.Item>{Localization.mark_as_read}</Dropdown.Item>
                {/* <Dropdown.Item>{Localization.share_progress}</Dropdown.Item> */}
                {/* <Dropdown.Item>
                  {Localization.recommend_this_book}
                </Dropdown.Item> */}
                {/* <Dropdown.Item>{Localization.remove_from_device}</Dropdown.Item> */}
                <Dropdown.Item>{Localization.remove_from_home}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="latestBook-divider">
          <hr />
          <div className="slash">{'//'}</div>
        </div>
      </>
    );
  }

  recomendedBook_render() {
    if (!this.props.logged_in_user) {
      return;
    }
    if (this.state.recomendedBookList && (this.state.recomendedBookList! || []).length) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.recomended_for_you}</h6>
            {this.carousel_render(this.state.recomendedBookList!)}
          </div>
        </>
      );
    } else if (this.state.recomendedBookList && !(this.state.recomendedBookList! || []).length) {
      return;

    } else if (this.state.recomendedBookError) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.recomended_for_you}</h6>
            <div>{this.state.recomendedBookError}</div>
            <div onClick={() => this.fetchRecomendedBook()}>
              {Localization.retry}
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.recomended_for_you}</h6>
            <div>{Localization.loading_with_dots}</div>
          </div>
        </>
      );
    }
  }

  newReleaseBook_render() {
    if (this.state.newReleaseBookList && (this.state.newReleaseBookList! || []).length) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.new_release_in_bookstore}</h6>
            {this.carousel_render(this.state.newReleaseBookList!)}
          </div>
        </>
      );
    } else if (this.state.newReleaseBookList && !(this.state.newReleaseBookList! || []).length) {
      return;

    } else if (this.state.newReleaseBookError) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.new_release_in_bookstore}</h6>
            <div>{this.state.newReleaseBookError}</div>
            <div onClick={() => this.fetchNewestBook()}>{Localization.retry}</div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">{Localization.new_release_in_bookstore}</h6>
            <div>{Localization.loading_with_dots}</div>
          </div>
        </>
      );
    }
  }

  byWriterBook_render() {
    if (
      !(
        this.props.logged_in_user &&
        this.props.logged_in_user.person &&
        this.props.logged_in_user.person.current_book &&
        this.props.logged_in_user.person.current_book.roles &&
        this.props.logged_in_user.person.current_book.roles.length
      )
    ) {
      return;
    }
    let writerList = this.props.logged_in_user.person.current_book.roles.filter(
      r => r.role === BOOK_ROLES.Writer
    );
    if (!writerList.length) {
      return;
    }

    let writerFullName =
      writerList[0].person.name + " " + writerList[0].person.last_name;

    if (this.state.byWriterBookList && (this.state.byWriterBookList! || []).length) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                writerFullName
              )}
            </h6>
            {this.carousel_render(this.state.byWriterBookList!)}
          </div>
        </>
      );
    } else if (this.state.byWriterBookList && !(this.state.byWriterBookList! || []).length) {
      return;

    } else if (this.state.byWriterBookError) {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                writerFullName
              )}
            </h6>
            <div>{this.state.byWriterBookError}</div>
            <div onClick={() =>
              this.fetchBookByWriter(
                this.fetchBookByWriter_writerId,
                this.fetchBookByWriter_current_book_id)}>{Localization.retry}</div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                writerFullName
              )}
            </h6>
            <div>{Localization.loading_with_dots}</div>
          </div>
        </>
      );
    }
  }

  render() {
    return (
      <>
        {this.currentBook_render()}

        <div className="booklistCategory-wrapper mt-3">
          {this.recomendedBook_render()}

          {this.newReleaseBook_render()}

          {this.byWriterBook_render()}
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

export const Dashboard = connect(
  state2props,
  dispatch2props
)(DashboardComponent);
