import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../../model/model.token";
import { ToastContainer } from "react-toastify";
import { Localization } from "../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
// import { Dropdown } from "react-bootstrap";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
import Slider, { Settings } from "react-slick";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  token: IToken;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
  match: any;
  library: ILibrary_schema;
}

interface IState {
  book: IBook | undefined;
}

class ReaderReadingComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined, // this.getBookFromLibrary(this.book_id),
  };

  private _personService = new PersonService();
  sliderSetting: Settings = {
    dots: false,
    accessibility: false,
    // swipe: false,
    infinite: false,
    // className: "center2",
    //centerPadding: "60px",
    // centerPadding: '40px',
    slidesToShow: 1,
    swipeToSlide: true,
    // rtl: false, // this.props.internationalization.rtl,
    // rtl: this.props.internationalization.rtl,
    // adaptiveHeight: true,
    // slidesToScroll: 1,

    speed: 100, // 200, // 200,
    // touchThreshold: 100000000,
    // useCSS: false,
    // useTransform: false,

    // swipe: false,
    // initialSlide: 5,
    // beforeChange: () => this.dragging = true,
    // afterChange: () => this.dragging = false,
    // lazyLoad: true,
    // className: "center",
    // centerMode: true,
    // infinite: true,
    // centerPadding: "60px", // 4rem, 60px
  };

  constructor(props: IProps) {
    super(props);

    this._personService.setToken(this.props.token);
    this.book_id = this.props.match.params.bookId;
  }

  componentDidMount() {
    this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
  }

  updateUserCurrentBook_client() {
    let logged_in_user = { ...this.props.logged_in_user! };
    if (!logged_in_user) return;
    const book = this.getBookFromLibrary(this.book_id);
    logged_in_user.person.current_book = book;
    this.props.onUserLoggedIn(logged_in_user);

    this.setState({ ...this.state, book: this.getBookFromLibrary(this.book_id) });
  }

  getBookFromLibrary(book_id: string): IBook {
    const lib = this.props.library.data.find(lib => lib.book.id === book_id);
    return (lib! || {}).book;
  }

  async updateUserCurrentBook_server() {
    if (!this.book_id) return;
    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

    await this._personService.update(
      { current_book_id: this.book_id },
      this.props.logged_in_user!.person.id
    ).catch(e => {
      // this.handleError({ error: e.response });
    });
  }

  getBookTitle(): string {
    const book: IBook | undefined = this.state.book;
    if (!book) return '';
    return book!.title;
  }

  reading_body_render() {
    return (
      <>
        <div className="reading-body">
          {this.carousel_render()}

          {/* <div className="page-location text-center">location 477 of 4436 . 11%</div> */}
        </div>
      </>
    )
  }

  carousel_render() {
    if (true) {

      let initialSlide = 0;
      if (this.props.internationalization.rtl) {
        // initialSlide = bookList.length - 1 - 2;
        // bookList = [...bookList].reverse();
      }

      return (
        <>
          <div className="app-carousel">
            <Slider {...this.sliderSetting} initialSlide={initialSlide}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="item-wrapper"
                // onClick={() => this.gotoBookDetail(book.id)}
                >
                  <div className="item" onClick={() => this.onPageClicked()}>
                    <div className="page-img-wrapper">
                      <img
                        className="page-img"
                        src={`/static/media/img/sample-book-page/page-${pageIndex + 1}.jpg`}
                        alt="book"
                      />
                    </div>
                    <div className="item-footer">
                      <div>{Localization.formatString(Localization.n_min_left_in_chapter, 2)}</div>
                      <div>15%</div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </>
      );
    }
  }

  onPageClicked() {
    this.gotoReader_overview(this.book_id);
  }

  gotoReader_overview(book_id: string) {
    // if (this.props.history.length) {
    //   this.props.history.goBack();
    //   // this.props.history.push(`/reader/${book_id}/overview`);

    //   if(this.props.history.action === 'POP'){}
    //   this.props.history.action = 'POP';
    // }
    // this.props.history.goBack();
    // this.props.history.push(`/reader/${book_id}/overview`);
    this.props.history.replace(`/reader/${book_id}/overview`);
  }

  goBack() {
    if (this.props.history.length > 1) { this.props.history.goBack(); }
    else { this.props.history.push(`/dashboard`); }
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-12 px-0">
            <div className="reader-reading-wrapper">
              {this.reading_body_render()}
              {/* {this.reading_footer_render()} */}
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
    onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
  };
};

const state2props = (state: redux_state) => {
  return {
    logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    token: state.token,
    network_status: state.network_status,
    library: state.library,
  };
};

export const ReaderReading = connect(state2props, dispatch2props)(ReaderReadingComponent);
