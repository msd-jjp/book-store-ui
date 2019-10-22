import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
// import { IToken } from "../../../model/model.token";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { Localization } from "../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
// import { Dropdown } from "react-bootstrap";
import { IBook } from "../../../model/model.book";
// import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
// import Slider, { Settings } from "react-slick";
import Swiper from 'swiper';
import { Virtual } from 'swiper/dist/js/swiper.esm';
import { Store2 } from "../../../redux/store";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { book, IBookPosIndicator } from "../../../webworker/reader-engine/MsdBook";
import { getFont } from "../../../webworker/reader-engine/tools";
// import { CmpUtility } from "../../_base/CmpUtility";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { action_update_reader } from "../../../redux/action/reader";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  // token: IToken;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
  match: any;
  // library: ILibrary_schema;
}

interface IState {
  book: IBook | undefined;
  virtualData: {
    slides: any[];
  };
  page_loading: boolean;
}

class ReaderReadingComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined, // this.getBookFromLibrary(this.book_id),
    virtualData: {
      slides: [],
    },
    page_loading: true,
  };

  private _personService = new PersonService();
  // sliderSetting: Settings = {
  //   dots: false,
  //   accessibility: false,
  //   // swipe: false,
  //   infinite: false,
  //   // className: "center2",
  //   //centerPadding: "60px",
  //   // centerPadding: '40px',
  //   slidesToShow: 1,
  //   swipeToSlide: true,
  //   // rtl: false, // this.props.internationalization.rtl,
  //   // rtl: this.props.internationalization.rtl,
  //   // adaptiveHeight: true,
  //   // slidesToScroll: 1,

  //   speed: 100, // 200, // 200,
  //   // touchThreshold: 100000000,
  //   // useCSS: false,
  //   // useTransform: false,

  //   // swipe: false,
  //   // initialSlide: 5,
  //   // beforeChange: () => this.dragging = true,
  //   // afterChange: () => this.dragging = false,
  //   // lazyLoad: true,
  //   // className: "center",
  //   // centerMode: true,
  //   // infinite: true,
  //   // centerPadding: "60px", // 4rem, 60px
  // };
  swiper_obj: Swiper | undefined;
  private book_page_length = 1; // 2500;
  private book_active_page = 1; // 372;

  constructor(props: IProps) {
    super(props);

    // this._personService.setToken(this.props.token);
    this.book_id = this.props.match.params.bookId;
  }

  componentDidMount() {
    this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
    this.initSwiper();
  }

  updateUserCurrentBook_client() {
    const book = this.getBookFromLibrary(this.book_id);
    this.setState({ ...this.state, book: book });

    let logged_in_user = { ...this.props.logged_in_user! };
    if (logged_in_user.person.current_book && logged_in_user.person.current_book.id === this.book_id) {
      return;
    }
    logged_in_user.person.current_book = book;
    this.props.onUserLoggedIn(logged_in_user);
  }

  getBookFromLibrary(book_id: string): IBook {
    // const lib = this.props.library.data.find(lib => lib.book.id === book_id);
    const lib = Store2.getState().library.data.find(lib => lib.book.id === book_id);
    return (lib! || {}).book;
  }

  async updateUserCurrentBook_server() {
    if (!this.book_id) return;
    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
    if (this.props.logged_in_user!.person.current_book &&
      this.props.logged_in_user!.person.current_book.id === this.book_id) {
      return;
    }

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

  get_bookPageSize(): { width: number, height: number } {
    const container = document.querySelector('.swiper-container');
    if (!container) return { width: 200, height: 300 };
    return { width: container.clientWidth - 32, height: container.clientHeight - 32 - 16 };
  }

  bookFileNotFound_notify() {
    const notifyBody: string = Localization.msg.ui.book_file_not_found_download_it;
    const config: ToastOptions = { autoClose: Setup.notify.timeout.warning, onClose: this.goBack.bind(this) };
    toast.warn(notifyBody, this.getNotifyConfig(config));
  }

  readerError_notify() {
    const notifyBody: string = Localization.msg.ui.reader_epub_error_occurred;
    const config: ToastOptions = { autoClose: Setup.notify.timeout.warning, onClose: this.goBack.bind(this) };
    toast.error(notifyBody, this.getNotifyConfig(config));
  }

  // private _bookPosIndicator!: IBookPosIndicator[];
  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  async initSwiper() {
    const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
    if (!bookFile) {
      this.bookFileNotFound_notify();
      // CmpUtility.waitOnMe(100);
      // this.goBack();
      return;
    }

    try {
      await this.createBook(bookFile);
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      this.readerError_notify();
      return;
    }

    const bookPosList: IBookPosIndicator[] = this._bookInstance.getListOfPageIndicators();

    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    this.book_active_page = 1;
    /** active page & more before and after of it */
    this.getPagePath(this.book_active_page - 1, this._slide_pages[this.book_active_page - 1].page);



    const self = this;
    // const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    // this.swiper_obj && this.swiper_obj.destroy(true, true);
    // let slides = [];
    // for (var i = 0; i < this.book_page_length; i += 1) { // 10
    //   slides.push({ name: 'Slide_' + (i + 1), id: i + 1 });
    // }
    this.swiper_obj = new Swiper('.swiper-container', {
      // ...
      virtual: {
        // slides: slides, // self.state.slides,
        slides: this._slide_pages,
        renderExternal(data: Virtual) {
          // assign virtual slides data
          self.setState({
            virtualData: data,
          });
        }
      },
      initialSlide: this.book_active_page - 1, // self.book_active_page,
      on: {
        doubleTap: function () {
          /* do something */
          console.log('doubleTap');
        },
        tap: function () {
          /* do something */
          console.log('tap');
          self.onPageClicked();
        },
        // click: function () {
        //   /* do something */
        //   console.log('click');
        // },
        slideChange: function () {
          console.log('swiperChange --> active_page_number:', self.getActivePage());
        },
        init: () => {
          this.setState({ page_loading: false });
        },
      }
    });
    // activeIndex && this.gotoIndex(activeIndex);

    // this.swiper_obj.on('touchMove', function(){
    //     console.log('touchMove');
    // })
  }

  private _bookInstance!: book;
  private async createBook(bookFile: Uint8Array) { // Uint8Array
    // debugger;
    const reader_state = { ...Store2.getState().reader };
    const reader_epub = reader_state.epub;

    const font_arrayBuffer = await getFont(`reader/fonts/${reader_epub.fontName}.ttf`); // zar | iransans | nunito
    const font = new Uint8Array(font_arrayBuffer);

    // const bookbuf = base64ToBuffer(bookFile);

    const bookPageSize = this.get_bookPageSize();
    reader_state.epub.pageSize = bookPageSize;
    Store2.dispatch(action_update_reader(reader_state));

    this._bookInstance = new book(
      bookFile, // bookbuf,
      bookPageSize.width,
      bookPageSize.height,
      font,
      reader_epub.fontSize,
      reader_epub.fontColor,
      reader_epub.bgColor
    );
    // await CmpUtility.waitOnMe(3000);
    // debugger;
  }

  getActivePage(): number {
    const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    // console.log('getActivePage:', activeIndex);
    return (activeIndex || activeIndex === 0) ? (activeIndex + 1) : this.book_active_page; //  : 0;
  }

  calc_current_read_percent(): string {
    let read = this.getActivePage();
    let total = this.book_page_length || 0;

    if (total) {
      return Math.floor(((read || 0) * 100) / +total) + '%';
    } else {
      return '0%';
    }
  }

  /**
   * todo: if last chapter --> show remain from book.
   */
  calc_current_read_timeLeft(): number {
    let read = this.getActivePage();
    let total = this.book_page_length || 0; // todo: get "active chapter" not all book.
    let min_per_page = 1;

    if (total) {
      return (total - read + 1) * min_per_page;
    } else {
      return 0;
    }
  }

  reading_body_render() {
    return (
      <>
        <div className="reading-body">
          {/* {this.carousel_render()} */}
          {this.swiper_render()}

          {/* <div className="page-location text-center">location 477 of 4436 . 11%</div> */}
        </div>
      </>
    )
  }

  getPagePathNear(pageIndex: number) {
    setTimeout(() => {
      if (pageIndex - 1 >= 0) {
        this.getPageRenderedPath(pageIndex - 1, this._slide_pages[pageIndex - 1].page);
      }
      if (pageIndex + 1 <= this._slide_pages.length - 1) {
        this.getPageRenderedPath(pageIndex + 1, this._slide_pages[pageIndex + 1].page);
      }
    });
  }
  getPagePath(pageIndex: number, slide: IBookPosIndicator) {
    console.log('getPagePath', pageIndex);
    this.getPagePathNear(pageIndex);
    return this.getPageRenderedPath(pageIndex, slide);
  }
  private _pageRenderedPath: any = {};
  private getPageRenderedPath(pageIndex: number, slide: IBookPosIndicator) {
    if (this._pageRenderedPath[pageIndex]) {
      return this._pageRenderedPath[pageIndex];
    } else {
      // if (!this._bookInstance.areWeAtEnd()) {
      // this._pageRenderedPath[pageIndex] = 'true';
      // setTimeout(() => {
      console.time('renderNextPage');
      this._pageRenderedPath[pageIndex] = this._bookInstance.RenderSpecPage(slide);
      console.timeEnd('renderNextPage');
      // }, 0)
      return this._pageRenderedPath[pageIndex];
      // } else {
      //   return;
      // }
    }
  }

  swiper_render() {
    if (true) {
      const vrtData: any = this.state.virtualData;

      let offset_dir = 'left';
      let swiper_dir = '';
      if (this.props.internationalization.rtl) {
        offset_dir = 'right';
        swiper_dir = 'rtl';
      }

      return (
        <>
          <div className="app-swiper">
            <div className="swiper-container" dir={swiper_dir}>
              <div className="swiper-wrapper">
                {vrtData.slides.map((slide: { id: number, page: IBookPosIndicator }, index: any) => (
                  <Fragment key={slide.id}>
                    <div className="swiper-slide" style={{ [offset_dir]: `${vrtData.offset}px` }}>
                      <div className="item" >
                        <div className="page-img-wrapper">
                          <img
                            className="page-img"
                            // src={`/static/media/img/sample-book-page/page-${slide.id}.jpg`}
                            src={this.getPagePath(slide.id, slide.page)}
                            alt="book"
                            loading="lazy"
                          />
                        </div>
                        <div className="item-footer">
                          <div>{Localization.formatString(Localization.n_min_left_in_chapter, this.calc_current_read_timeLeft())}</div>
                          <div>{this.calc_current_read_percent()}</div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  // carousel_render_DELETE_ME() {
  //   if (true) {

  //     let initialSlide = 0;
  //     if (this.props.internationalization.rtl) {
  //       // initialSlide = bookList.length - 1 - 2;
  //       // bookList = [...bookList].reverse();
  //     }

  //     return (
  //       <>
  //         <div className="app-carousel">
  //           <Slider {...this.sliderSetting} initialSlide={initialSlide}>
  //             {[1, 2, 3, 4, 5, 6, 7, 8].map((page, pageIndex) => (
  //               <div
  //                 key={pageIndex}
  //                 className="item-wrapper"
  //               // onClick={() => this.gotoBookDetail(book.id)}
  //               >
  //                 <div className="item" onClick={() => this.onPageClicked()}>
  //                   <div className="page-img-wrapper">
  //                     <img
  //                       className="page-img"
  //                       src={`/static/media/img/sample-book-page/page-${pageIndex + 1}.jpg`}
  //                       alt="book"
  //                     />
  //                   </div>
  //                   <div className="item-footer">
  //                     <div>{Localization.formatString(Localization.n_min_left_in_chapter, 2)}</div>
  //                     <div>15%</div>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))}
  //           </Slider>
  //         </div>
  //       </>
  //     );
  //   }
  // }

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
              <ContentLoader gutterClassName="gutter-0" show={this.state.page_loading}></ContentLoader>
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
    // token: state.token,
    network_status: state.network_status,
    // library: state.library,
  };
};

export const ReaderReading = connect(state2props, dispatch2props)(ReaderReadingComponent);
