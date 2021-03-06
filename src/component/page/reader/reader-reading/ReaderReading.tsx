import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../../redux/app_state";
import { IUser } from "../../../../model/model.user";
import { TInternationalization, Setup } from "../../../../config/setup";
import { BaseComponent } from "../../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { Localization } from "../../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../../enum/NetworkStatus";
import { PersonService } from "../../../../service/service.person";
import { action_user_logged_in } from "../../../../redux/action/user";
import Swiper from 'swiper';
import { Virtual } from 'swiper/dist/js/swiper.esm';
import { appLocalStorage } from "../../../../service/appLocalStorage";
import { IBookPosIndicator, IBookContent } from "../../../../webworker/reader-engine/MsdBook";
import { ContentLoader } from "../../../form/content-loader/ContentLoader";
import { ReaderUtility, IEpubBook_chapters } from "../ReaderUtility";
import { IReader_schema } from "../../../../redux/action/reader/readerAction";
import { ILibrary } from "../../../../model/model.library";
import { getLibraryItem, updateLibraryItem_progress } from "../../library/libraryViewTemplate";
import { MsdBookGenerator } from "../../../../webworker/reader-engine/MsdBookGenerator";
import { BOOK_TYPES } from "../../../../enum/Book";
import { PdfBookGenerator } from "../../../../webworker/reader-engine/PdfBookGenerator";
import { FILE_STORAGE_KEY } from "../../../../service/appLocalStorage/FileStorage";
import { IReaderEngine_schema } from "../../../../redux/action/reader-engine/readerEngineAction";
import { IBook } from "../../../../model/model.book";
import { BookService } from "../../../../service/service.book";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Utility } from "../../../../asset/script/utility";

interface IProps {
  logged_in_user: IUser | null;
  internationalization: TInternationalization;
  history: History;
  network_status: NETWORK_STATUS;
  onUserLoggedIn: (user: IUser) => void;
  match: any;
  reader: IReader_schema;
  reader_engine: IReaderEngine_schema;
}

interface IState {
  book: IBook | undefined;
  virtualData: {
    slides: any[];
  };
  page_loading: boolean;
  isDocumentZoomed: boolean;
}

class ReaderReadingComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';
  private isOriginalFile: 'false' | 'true' = 'false';

  state = {
    book: undefined,
    virtualData: {
      slides: [],
    },
    page_loading: true,
    isDocumentZoomed: false,
  };

  private _personService = new PersonService();

  swiper_obj: Swiper | undefined;
  private book_page_length = 1;
  private book_active_index = 0;
  private _libraryItem: ILibrary | undefined;
  private _isDocument: boolean | undefined;

  constructor(props: IProps) {
    super(props);

    this.book_id = this.props.match.params.bookId;
    this.isOriginalFile = this.props.match.params.isOriginalFile;
  }

  componentWillMount() {
    if (this.book_id) {
      this._libraryItem = getLibraryItem(this.book_id);
      if (this._libraryItem) this._isDocument = ReaderUtility.is_book_document(this._libraryItem!.book.type as BOOK_TYPES);
    }
  }
  async componentDidMount() {
    // if (!this._libraryItem) {
    if ((this.isOriginalFile === 'true' && !this._libraryItem) || !this.book_id) {
      this.props.history.replace(`/dashboard`);
      return;
    }

    await this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
    this.generateReader();
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.reader_engine.status !== this.props.reader_engine.status
      && nextProps.reader_engine.status === 'failed'
    ) {
      // debugger;
      this.reinit_readerEngine();
    }
  }

  private async reinit_readerEngine() {
    // debugger;
    this.setState({ page_loading: true });
    this._bookInstance = undefined;
    ReaderUtility.renderViewablePages_change_run(false);
    // ReaderUtility.clearEpubBookInstance();
    ReaderUtility.clearAllBookInstance();
    await this.createBook();
    this.setState({ page_loading: false });
  }

  /* private force_fail() {
    debugger;
    ReaderDownload.resetReaderWorkerHandler();
    Store2.dispatch(action_update_reader_engine({ ...Store2.getState().reader_engine, status: 'failed' }));
  } */

  componentWillUnmount() {
    this.swiper_obj && this.swiper_obj.destroy(true, true);
    this.swiper_obj = undefined;
  }

  async updateUserCurrentBook_client() {
    //todo: update anonymous user??
    if (!this.props.logged_in_user) return;
    
    let book;
    if (this._libraryItem) {
      book = this._libraryItem.book;
    } else {
      const _bookService = new BookService();
      const res = await _bookService.get(this.book_id, true).catch(e => { });
      if (res) {
        book = res.data;
        this._isDocument = ReaderUtility.is_book_document(book.type as BOOK_TYPES);
      }
    }
    this.setState({ ...this.state, book: book });

    if (this.isOriginalFile !== 'true') return;

    let logged_in_user = { ...this.props.logged_in_user };
    if (logged_in_user.person.current_book && logged_in_user.person.current_book.id === this.book_id) {
      return;
    }
    logged_in_user.person.current_book = book;
    this.props.onUserLoggedIn(logged_in_user);
  }

  async updateUserCurrentBook_server() {
    //todo: update anonymous user??
    if (!this.props.logged_in_user) return;

    if (!this.book_id) return;
    if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;
    
    if (this.isOriginalFile !== 'true') return;

    await this._personService.update(
      { current_book_id: this.book_id },
      this.props.logged_in_user.person.id
    ).catch(e => { });
  }

  private _bookPageSize!: { width: number, height: number }; // = Store2.getState().reader.epub.pageSize;
  private get_bookPageSize(): { width: number, height: number } {
    const container = document.querySelector('.swiper-container');
    let size;
    if (!container) size = { width: 200, height: 300 };
    else size = { width: container.clientWidth - 32, height: container.clientHeight - 32 - 16 };
    this._bookPageSize = size;
    return size;
  }

  bookFileNotFound_notify() {
    this.goBack();
    setTimeout(() => {
      const notifyBody: string = Localization.msg.ui.book_file_not_found_download_it;
      const config: ToastOptions = { autoClose: Setup.notify.timeout.warning };
      toast.warn(notifyBody, this.getNotifyConfig(config));
    }, 300);
  }
  readerError_notify() {
    this.goBack();
    setTimeout(() => {
      const notifyBody: string = Localization.msg.ui.reader_epub_error_occurred;
      const config: ToastOptions = { autoClose: Setup.notify.timeout.warning };
      toast.error(notifyBody, this.getNotifyConfig(config));
    }, 300);
  }

  private async generateReader() {
    if (this.props.reader_engine.status !== 'inited') {
      this.goBack();
      setTimeout(() => { this.readerEngineNotify(); }, 300);
      return;
    }

    await this.createBook();
    if (!this._bookInstance) return;
    this.initSwiper();
  }

  private _bookInstance: MsdBookGenerator | PdfBookGenerator | undefined;
  private async createBook() {
    const collectionName = this.isOriginalFile === 'true' ? FILE_STORAGE_KEY.FILE_BOOK_MAIN : FILE_STORAGE_KEY.FILE_BOOK_SAMPLE;
    const bookFile = await appLocalStorage.getFileById(collectionName, this.book_id);
    if (!bookFile) {
      this.setState({ page_loading: false });
      this.bookFileNotFound_notify();
      return;
    }

    try {
      this._bookInstance = await ReaderUtility.createEpubBook(this.book_id, bookFile, this.isOriginalFile === 'true', this.get_bookPageSize(), this._isDocument);
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      // ReaderUtility.clearEpubBookInstance();
      ReaderUtility.clearAllBookInstance();
      this.readerError_notify();
    }
  }

  private _createBookChapters: IEpubBook_chapters | undefined;
  private async createBookChapters() {
    if (!this._bookInstance) return;
    const bookContent: IBookContent[] = await this._bookInstance.getAllChapters();
    this._createBookChapters = ReaderUtility.createEpubBook_chapters(this.book_id, this.isOriginalFile === 'true', bookContent);

    this.calc_chapters_with_page();
  }

  private _pagePosList: number[] = [];
  private _chapters_with_page: { firstPageIndex: number | undefined, lastPageIndex: number | undefined }[] = [];
  private async calc_chapters_with_page() {
    if (!this._bookInstance) return;
    if (!this._pagePosList.length) {
      const bookPosList: IBookPosIndicator[] = await this._bookInstance.getAllPages_pos();
      bookPosList.forEach(bpi => {
        this._pagePosList.push(ReaderUtility.calc_bookContentPos_value(bpi));
      });
    }

    this._chapters_with_page =
      ReaderUtility.calc_chapters_pagesIndex(this._pagePosList, this._createBookChapters!.flat, this._isDocument!) || [];

    this.setState({});
  }

  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  private async initSwiper() {
    if (!this._bookInstance) return;
    const bookPosList: IBookPosIndicator[] = await this._bookInstance.getAllPages_pos();
    await this.createBookChapters();

    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    const progress_percent = this._libraryItem ? (this._libraryItem!.progress || 0) : 0;
    // debugger;
    this.book_active_index = Math.floor(this._slide_pages.length * progress_percent - 1); // - 1;
    if (this.book_active_index > this._slide_pages.length - 1 || this.book_active_index < 0) {
      console.error('this.book_active_index:', this.book_active_index, ' this._slide_pages.length:', this._slide_pages.length);
      this.book_active_index = 0;
    }

    // await this.getSinglePagePath(this.book_active_index);

    this.swiper_obj = new Swiper('.swiper-container', {
      keyboard: true,
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
          this.updateLibraryItem();
        },
        init: () => {
          this.setState({ page_loading: false });
        },
      }
    });
  }

  updateLibraryItem() {
    if (this.isOriginalFile !== 'true') return;
    const activePage = (this.getSwiperActiveIndex() + 1);
    const bookProgress = activePage / this.book_page_length;
    updateLibraryItem_progress(this.book_id, bookProgress);
  }
  getSwiperActiveIndex(): number {
    const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    return activeIndex || 0;
  }

  calc_activePagePos_percent(page_index: number): number {
    let activePage = page_index + 1;
    let totalPage = this.book_page_length || 0;

    if (totalPage) {
      return Math.floor(((activePage || 0) * 100) / +totalPage);
    } else {
      return 0;
    }
  }

  private getChapterLastPage_byPageIndex(pageIndex: number)
    : { chapter_lastPageIndex: number | undefined; is_last_chapter: boolean; } {
    // debugger;
    if (!this._chapters_with_page.length) return {
      chapter_lastPageIndex: undefined,
      is_last_chapter: false
    };

    let ch_lastPage = undefined;
    let is_last_chapter = false;
    for (let i = 0; i < this._chapters_with_page.length; i++) {
      let fp = this._chapters_with_page[i].firstPageIndex;
      let lp = this._chapters_with_page[i].lastPageIndex;
      if ((fp || fp === 0) && fp <= pageIndex && (lp || lp === 0) && lp >= pageIndex) {
        ch_lastPage = lp;
        if (i === this._chapters_with_page.length - 1) {
          is_last_chapter = true;
        }
        break;
      }
    }
    return {
      chapter_lastPageIndex: ch_lastPage,
      is_last_chapter
    };
  }
  calc_current_read_timeLeft(page_index: number): {
    timeLeft: number;
    is_last_chapter: boolean;
  } {
    let read = page_index;
    let obj = this.getChapterLastPage_byPageIndex(page_index);
    let total = obj.chapter_lastPageIndex;
    let is_last_chapter = obj.is_last_chapter;
    let min_per_page = 1;

    if (total) {
      return { timeLeft: (total - read + 1) * min_per_page, is_last_chapter };
    } else {
      return { timeLeft: 0, is_last_chapter };
    }
  }

  onDocumentZoom_open() {
    if (!this._isDocument) return;
    // debugger;
    if (!this.swiper_obj) return;
    const activeIndex = this.swiper_obj.activeIndex;
    const activeImg: HTMLImageElement | null =
      document.querySelector(`.swiper-container .swiper-slide img.page-img[data-src="${activeIndex}"]`);
    if (!activeImg) return;
    // debugger;
    this._innerImageZoom_src = activeImg.src;
    // this._innerImageZoom_el && this._innerImageZoom_el.img.click();
    this.setState({ isDocumentZoomed: true });
  }

  async onDocumentZoom_close() {
    if (!this._isDocument) return;
    // debugger;
    this._resetTransform && this._resetTransform();
    // return;
    await Utility.waitOnMe(400);
    this._innerImageZoom_src = '';

    // this._zoomScale = 1;
    // this._resetTransform_ref && this._resetTransform_ref.click();
    this.setState({ isDocumentZoomed: false });
  }

  // afterZoomIn() {
  //   // debugger;
  // }

  // afterZoomOut() {
  //   // debugger;
  //   // this.onDocumentZoom_close();
  // }

  private _innerImageZoom_src = '';
  private _resetTransform: any;
  // private _zoomScale = 1;
  // private _innerImageZoom_el: any;
  // private _resetTransform_ref: any;
  reading_header_render() {
    return (
      <>
        <i className={"header-icon fa fa-arrow-left-app p-2 ml-2 mt-2 cursor-pointer "
          + (this.state.page_loading ? 'active' : '')
        }
          onClick={() => this.goBack()}
        ></i>

        {/* <i className={"header-icon fa fa-home p-2 ml-2 mt-2 cursor-pointer active"}
          onClick={() => this.force_fail()}
        ></i> */}

        <i className={"header-icon magnify fa fa-search-plus-- fa-expand p-2 mr-2 mt-2 cursor-pointer "
          + (this._isDocument && !this.state.isDocumentZoomed && !this.state.page_loading ? 'active' : '')
        }
          onClick={() => this.onDocumentZoom_open()}
        ></i>

        <div className={"document-zoom "
          + (this._isDocument && this.state.isDocumentZoomed ? 'active' : '')
        }>
          {/* <InnerImageZoom className="zoom-img"
            src={this._innerImageZoom_src} zoomSrc={this._innerImageZoom_src}
            // ref={(el: any) => this._innerImageZoom_el = el}
            afterZoomIn={() => this.afterZoomIn()}
            afterZoomOut={() => this.afterZoomOut()}
          // fullscreenOnMobile
          // mobileBreakpoint={5000}
          /> */}

          {/* <TransformWrapper>
            <TransformComponent>
              <img src={this._innerImageZoom_src} alt="" />
            </TransformComponent>
          </TransformWrapper> */}

          {/* <div className="sample"> */}
          <TransformWrapper
            defaultScale={1}
            defaultPositionX={0}
            defaultPositionY={0}
          // resetTransform={this._resetTransform}
          // scale={this._zoomScale}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }: any) => {
              this._resetTransform = resetTransform;
              return (
                <>
                  <div className="tools position-absolute ml-2 mt-2">
                    <button className="btn btn-sm btn-light" onClick={zoomIn}>
                      <i className="fa fa-search-plus"></i>
                    </button>
                    <button className="btn btn-sm btn-light mx-1" onClick={zoomOut}>
                      <i className="fa fa-search-minus"></i>
                    </button>
                    <button className="btn btn-sm btn-light"
                      // ref={(ref) => this._resetTransform_ref = ref}
                      onClick={resetTransform}
                    >
                      <i className="fa fa-undo"></i>
                    </button>
                  </div>
                  <TransformComponent>
                    <img src={this._innerImageZoom_src} alt="" />
                  </TransformComponent>
                </>
              )
            }}
          </TransformWrapper>
          {/* </div> */}

        </div>

        <i className={"header-icon magnify fa fa-search-minus-- fa-compress p-2 mr-2 mt-2 cursor-pointer "
          + (this._isDocument && this.state.isDocumentZoomed && !this.state.page_loading ? 'active' : '')
        }
          onClick={() => this.onDocumentZoom_close()}
        ></i>
      </>
    )
  }

  reading_body_render() {
    return (
      <>
        <div className="reading-body">
          {this.swiper_render()}
        </div>
      </>
    )
  }

  /* private getPagePath_ifExist(pageIndex: number) {
    const page = this._bookInstance.getPage_ifExist(pageIndex);
    // if (!page) { ReaderUtility.check_swiperImg_with_delay(this._bookInstance) } // check_swiperImg_loaded
    return page;
  } */
  /* private getPagePath(pageIndex: number) {
    // this._bookInstance.getPage_with_storeAround(pageIndex, 5);
    return pageIndex; // page;
  } */
  /* getSinglePagePath(pageIndex: number) {
    return this._bookInstance.getPage(pageIndex);
  } */

  private _isThisBookRtl: boolean | undefined = undefined;
  isThisBookRtl(): boolean {
    if (!this.state.book) return false;
    if (this._isThisBookRtl === undefined) {
      this._isThisBookRtl = ReaderUtility.isBookRtl((this.state.book! as IBook).language);
    }
    return this._isThisBookRtl;
  }

  private _renderViewablePages_timeout: any;
  swiper_render() {
    // if (true) {

    if (this._renderViewablePages_timeout) {
      clearTimeout(this._renderViewablePages_timeout);
      this._renderViewablePages_timeout = undefined;
    };
    this._renderViewablePages_timeout = setTimeout(() => {
      this._bookInstance && ReaderUtility.renderViewablePages(this._bookInstance);
    }, 10);

    const vrtData: any = this.state.virtualData;

    let offset_dir = 'left';
    let swiper_dir = 'ltr';
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
              {vrtData.slides.map((slide: { id: number, page: IBookPosIndicator }, index: any) => {
                const { timeLeft, is_last_chapter } = this.calc_current_read_timeLeft(slide.id);
                return (
                  <Fragment key={slide.id}>
                    <div className="swiper-slide" style={{ [offset_dir]: `${vrtData.offset}px` }}>
                      <div className="item cursor-pointer" >
                        <div className="page-img-wrapper">
                          <img
                            className="page-img"
                            // src={this.getPagePath(slide.id)}
                            // src={this.getPagePath_ifExist(slide.id)}
                            // data-src={this.getPagePath(slide.id)}
                            data-src={slide.id}
                            alt=""
                            loading="lazy"
                            width={this._bookPageSize.width}
                            height={this._bookPageSize.height}
                          />
                        </div>
                        <div className="item-footer">
                          <div className={!timeLeft ? 'd-none-- invisible' : ''}>
                            {
                              is_last_chapter ?
                                Localization.formatString(Localization.n_min_left_in_book, timeLeft)
                                :
                                Localization.formatString(Localization.n_min_left_in_chapter, timeLeft)
                            }
                          </div>
                          <div>{this.calc_activePagePos_percent(slide.id)}%</div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </>
    );
    // }
  }

  onPageClicked() {
    this.gotoReader_overview(this.book_id);
  }

  gotoReader_overview(book_id: string) {
    this.props.history.replace(`/reader/${book_id}/${this.isOriginalFile}/overview`);
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
            <div className={"reader-reading-wrapper theme-" + this.props.reader.epub.theme
              + (this._isDocument ? '--' : '')
            }>
              {this.reading_header_render()}
              {this.reading_body_render()}
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
    network_status: state.network_status,
    reader: state.reader,
    reader_engine: state.reader_engine
  };
};

export const ReaderReading = connect(state2props, dispatch2props)(ReaderReadingComponent);
