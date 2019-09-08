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
import { Dropdown } from "react-bootstrap";
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

class ReaderOverviewComponent extends BaseComponent<IProps, IState> {
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
    className: "center",
    centerMode: true,
    // infinite: true,
    centerPadding: "60px", // 4rem, 60px
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

  overview_header_render() {
    return (
      <div className="overview-header">
        <div className="row">
          <div className="col-12">
            <div className="icon-wrapper">
              <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer"
                onClick={() => this.goBack()}
              ></i>

              <i className="fa fa-bars text-dark p-2 cursor-pointer"></i>

              <div className="float-right">
                <i className="fa fa-search text-dark p-2 cursor-pointer"></i>
                <i className="fa fa-font text-dark p-2 cursor-pointer"></i>
                <i className="fa fa-file-text-o text-dark p-2 cursor-pointer"></i>
                <i className="fa fa-bookmark-o text-dark p-2 cursor-pointer"></i>

                <Dropdown className="d-inline-block menu-dd">
                  <Dropdown.Toggle
                    as="i"
                    id="dropdown-collection-menu"
                    className="icon fa fa-ellipsis-v text-dark p-2 no-default-icon">
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-right border-0 rounded-0 shadow2">

                    <Dropdown.Item
                      className="text-capitalize"
                    >
                      {Localization.share_progress}
                    </Dropdown.Item>

                    {/* <Dropdown.Item
                    as={NavLink}
                    to={`/collection-update/${this.collectionTitle}`}
                    className="text-capitalize"
                  >{Localization.add_to_collection}</Dropdown.Item>
                  <Dropdown.Item
                    className="text-capitalize"
                    onClick={() => this.openModal_downloadCollection()}
                  >{Localization.download_collection}</Dropdown.Item> */}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  getBookTitle(): string {
    const book: IBook | undefined = this.state.book;
    if (!book) return '';
    return book!.title;
  }

  overview_body_render() {
    return (
      <>
        <div className="overview-body my-3--">
          <h5 className="book-title mt-3 text-center">{this.getBookTitle()}</h5>

          {this.carousel_render()}

          <div className="page-location text-center">location 477 of 4436 . 11%</div>
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
                  <div className="item">
                    <div className="page-img-wrapper">
                      <img
                        className="page-img"
                        src={`/static/media/img/sample-book-page/page-${pageIndex + 1}.jpg`}
                        alt="book"
                      />
                    </div>
                    <div className="page-number">456</div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </>
      );
    }
  }

  overview_footer_render() {
    return (
      <>
        <div className="overview-footer">
          <div className="change-view">
            <i className="fa fa-th p-2 cursor-pointer"
              onClick={() => { }}
            ></i>
          </div>
          <div className="slider">slider</div>
          <div className="audio">
            <i className="fa fa-headphones p-2 cursor-pointer"
              onClick={() => { }}
            ></i>
          </div>
        </div>
      </>
    )
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
            <div className="reader-overview-wrapper mt-3-- mb-5--">
              {this.overview_header_render()}
              {this.overview_body_render()}
              {this.overview_footer_render()}
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

export const ReaderOverview = connect(state2props, dispatch2props)(ReaderOverviewComponent);
