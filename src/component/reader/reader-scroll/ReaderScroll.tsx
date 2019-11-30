import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import Swiper from 'swiper';
// import { Virtual } from 'swiper/dist/js/swiper.esm';
// import { ReaderWorker } from "../../../webworker/reader-worker/ReaderWorker"; // .reader";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { Store2 } from "../../../redux/store";
import { IReader_schema } from "../../../redux/action/reader/readerAction";
import { CmpUtility } from "../../_base/CmpUtility";
import { ReaderUtility, IEpubBook_chapters } from "../ReaderUtility";
import { getLibraryItem, updateLibraryItem_progress, isReaderEngineDownloading, isReaderEngineDownloaded_async, getBookFileId } from "../../library/libraryViewTemplate";
import { ILibrary } from "../../../model/model.library";
import { Localization } from "../../../config/localization/localization";
import { BookGenerator } from "../../../webworker/reader-engine/BookGenerator";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { IBookContent, IBookPosIndicator } from "../../../webworker/reader-engine/MsdBook";
import { Virtual } from "swiper/dist/js/swiper.esm";
import { AppGuid } from "../../../asset/script/guid";
import { BOOK_TYPES } from "../../../enum/Book";
import { PdfBookGenerator } from "../../../webworker/reader-engine/PdfBookGenerator";
import { FILE_STORAGE_KEY } from "../../../service/appLocalStorage/FileStorage";


interface IReaderScrollSlide {
  id: string;
  isTitle: boolean;
  chapterTitle: string;
  pages: number[]; // { url: string; number: number }[];
  level: number | undefined;
}

interface IProps {
  internationalization: TInternationalization;
  history: History;
  network_status: NETWORK_STATUS;
  match: any;
  reader: IReader_schema;
}

interface IState {
  // book: IBook | undefined;
  virtualData: {
    slides: any[];
  },
  // swiper_slides: any[];
  page_loading: boolean;
}

class ReaderScrollComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    // book: undefined,
    virtualData: {
      slides: [],
    },
    // swiper_slides: [],
    page_loading: true,
  };

  swiper_obj: Swiper | undefined;
  private book_page_length = 1;
  private book_active_index = 0;
  private _libraryItem: ILibrary | undefined;

  constructor(props: IProps) {
    super(props);

    this.book_id = this.props.match.params.bookId;
  }

  componentWillMount() {
    if (this.book_id) {
      this._libraryItem = getLibraryItem(this.book_id);
    }
  }
  componentDidMount() {
    if (!this._libraryItem) {
      this.props.history.replace(`/dashboard`);
      return;
    }
    // this.getData_readerWorker();
    this.generateReader();
  }

  componentWillUnmount() {
    // todo: check me
    this.swiper_obj && this.swiper_obj.destroy(true, true);
    this.swiper_obj = undefined;
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

  readerEngineNotify(): void {
    this.goBack();
    setTimeout(() => {
      this.toastNotify(Localization.msg.ui.downloading_reader_security_content,
        { autoClose: Setup.notify.timeout.info, toastId: 'readerEngineNotify_info' }, 'info');
    }, 300);
  }

  private async generateReader() {
    await CmpUtility.waitOnMe(0);

    const is_re_d_ing = isReaderEngineDownloading();
    const is_re_d_ed = await isReaderEngineDownloaded_async();
    if (is_re_d_ing || !is_re_d_ed) {
      this.readerEngineNotify();
      return;
    }

    await this.createBook();
    if (!this._bookInstance) return;
    this.initSwiper();
  }

  // private _readerWorker: ReaderWorker | undefined;
  // getData_readerWorker() {
  //   this._readerWorker = new ReaderWorker();
  //   if (!this._readerWorker) return;

  //   this._readerWorker.postMessage({
  //     book_active_page: this.book_active_page
  //   });

  //   // this._readerWorker.onmessage(this.onReceive_data_from_worker.bind(this));
  //   this._readerWorker.onmessage((data) => { this.onReceive_data_from_worker(data) });
  // }

  // onReceive_data_from_worker(data: { bookSlideList: any[]; active_slide: number | undefined; }) {
  //   console.log('main: Message received from worker', data);

  //   this.setState(
  //     { ...this.state, swiper_slides: data.bookSlideList },
  //     () => {
  //       this.initSwiper(data.bookSlideList, data.active_slide);
  //     }
  //   );

  //   this._readerWorker!.terminate();
  // }

  // componentWillUnmount() {
  //   if (this._readerWorker) { this._readerWorker.terminate(); }
  // }



  private _bookPageSize: { width: number, height: number } = Store2.getState().reader.epub.pageSize;
  private _bookInstance!: BookGenerator | PdfBookGenerator;
  private async createBook() {
    // const bookFile = await appLocalStorage.findBookMainFileById(this.book_id);
    const bookFile = await appLocalStorage.getFileById(FILE_STORAGE_KEY.FILE_BOOK_MAIN, getBookFileId(this.book_id, true));
    if (!bookFile) {
      this.setState({ page_loading: false });
      this.bookFileNotFound_notify();
      return;
    }

    try {
      const isPdf = this._libraryItem!.book.type === BOOK_TYPES.Pdf;
      this._bookInstance = await ReaderUtility.createEpubBook(this.book_id, bookFile, undefined, isPdf);
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      ReaderUtility.clearEpubBookInstance();
      this.readerError_notify();
    }
  }

  private _createBookChapters: IEpubBook_chapters | undefined;
  private async createBookChapters() {
    // await CmpUtility.waitOnMe(0);
    const bookContent: IBookContent[] = await this._bookInstance.getAllChapters();
    this._createBookChapters = ReaderUtility.createEpubBook_chapters(this.book_id, bookContent);

    await this.calc_chapters_with_page();
  }

  private _pagePosList: number[] = [];
  private _chapters_with_page: { firstPageIndex: number | undefined, lastPageIndex: number | undefined }[] = [];
  private async calc_chapters_with_page() {
    // await CmpUtility.waitOnMe(0);
    if (!this._pagePosList.length) {
      const bookPosList: IBookPosIndicator[] = await this._bookInstance.getAllPages_pos();
      bookPosList.forEach(bpi => {
        // this._pagePosList.push(bpi.group * 1000000 + bpi.atom);
        this._pagePosList.push(ReaderUtility.calc_bookContentPos_value(bpi));
      });
    }

    const isPdf = this._libraryItem!.book.type === BOOK_TYPES.Pdf;
    this._chapters_with_page =
      ReaderUtility.calc_chapters_pagesIndex(this._pagePosList, this._createBookChapters!.flat, isPdf) || [];
  }

  private getBookSlideList(): IReaderScrollSlide[] {

    let slideList: IReaderScrollSlide[] = [];

    const bookChapter_withPages: { title: string; pages: number[], level: number | undefined }[] = [];
    this._createBookChapters!.flat.forEach((ch, ch_index) => {
      if (!ch.clickable) return;
      const firstPageIndex = this._chapters_with_page[ch_index].firstPageIndex;
      const lastPageIndex = this._chapters_with_page[ch_index].lastPageIndex;
      if (!((firstPageIndex || firstPageIndex === 0) && (lastPageIndex || lastPageIndex === 0))) return;
      bookChapter_withPages.push({
        title: ch.content!.text,
        pages: Array.from({ length: lastPageIndex - firstPageIndex + 1 }, (v, k) => k + firstPageIndex),
        level: ch.level
      });
    })

    bookChapter_withPages.forEach((chapter, chapter_index) => {
      slideList.push({
        id: AppGuid.generate(),
        isTitle: true,
        chapterTitle: chapter.title,
        pages: [],
        level: chapter.level
      });

      for (let i = 0; i < chapter.pages.length;) {
        const newPage = [];
        for (let j = i; j < i + 3; j++) {
          if (chapter.pages[j] || chapter.pages[j] === 0) {
            newPage.push(chapter.pages[j]);
          }
        }
        slideList.push({
          id: AppGuid.generate(),
          isTitle: false,
          chapterTitle: chapter.title,
          pages: [...newPage],
          level: chapter.level
        });
        i += 3;
      }
    });

    return slideList;
  }
  private calc_active_slide(bookSlideList: IReaderScrollSlide[], book_activePage_index: number) {
    let activeSlide = 0;
    for (let i = 0; i < bookSlideList.length; i++) {
      let current_slide = bookSlideList[i];

      for (let j = 0; j < current_slide.pages.length; j++) {
        let current_page = current_slide.pages[j];
        if (current_page === book_activePage_index) {
          activeSlide = i;
          break;
        }
      }
      if (activeSlide) {
        break;
      }
    }
    return activeSlide;
  }

  async initSwiper() {
    const bookPosList: IBookPosIndicator[] = await this._bookInstance.getAllPages_pos();
    await this.createBookChapters();

    this.book_page_length = bookPosList.length;
    const progress_percent = this._libraryItem!.progress || 0;
    // debugger;
    this.book_active_index = Math.floor(this.book_page_length * progress_percent - 1); // - 1;
    if (this.book_active_index > this.book_page_length - 1 || this.book_active_index < 0) {
      console.error('this.book_active_index:', this.book_active_index, ' this._slide_pages.length:', this.book_page_length);
      this.book_active_index = 0;
    }

    const slideList = this.getBookSlideList();
    const activeSlide = this.calc_active_slide(slideList, this.book_active_index);
    // debugger;

    // this.getSinglePagePath(this.book_active_index);
    this.getPagePath(this.book_active_index);

    this.swiper_obj = new Swiper('.swiper-container', {
      keyboard: true,
      virtual: {
        slides: slideList, // this._slide_pages,
        renderExternal: (data: Virtual) => {
          this.setState({
            virtualData: data,
          });
        }
      },
      initialSlide: activeSlide, // this.book_active_index,
      direction: 'vertical',
      mousewheel: true,
      autoHeight: true, // false
      spaceBetween: 32,
      // slidesPerView: 'auto',
      slidesPerView: 4,
      freeMode: true,
      centeredSlides: true,

      roundLengths: true,
      centerInsufficientSlides: true,
      grabCursor: true,
      // simulateTouch: true,
      // slidesPerGroup: 1,

      on: {
        tap: () => {
          this.onSwiperTaped();
        },
        init: () => {
          this.setState({ page_loading: false });

          setTimeout(() => {
            this.swiper_obj && this.swiper_obj.slideTo(activeSlide + 1);
            this.swiper_obj && this.swiper_obj.slideTo(activeSlide);
          }, 1000);
        }
      }
    });
  }

  reading_body_render() {
    return (
      <>
        <div className="scroll-body mx-3">

          {this.swiper_render()}

          <ContentLoader gutterClassName="gutter-n1r" show={this.state.page_loading}></ContentLoader>

        </div>
      </>
    )
  }

  reading_footer_render() {
    return (
      <div className="scroll-footer">
        <div className="change-view">
          <i className="fa fa-server p-2 cursor-pointer"
            onClick={() => this.gotoReader_overview(this.book_id)}
          ></i>
        </div>
      </div>
    )
  }

  getPagePath_ifExist(pageIndex: number) {
    const page = this._bookInstance.getPage_ifExist(pageIndex);
    // if (!page) { ReaderUtility.check_swiperImg_with_delay(this._bookInstance) } // check_swiperImg_loaded
    return page;
  }
  getPagePath(pageIndex: number) {
    // this._bookInstance.getPage_with_storeAround(pageIndex, 5);
    return pageIndex; // page;
  }

  swiper_item_render(slide: IReaderScrollSlide, offset: any) {
    if (slide.isTitle) {
      return (
        <>
          <div className="swiper-slide" style={{ top: `${offset}px` }}>
            {/* <div className="swiper-slide" > */}
            <div className="item-- text-center d-block-- my-4" >

              <h3 className="chapterTitle-- font-weight-normal">
                {
                  (slide.level && slide.level > 1) ?
                    Array.from({ length: slide.level - 1 }, (v, k) => k).map(i => (
                      <i className="font-size-01 fa fa-circle mx-1" key={i}></i>
                    ))
                    : ''
                }
                <span className="mx-2">{slide.chapterTitle}</span>
              </h3>
            </div>
          </div>
        </>
      )

    } else {
      const slide_pages = [...slide.pages];
      const slide_pages_length = slide_pages.length
      if (slide_pages.length < 3) {
        for (let i = 0; i < 3 - slide_pages_length; i++) {
          // slide_pages.push({ number: -1, url: CmpUtility.bookSizeImagePath }); // url: ''
          slide_pages.push(-1); // url: ''
        }
      }
      const invisibleImgSrc = ''; // CmpUtility.bookSizeImagePath;
      return (
        <>
          <div className="swiper-slide" style={{ top: `${offset}px` }}>
            {/* <div className="swiper-slide" > */}
            <div className="item-wrapper" >
              {slide_pages.map((pg, pg_index) => {
                const key = pg === -1 ? (slide_pages[0] + '' + pg + '' + pg_index) : pg;
                return (
                  // <Fragment key={pg_index}>
                  <Fragment key={key}>
                    <div
                      className={
                        "item " +
                        ((pg === this.book_active_index) ? 'active ' : '') +
                        ((pg === -1) ? 'invisible' : '')
                      }
                      // onClick={() => this.onPageClicked(pg.number)}
                      onClick={() => this.onPageClicked(pg)}
                    >
                      <div className="page-img-wrapper">
                        <img
                          className="page-img"
                          src={(() => { if (pg !== -1) return this.getPagePath_ifExist(pg); else return invisibleImgSrc; })()}
                          data-src={(() => { if (pg !== -1) return this.getPagePath(pg); else return invisibleImgSrc; })()}
                          alt=""
                          loading="lazy"
                          width={this._bookPageSize.width}
                          height={this._bookPageSize.height}
                        />
                      </div>
                      <div className="page-number text-muted">
                        {pg + 1}
                      </div>
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </div>
        </>
      )
    }
  }

  private _isThisBookRtl: boolean | undefined = undefined;
  isThisBookRtl(): boolean {
    if (this._isThisBookRtl === undefined) {
      this._isThisBookRtl = ReaderUtility.isBookRtl(this._libraryItem!.book.language);
    }
    return this._isThisBookRtl;
  }

  private _renderViewablePages_timeout: any;
  swiper_render() {
    if (true) {

      if (this._renderViewablePages_timeout) {
        clearTimeout(this._renderViewablePages_timeout);
        this._renderViewablePages_timeout = undefined;
      };
      this._renderViewablePages_timeout = setTimeout(() => {
        this._bookInstance && ReaderUtility.renderViewablePages(this._bookInstance);
      }, 10);

      const vrtData: any = this.state.virtualData;
      // const swiper_slides: any = this.state.swiper_slides;

      // let offset_dir = 'top';
      let swiper_dir = 'ltr';
      // if (this.props.internationalization.rtl) {
      if (this.isThisBookRtl()) {
        // offset_dir = 'right';
        swiper_dir = 'rtl';
      }

      return (
        <>
          <div className="app-swiper">
            <div className="swiper-container" dir={swiper_dir}>
              <div className="swiper-wrapper">
                {vrtData.slides.map((slide: IReaderScrollSlide, index: any) => (
                  <Fragment key={slide.id}>
                    {this.swiper_item_render(slide, vrtData.offset)}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  private swiperTaped = false;
  async onSwiperTaped() {
    this.swiperTaped = true;
    await CmpUtility.waitOnMe(50);
    this.swiperTaped = false;
  }

  async onPageClicked(pg_index: number) {
    await CmpUtility.waitOnMe(10);
    if (!this.swiperTaped) return;
    // debugger;
    const activePage = pg_index + 1;
    const bookProgress = activePage / this.book_page_length;

    updateLibraryItem_progress(this.book_id, bookProgress);

    this.gotoReader_reading(this.book_id);
  }

  goBack() {
    if (this.props.history.length > 1) { this.props.history.goBack(); }
    else { this.props.history.push(`/dashboard`); }
  }

  gotoReader_overview(book_id: string) {
    this.props.history.replace(`/reader/${book_id}/overview`);
  }

  gotoReader_reading(book_id: string) {
    this.props.history.replace(`/reader/${book_id}/reading`);
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-12 px-0">
            <div className={"reader-scroll-wrapper theme-" + this.props.reader.epub.theme}>
              {this.reading_body_render()}
              {this.reading_footer_render()}
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
  };
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
    network_status: state.network_status,
    reader: state.reader
  };
};

export const ReaderScroll = connect(state2props, dispatch2props)(ReaderScrollComponent);
