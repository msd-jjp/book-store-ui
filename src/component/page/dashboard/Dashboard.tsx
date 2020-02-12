import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
// import Slider, { Settings } from "react-slick";
import { Localization } from "../../../config/localization/localization";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { History } from "history";
import { IBook } from "../../../model/model.book";
import { BookService } from "../../../service/service.book";
import { ToastContainer } from "react-toastify";
import { BOOK_ROLES, BOOK_TYPES } from "../../../enum/Book";
import { NavLink } from "react-router-dom";
import { AddToCollection } from "../library/collection/add-to-collection/AddToCollection";
import { CmpUtility } from "../../_base/CmpUtility";
import { action_user_logged_in } from "../../../redux/action/user";
import { PersonService } from "../../../service/service.person";
import {
  calc_read_percent, is_book_downloaded,
  is_book_downloading, markAsRead_libraryItem, getLibraryItem,
  book_downloading_progress, book_download_size, markAsUnRead_libraryItem,
  start_download_book, stop_download_book
} from "../library/libraryViewTemplate";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import Swiper from "swiper";
import { Utility } from "../../../asset/script/utility";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  onUserLoggedIn: (user: IUser) => void;
  library: ILibrary_schema;
  network_status: NETWORK_STATUS;
}

interface IState {
  recomendedBookList: IBook[] | undefined;
  recomendedBookError: string | undefined;
  newReleaseBookList: IBook[] | undefined;
  newReleaseBookError: string | undefined;
  byWriterBookList: IBook[] | undefined;
  byWriterBookError: string | undefined;
  modal_addToCollections: {
    show: boolean;
  };
  // removeFromHome_loader: boolean;
}

class DashboardComponent extends BaseComponent<IProps, IState> {
  state = {
    recomendedBookList: undefined,
    recomendedBookError: undefined,
    newReleaseBookList: undefined,
    newReleaseBookError: undefined,
    byWriterBookList: undefined,
    byWriterBookError: undefined,
    modal_addToCollections: {
      show: false,
      // createCollection_loader: false,
      // addToCollections_loader: false,
      // newCollectionTitle: {
      //   value: undefined,
      //   isValid: false,
      // }
    },
    // removeFromHome_loader: false,
  };
  private _bookService = new BookService();
  private _personService = new PersonService();
  // dragging!: boolean;
  // sliderSetting: Settings = {
  //   dots: false,
  //   accessibility: false,
  //   // swipe: false,
  //   infinite: false,
  //   // className: "center2",
  //   //centerPadding: "60px",
  //   // centerPadding: '40px',
  //   slidesToShow: 3,
  //   swipeToSlide: true,
  //   // rtl: false, // this.props.internationalization.rtl,
  //   // rtl: this.props.internationalization.rtl,
  //   // adaptiveHeight: true,
  //   // slidesToScroll: 1,

  //   speed: 100 // 200, // 200,
  //   // touchThreshold: 100000000,
  //   // useCSS: false,
  //   // useTransform: false,

  //   // swipe: false,
  //   // initialSlide: 5,
  //   // beforeChange: () => this.dragging = true,
  //   // afterChange: () => this.dragging = false,
  // };

  fetchBookByWriter_writerId!: string;
  fetchBookByWriter_current_book_id!: string;

  componentDidMount() {
    this.init_swiper();
    this.fetchAllData();
  }

