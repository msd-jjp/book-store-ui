import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { Localization } from "../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
import { IBook } from "../../../model/model.book";
import Swiper from 'swiper';
import { Virtual } from 'swiper/dist/js/swiper.esm';
import { appLocalStorage } from "../../../service/appLocalStorage";
import { IBookPosIndicator } from "../../../webworker/reader-engine/MsdBook";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { ReaderUtility } from "../ReaderUtility";
import { IReader_schema } from "../../../redux/action/reader/readerAction";
import { ILibrary } from "../../../model/model.library";
import { getLibraryItem } from "../../library/libraryViewTemplate";
import { BookGenerator } from "../../../webworker/reader-engine/BookGenerator";
import { CmpUtility } from "../../_base/CmpUtility";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
  match: any;
  reader: IReader_schema;
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
  private book_active_index = 0; // 372;
  private _libraryItem: ILibrary | undefined;

  constructor(props: IProps) {
    super(props);

    this.book_id = this.props.match.params.bookId;
  }

  componentWillMount() {
    if (this.book_id) {
      this._libraryItem = getLibraryItem(this.book_id); // Store2.getState().library.data.find(lib => lib.book.id === this.book_id);
    }
  }
  componentDidMount() {
    if (!this._libraryItem) {
      this.props.history.replace(`/dashboard`);
      return;
    }

    this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
    this.generateReader();
  }

  updateUserCurrentBook_client() {
    // const book = this.getBookFromLibrary(this.book_id);
    const book = this._libraryItem!.book;
    this.setState({ ...this.state, book: book });

    let logged_in_user = { ...this.props.logged_in_user! };
    if (logged_in_user.person.current_book && logged_in_user.person.current_book.id === this.book_id) {
      return;
    }
    logged_in_user.person.current_book = book;
    this.props.onUserLoggedIn(logged_in_user);
  }

  // getBookFromLibrary(book_id: string): IBook {
  //   // const lib = this.props.library.data.find(lib => lib.book.id === book_id);
  //   const lib = Store2.getState().library.data.find(lib => lib.book.id === book_id);
  //   return (lib! || {}).book;
  // }

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

  // getBookTitle(): string {
  //   const book: IBook | undefined = this.state.book;
  //   if (!book) return '';
  //   return book!.title;
  // }

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

  private async generateReader() {
    await CmpUtility.waitOnMe(0);
    await this.createBook();
    if (!this._bookInstance) return;
    this.initSwiper();
  }

  private _bookInstance!: BookGenerator;
  private async createBook() {
    const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
    if (!bookFile) {
      this.setState({ page_loading: false });
      this.bookFileNotFound_notify();
      return;
    }

    try {
      this._bookInstance = await ReaderUtility.createEpubBook(bookFile, this.get_bookPageSize());
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      this.readerError_notify();
    }
  }

  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  private initSwiper() {
    const bookPosList: IBookPosIndicator[] = this._bookInstance.getAllPages();

    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    const progress_percent = this._libraryItem!.status.progess || 0;
    debugger;
    this.book_active_index = Math.floor(this._slide_pages.length * progress_percent - 1); // - 1;
    if (this.book_active_index > this._slide_pages.length - 1 || this.book_active_index < 0) {
      this.book_active_index = 0;
    }
    /** active page & more before and after of it */
    this.getPagePath(this.book_active_index, this._slide_pages[this.book_active_index].page);

    const renderNPages: string[] = this._bookInstance.renderNPages(bookPosList[this.book_active_index], 5);
    // const renderNPages: string[] = this._bookInstance.renderNPages(bookPosList[0], 50);
    // const book_active_page_index = this.book_active_page - 1;
    renderNPages.forEach((img, i) => {
      this._pageRenderedPath[i + this.book_active_index] = img;
    });

    this.swiper_obj = new Swiper('.swiper-container', {
      virtual: {
        slides: this._slide_pages,
        renderExternal: (data: Virtual) => {
          this.setState({
            virtualData: data,
          });
        }
      },
      initialSlide: this.book_active_index,
      on: {
        doubleTap: () => {
        },
        tap: () => {
          this.onPageClicked();
        },
        slideChange: () => {
          // console.log('swiperChange --> active_page_number:', this.getActivePage());
          console.log('swiperChange --> updateLibraryItem', this.getSwiperActiveIndex());
          this.updateLibraryItem();
        },
        init: () => {
          this.setState({ page_loading: false });
        },
      }
    });
  }

  updateLibraryItem() {
    debugger;
    const activePage = (this.getSwiperActiveIndex() + 1);
    const bookProgress = activePage / this.book_page_length;
    // console.log('updateLibraryItem_progress', bookProgress);
    ReaderUtility.updateLibraryItem_progress(this.book_id, bookProgress); //  / 100
    ReaderUtility.updateLibraryItem_progress_server(this.book_id, bookProgress);
  }
  getSwiperActiveIndex(): number {
    const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    return activeIndex || 0;
  }

  // getActivePage(): number {
  //   const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
  //   // console.log('getActivePage:', activeIndex);
  //   return (activeIndex || activeIndex === 0) ? (activeIndex + 1) : this.book_active_page; //  : 0;
  // }

  calc_activePagePos_percent(page_index: number): number {
    let activePage = page_index + 1;
    let totalPage = this.book_page_length || 0;

    if (totalPage) {
      return Math.floor(((activePage || 0) * 100) / +totalPage);
    } else {
      return 0;
    }
  }

  // calc_current_read_percent(page_index: number): string {
  //   let read = page_index + 1; // this.getActivePage();
  //   let total = this.book_page_length || 0;

  //   if (total) {
  //     return Math.floor(((read || 0) * 100) / +total) + '%';
  //   } else {
  //     return '0%';
  //   }
  // }

  /**
   * todo: if last chapter --> show remain from book.
   */
  calc_current_read_timeLeft(page_index: number): number {
    let read = page_index + 1; // this.getActivePage();
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

  private _isThisBookRtl: boolean | undefined = undefined;
  isThisBookRtl(): boolean {
    if (this._isThisBookRtl === undefined) {
      this._isThisBookRtl = ReaderUtility.isBookRtl(this._libraryItem!.book.language);
    }
    return this._isThisBookRtl;
  }

  swiper_render() {
    if (true) {
      const vrtData: any = this.state.virtualData;

      let offset_dir = 'left';
      let swiper_dir = '';
      // if (this.props.internationalization.rtl) {
      if (this.isThisBookRtl()) {
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
                      <div className="item cursor-pointer" >
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
                          <div>{Localization.formatString(Localization.n_min_left_in_chapter, this.calc_current_read_timeLeft(slide.id))}</div>
                          {/* <div>{this.calc_current_read_percent(slide.id)}</div> */}
                          <div>{this.calc_activePagePos_percent(slide.id)}%</div>
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
            <div className={"reader-reading-wrapper theme-" + this.props.reader.epub.theme}>
              {this.reading_body_render()}
              {/* {this.reading_footer_render()} */}
              <ContentLoader gutterClassName="gutter-0" show={this.state.page_loading}></ContentLoader>
            </div>
          </div>
        </div>

        <ToastContainer {...this.getNotifyContainerConfig()} />
        {/* <ToastContainer {...this.getNotifyContainerConfig()} />
        <ToastContainer {...this.getNotifyContainerConfig()} />
        <ToastContainer {...this.getNotifyContainerConfig()} /> */}
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
    reader: state.reader
  };
};

export const ReaderReading = connect(state2props, dispatch2props)(ReaderReadingComponent);
