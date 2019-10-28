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
import { getLibraryItem, updateLibraryItem_progress } from "../../library/libraryViewTemplate";
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
    book: undefined,
    virtualData: {
      slides: [],
    },
    page_loading: true,
  };

  private _personService = new PersonService();

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

    this.updateUserCurrentBook_client();
    this.updateUserCurrentBook_server();
    this.generateReader();
  }

  updateUserCurrentBook_client() {
    const book = this._libraryItem!.book;
    this.setState({ ...this.state, book: book });

    let logged_in_user = { ...this.props.logged_in_user! };
    if (logged_in_user.person.current_book && logged_in_user.person.current_book.id === this.book_id) {
      return;
    }
    logged_in_user.person.current_book = book;
    this.props.onUserLoggedIn(logged_in_user);
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
      this._bookInstance = await ReaderUtility.createEpubBook(this.book_id, bookFile, this.get_bookPageSize());
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      this.readerError_notify();
    }
  }

  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  private initSwiper() {
    const bookPosList: IBookPosIndicator[] = this._bookInstance.getAllPages_pos();

    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    const progress_percent = this._libraryItem!.progress || 0;
    debugger;
    this.book_active_index = Math.floor(this._slide_pages.length * progress_percent - 1); // - 1;
    if (this.book_active_index > this._slide_pages.length - 1 || this.book_active_index < 0) {
      console.error('this.book_active_index:', this.book_active_index, ' this._slide_pages.length:', this._slide_pages.length);
      this.book_active_index = 0;
    }

    this.getSinglePagePath(this.book_active_index);

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
    // ReaderUtility.updateLibraryItem_progress_client(this.book_id, bookProgress);
    // ReaderUtility.updateLibraryItem_progress_server(this.book_id, bookProgress);
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
          {this.swiper_render()}
        </div>
      </>
    )
  }

  getPagePath_ifExist(pageIndex: number) {
    const page = this._bookInstance.getPage_ifExist(pageIndex);
    if (!page) { ReaderUtility.check_swiperImg_loaded() }
    return page;
  }
  async getPagePath(pageIndex: number) {
    await CmpUtility.waitOnMe(0);
    return this._bookInstance.getPage_with_storeAround(pageIndex, 1);
    // return this._bookInstance.getPage(pageIndex);
  }
  getSinglePagePath(pageIndex: number) {
    return this._bookInstance.getPage(pageIndex);
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
                            // src={this.getPagePath(slide.id)}
                            src={this.getPagePath_ifExist(slide.id)}
                            data-src={this.getPagePath(slide.id)}
                            alt="book"
                            loading="lazy"
                            width={this._bookPageSize.width}
                            height={this._bookPageSize.height}
                          />
                        </div>
                        <div className="item-footer">
                          <div>{Localization.formatString(Localization.n_min_left_in_chapter, this.calc_current_read_timeLeft(slide.id))}</div>
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

  onPageClicked() {
    this.gotoReader_overview(this.book_id);
  }

  gotoReader_overview(book_id: string) {
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
    reader: state.reader
  };
};

export const ReaderReading = connect(state2props, dispatch2props)(ReaderReadingComponent);