  private swiper_obj: Swiper[] | Swiper | undefined;
  private init_swiper() {
    this.swiper_obj = new Swiper('.swiper-container', {
      spaceBetween: 8,
      slidesPerView: 3,
      freeMode: true,
      on: {
        tap: () => {
          // console.log('tap');
          // this.onSlideClicked();
          this.onSwiperTaped();
        },
        // init: () => {
        //   debugger;
        //   // return;
        //   setTimeout(() => {
        //     let fvd = this.swiper_obj;
        //     debugger;
        //     if (!this.swiper_obj) return;
        //     if (Array.isArray(this.swiper_obj)) {
        //       this.swiper_obj.forEach(sw => {
        //         // (sw as any).resizeReInit = false;
        //         (sw as any).resize.resizeHandler = undefined;
        //         (sw as any).resize.orientationChangeHandler = undefined;
        //       });
        //     } else {
        //       // (this.swiper_obj as any).resizeReInit = false;
        //       (this.swiper_obj as any).resize.resizeHandler = undefined;
        //       (this.swiper_obj as any).resize.orientationChangeHandler = undefined;
        //     }
        //   }, 500);
        // },

        // resize: () => {
        //   let fvd = this.swiper_obj;
        //   debugger;
        //   if (!this.swiper_obj) return;
        //   if (Array.isArray(this.swiper_obj)) {
        //     this.swiper_obj.forEach(sw => {
        //       sw.detachEvents();
        //     });
        //   } else {
        //     this.swiper_obj.detachEvents();
        //   }
        // }
      }
    });
  }
  private reinit_swiper() {
    if (!this.swiper_obj) return;
    if (Array.isArray(this.swiper_obj)) {
      this.swiper_obj.forEach(sw => {
        sw.update();
      });
    } else {
      this.swiper_obj.update();
    }
  }
  private swiperTaped = false;
  async onSwiperTaped() {
    this.swiperTaped = true;
    await CmpUtility.waitOnMe(50);
    this.swiperTaped = false;
    // setTimeout(() => { this.swiperTaped = false; }, 50);
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

  async gotoBookDetail(bookId: string) {
    await CmpUtility.waitOnMe(10);
    if (!this.swiperTaped) return;
    this.props.history.push(`book-detail/${bookId}`);
  }

  async fetchRecomendedBook() {
    this.setState({ ...this.state, recomendedBookError: undefined }, () => { this.reinit_swiper() });

    let res = await this._bookService.recomended().catch(error => {
      let errorMsg = this.handleError({ error: error.response, notify: false });
      this.setState({ ...this.state, recomendedBookError: errorMsg.body }, () => { this.reinit_swiper() });
    });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, recomendedBookList: res.data.result }, () => { this.reinit_swiper() });
      }
    }
  }

  async fetchNewestBook() {
    this.setState({ ...this.state, newReleaseBookError: undefined }, () => { this.reinit_swiper() });

    let res = await this._bookService.newest().catch(error => {
      let errorMsg = this.handleError({ error: error.response, notify: false });
      this.setState({ ...this.state, newReleaseBookError: errorMsg.body }, () => { this.reinit_swiper() });
    });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, newReleaseBookList: res.data.result }, () => { this.reinit_swiper() });
      }
    }
  }

  async fetchBookByWriter(person_id: string, book_id: string) {
    this.setState({ ...this.state, byWriterBookError: undefined }, () => { this.reinit_swiper() });

    let res = await this._bookService
      .bookByWriter({ writer: person_id, book_id: book_id }) // writer || person_id
      .catch(error => {
        // this.handleError({ error: error.response });
        let errorMsg = this.handleError({
          error: error.response,
          notify: false
        });
        this.setState({ ...this.state, byWriterBookError: errorMsg.body }, () => { this.reinit_swiper() });
      });
    // debugger;
    if (res) {
      if (res.data.result /* && res.data.result.length */) {
        this.setState({ ...this.state, byWriterBookList: res.data.result }, () => { this.reinit_swiper() });
      }
    }
  }

  currentBook_render(): JSX.Element {
    if (!this.props.logged_in_user) { return <></>; }

    let current_book = this.props.logged_in_user.person && this.props.logged_in_user.person.current_book;
    if (!current_book) {
      return (
        this.currentBook_empty_render()
      )
    }

    const is_downloaded = is_book_downloaded(current_book!.id, true);
    // const is_downloading = is_book_downloading(current_book!.id, true);
    const is_downloading = is_downloaded ? false : is_book_downloading(current_book!.id, true);
    const downloading_progress = is_downloading ? book_downloading_progress(current_book!.id, true) : '';
    // const downloading_progress_str = (downloading_progress || downloading_progress === 0) ? downloading_progress : '';
    const download_size = is_downloading ? book_download_size(current_book!.id, true) : '';
    const download_size_str = (download_size || download_size === 0) ? Utility.byteFileSize(download_size) : '';

    const current_book_img = CmpUtility.getBook_firstImg(current_book);
    const firstWriterFullName = CmpUtility.getBook_role_fisrt_fullName(current_book, BOOK_ROLES.Writer);
    const read_percent = this.calc_read_percent_by_bookItem_in_lib(current_book.id);

    const libItem = getLibraryItem(current_book.id);
    let is_read = false;
    if (libItem) is_read = libItem.status.is_read;

    return (
      <>
        <div className="latestBook-wrapper row mt-3">
          <div className="col-4">
            <div className="book-img-wrapper">
              <div className="img-scaffolding-container cursor-pointer"
                onClick={() => {
                  if (is_downloading) return;
                  this.before_gotoReader(current_book!)
                }}
              >
                <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />
                <img src={current_book_img}
                  alt="book"
                  className="main-img center-el-in-box"
                  onError={e => CmpUtility.bookImageOnError(e)}
                  loading="lazy"
                />
              </div>
              {/* <div className={"book-progress-state " + (read_percent === '100%' ? 'progress-complete' : '')}> */}
              <div className={"book-progress-state " + ((is_read || read_percent === '100%') ? 'progress-complete' : '')}>
                <div className="bp-state-number">
                  <div className="text center-el-in-box">{read_percent}</div>
                </div>
                <div className="bp-state-arrow" />
                <div className="progress-complete-label">{Localization.readed_}</div>
              </div>
              <div className="book-download">
                {
                  is_downloaded ?
                    <i className="fa fa-check-circle"></i>
                    : is_downloading ?
                      <i className="fa downloading"
                        onClick={() => {
                          if (!is_downloading) return;
                          stop_download_book(current_book!.id, true)
                        }}
                      >{downloading_progress}<small>%</small></i>
                      : ''
                }
              </div>
            </div>
          </div>
          <div className="col-8 book-detail-wrapper p-align-0">
            <h6 className="title">{current_book.title}</h6>
            {/* <h6 className="more">parts 1,2,3</h6> */}
            <div className="writer text-muted mb-2 mt-1">
              <small>{firstWriterFullName}</small>
            </div>

            <Dropdown as={ButtonGroup} className="book-btns">
              <Button
                variant="dark"
                className="btn-read-now"
                disabled={this.props.network_status === NETWORK_STATUS.OFFLINE && !is_downloaded}
                onClick={() => {
                  if (is_downloading) return;
                  this.before_gotoReader(current_book!)
                }}
              >
                {
                  is_downloaded ? Localization.read_now
                    : is_downloading ? Localization.downloading
                      : Localization.download
                }
                {
                  this.props.network_status === NETWORK_STATUS.OFFLINE && !is_downloaded
                    ? <i className="fa fa-wifi text-danger"></i> : ''
                }
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
                  {/* Localization.view_detail */}
                  {Localization.view_in_store}
                  {/* </NavLink> */}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => this.openModal_addToCollections(/* current_book!.id */)}
                  disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                >
                  {Localization.add_to_collection}
                  {
                    this.props.network_status === NETWORK_STATUS.OFFLINE
                      ? <i className="fa fa-wifi text-danger"></i> : ''
                  }
                </Dropdown.Item>
                <Dropdown.Item
                  className={(is_read ? 'd-none' : '')}
                  onClick={() => markAsRead_libraryItem(current_book!.id)}
                  disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                >
                  {Localization.mark_as_read}
                  {
                    this.props.network_status === NETWORK_STATUS.OFFLINE
                      ? <i className="fa fa-wifi text-danger"></i> : ''
                  }
                </Dropdown.Item>
                <Dropdown.Item
                  className={(!is_read ? 'd-none' : '')}
                  onClick={() => markAsUnRead_libraryItem(current_book!.id)}
                  disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                >
                  {Localization.mark_as_unRead}
                  {
                    this.props.network_status === NETWORK_STATUS.OFFLINE
                      ? <i className="fa fa-wifi text-danger"></i> : ''
                  }
                </Dropdown.Item>
                <Dropdown.Item disabled>{Localization.share_progress}</Dropdown.Item>
                <Dropdown.Item disabled>
                  {Localization.recommend_this_book}
                </Dropdown.Item>
                <Dropdown.Item
                  className={(is_downloaded ? '' : 'd-none')}
                  onClick={() => this.removeFromDevice(current_book!.id)}>
                  {Localization.remove_from_device}
                </Dropdown.Item>
                <Dropdown.Item
                  // className={(this.state.removeFromHome_loader ? 'opacity-5 ' : '')}
                  // disabled={this.state.removeFromHome_loader}
                  onClick={() => this.removeBookFrom_home()}
                >{
                    // !this.state.removeFromHome_loader ?
                    Localization.remove_from_home
                    // :
                    // <i className="fa fa-spinner fa-spin"></i>
                  }</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <div className={"mt-2 " + (!download_size_str ? 'd-none' : '')}>
              <span className={"book-volume small "}>{download_size_str}</span>
            </div>

          </div>
        </div>

        {this.currentBook_divider_render()}
      </>
    );
  }

  currentBook_empty_render() {
    return (
      <>
        <div className="row mt-5 text-center">
          <div className="col-12 ">
            <h6 className="title text-capitalize mb-3">{Localization.book_from_your_library}</h6>
          </div>
          <div className="col-12">
            <p className="text-capitalize">{Localization.your_recent_item_appear_manage_remove}</p>
          </div>
          <div className="col-12">
            <NavLink to={`/library`} className="text-uppercase" >
              {Localization.go_to_library}
            </NavLink>
          </div>
        </div>

        {this.currentBook_divider_render()}
      </>
    )
  }

  currentBook_divider_render() {
    return (
      <>
        <div className="latestBook-divider">
          <hr />
          <div className="slash">{'//'}</div>
        </div>
      </>
    )
  }

  before_gotoReader(book: IBook) {
    const is_downloaded = is_book_downloaded(book.id, true);
    if (!is_downloaded) {
      if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
      const is_downloading = is_downloaded ? false : is_book_downloading(book.id, true);
      if (is_downloading) return;
      start_download_book(book.id, true);
      return;
    }

    this.openBookByReader(book, this.props.history, true);
  }

  calc_read_percent_by_bookItem_in_lib(book_id: string): string {
    const item = getLibraryItem(book_id);
    if (item) return calc_read_percent(item);
    else return '0%';
  }

  removeFromDevice(book_id: string) {
    CmpUtility.removeBookFileFromDevice(book_id, true);
  }

  //#region updateUserCurrentBook
  async removeBookFrom_home() {
    this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
  }

  updateUserCurrentBook_client() {
    //todo: update anonymous user??
    if (!this.props.logged_in_user) return;
    
    let logged_in_user = { ...this.props.logged_in_user };
    if (!logged_in_user) return;
    logged_in_user.person.current_book = undefined;
    this.props.onUserLoggedIn(logged_in_user);
  }

  async updateUserCurrentBook_server() {
    //todo: update anonymous user??
    if (!this.props.logged_in_user) return;

    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
    // this.setState({ ...this.state, removeFromHome_loader: true });
    await this._personService.update(
      { current_book_id: null },
      this.props.logged_in_user.person.id
    ).catch(e => {
      // this.handleError({ error: e.response });
    });
    // this.setState({ ...this.state, removeFromHome_loader: false });
  }
  //#endregion

  openModal_addToCollections(/* book_id: string */) {
    this.setState({ ...this.state, modal_addToCollections: { ...this.state.modal_addToCollections, show: true } });
  }

  closeModal_addToCollections() {
    this.setState({ ...this.state, modal_addToCollections: { ...this.state.modal_addToCollections, show: false } });
  }

  carousel_render(bookList: IBook[]) {
    if (bookList && bookList.length) {

      return (
        <>
          <div className="app-swiper">
            <div className="swiper-container" dir={this.props.internationalization.rtl ? 'rtl' : ''}>
              <div className="swiper-wrapper">
                {bookList.map((book: IBook, bookIndex) => (
                  <div
                    key={bookIndex}
                    className="swiper-slide"
                    onClick={() => this.gotoBookDetail(book.id)}
                  >
                    <div className="img-scaffolding-container">
                      <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />

                      <img src={CmpUtility.getBook_firstImg(book)}
                        alt="book"
                        className="main-img center-el-in-box"
                        onError={e => CmpUtility.bookImageOnError(e)}
                        loading="lazy"
                      />
                    </div>

                    <img src={CmpUtility.getBookTypeIconUrl(book.type as BOOK_TYPES)}
                      className="book-type-icon"
                      loading="lazy"
                      title={Localization.book_type_list[book.type as BOOK_TYPES]}
                      alt={Localization.book_type_list[book.type as BOOK_TYPES]}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  carousel_render_preLoad(slideCount: number = 3) {
    let list = [];
    for (let i = 0; i < slideCount; i++) { list.push(i); }

    return (
      <>
        <div className="app-swiper app-swiper-preLoad">
          <div className="swiper-container" dir={this.props.internationalization.rtl ? 'rtl' : ''}>
            <div className="swiper-wrapper">
              {list.map((_no: number, bookIndex) => (
                <div key={bookIndex} className="swiper-slide">
                  <div className="img-scaffolding-container">
                    <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />
                  </div>
                  <span className="item-loader-wrapper center-el-in-box">
                    <div className="spinner-grow item-loader">
                      <span className="sr-only">{Localization.loading_with_dots}</span>
                    </div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  carousel_render_error(errorMsg: string, onClick: () => void) {
    return (
      <>
        <div className="app-swiper app-swiper-error min-h-100px">
          <div className="swiper-container" dir={this.props.internationalization.rtl ? 'rtl' : ''}>
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <div className="img-scaffolding-container bg-transparent">
                  <img src={CmpUtility.bookSizeImagePath} className="img-scaffolding" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="error-box center-el-in-box text-center">
            <div className="mb-2">{errorMsg}</div>
            <div onClick={() => onClick()} className="cursor-pointer">
              {Localization.retry} <i className="fa fa-refresh"></i>
            </div>
          </div>
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
          <div className="booklist-wrapper mt-3--">
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
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">{Localization.recomended_for_you}</h6>
            {this.carousel_render_error(
              this.state.recomendedBookError!,
              () => this.fetchRecomendedBook()
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">{Localization.recomended_for_you}</h6>
            {this.carousel_render_preLoad()}
          </div>
        </>
      );
    }
  }

  newReleaseBook_render() {
    if (this.state.newReleaseBookList && (this.state.newReleaseBookList! || []).length) {
      return (
        <>
          <div className="booklist-wrapper mt-3--">
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
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">{Localization.new_release_in_bookstore}</h6>
            {/* <div>{this.state.newReleaseBookError}</div> */}
            {/* <div onClick={() => this.fetchNewestBook()}>{Localization.retry}</div> */}
            {this.carousel_render_error(
              this.state.newReleaseBookError!,
              () => this.fetchNewestBook()
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">{Localization.new_release_in_bookstore}</h6>
            {/* <div>{Localization.loading_with_dots}</div> */}
            {this.carousel_render_preLoad()}
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

    // let writerFullName =
    // writerList[0].person.name + " " + writerList[0].person.last_name;
    const firstWriterFullName = CmpUtility.getBook_role_fisrt_fullName(
      this.props.logged_in_user.person.current_book,
      BOOK_ROLES.Writer
    );

    if (this.state.byWriterBookList && (this.state.byWriterBookList! || []).length) {
      return (
        <>
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                firstWriterFullName
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
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                firstWriterFullName
              )}
            </h6>
            {this.carousel_render_error(this.state.byWriterBookError!, () => {
              this.fetchBookByWriter(this.fetchBookByWriter_writerId, this.fetchBookByWriter_current_book_id)
            })}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="booklist-wrapper mt-3--">
            <h6 className="title">
              {Localization.formatString(
                Localization.more_by_writer,
                firstWriterFullName
              )}
            </h6>
            {this.carousel_render_preLoad()}
          </div>
        </>
      );
    }
  }

  render() {
    const current_book =
      this.props.logged_in_user &&
      this.props.logged_in_user.person &&
      this.props.logged_in_user.person.current_book;

    return (
      <>
        {this.currentBook_render()}

        <div className="booklistCategory-wrapper mt-3-- mt-n2">
          {this.recomendedBook_render()}

          {this.newReleaseBook_render()}

          {this.byWriterBook_render()}
        </div>

        {
          current_book ?
            <AddToCollection
              show={this.state.modal_addToCollections.show}
              book={current_book}
              onHide={() => this.closeModal_addToCollections()}
            />
            : ''
        }

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
    // token: state.token,
    library: state.library,
    network_status: state.network_status,
  };
};

export const Dashboard = connect(
  state2props,
  dispatch2props
)(DashboardComponent);
