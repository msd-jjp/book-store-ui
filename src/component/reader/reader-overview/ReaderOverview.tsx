import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { Localization } from "../../../config/localization/localization";
import { Dropdown, Modal, ToggleButtonGroup } from "react-bootstrap";
import { IBook } from "../../../model/model.book";
import Tooltip from 'rc-tooltip';
import RcSlider, { Handle } from 'rc-slider';
import { NavLink } from "react-router-dom";
import Swiper from 'swiper';
import { Virtual } from 'swiper/dist/js/swiper.esm';
import { CmpUtility } from "../../_base/CmpUtility";
import { BOOK_ROLES } from "../../../enum/Book";
import { Input } from "../../form/input/Input";
import { AppRegex } from "../../../config/regex";
import { IBookPosIndicator, IBookContent } from "../../../webworker/reader-engine/MsdBook";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { ReaderUtility, IEpubBook_chapters } from "../ReaderUtility";
import { ToggleButton } from "react-bootstrap";
import { IReader_schema_epub_fontName, IReader_schema_epub_theme, IReader_schema } from "../../../redux/action/reader/readerAction";
import { action_update_reader } from "../../../redux/action/reader";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { BaseService } from "../../../service/service.base";
import { ILibrary } from "../../../model/model.library";
import { getLibraryItem, updateLibraryItem_progress } from "../../library/libraryViewTemplate";
import { BookGenerator } from "../../../webworker/reader-engine/BookGenerator";
import { Store2 } from "../../../redux/store";

interface IProps {
  internationalization: TInternationalization;
  history: History;
  match: any;
  network_status: NETWORK_STATUS;
  reader: IReader_schema;
  update_reader: (reader: IReader_schema) => any;
}

interface IState {
  book: IBook | undefined;
  virtualData: {
    slides: any[],
  },
  RcSlider_value: number | undefined;
  is_sidebar_open: boolean;
  modal_goto: { show: boolean; input: { value: any; isValid: boolean } };
  page_loading: boolean;
  modal_epub: {
    show: boolean;
    fontSize: number | undefined;
    theme: IReader_schema_epub_theme | undefined;
    fontName: IReader_schema_epub_fontName | undefined;
  };
}

class ReaderOverviewComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined,
    virtualData: {
      slides: [],
    },
    RcSlider_value: undefined,
    is_sidebar_open: false,
    modal_goto: { show: false, input: { value: undefined, isValid: false } },
    page_loading: true,
    modal_epub: {
      show: false,
      fontSize: undefined,
      theme: undefined,
      fontName: undefined
    },
  };

  private swiper_obj: Swiper | undefined;
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
    this.setBook_byId(this.book_id);
    this.generateReader();
  }

  setBook_byId(book_id: string) {
    this.setState({ ...this.state, book: this._libraryItem!.book });
  }

  overview_header_render() {
    return (
      <div className="overview-header">
        <div className="row">
          <div className="col-12">
            <div className="icon-wrapper">
              <i className="fa fa-arrow-left-app text-dark-- p-2 cursor-pointer"
                onClick={() => this.goBack()}
              ></i>

              <i className="fa fa-bars text-dark-- p-2 cursor-pointer"
                onClick={() => this.showSidebar()}
              ></i>

              <div className="float-right">
                <i className="fa fa-search text-dark-- p-2 cursor-pointer-- icon disabled"></i>
                <i className="fa fa-font text-dark-- p-2 cursor-pointer-- icon" onClick={() => this.openModal_epub()}></i>
                <i className="fa fa-file-text-o text-dark-- p-2 cursor-pointer-- icon disabled"></i>
                <i className="fa fa-bookmark-o text-dark-- p-2 cursor-pointer-- icon disabled"></i>

                <Dropdown className="d-inline-block menu-dd">
                  <Dropdown.Toggle
                    as="i"
                    id="dropdown-overview-menu"
                    className="icon fa fa-ellipsis-v text-dark-- p-2 no-default-icon">
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-right border-0 rounded-0 shadow2">

                    <Dropdown.Item
                      className="text-capitalize opacity-5"
                      disabled
                    >
                      {Localization.recommend_this_book}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-capitalize"
                      as={NavLink} to={`/store`}
                    >
                      {Localization.shop_in_store}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-capitalize opacity-5"
                      disabled
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

  private _bookPageSize: { width: number, height: number } = Store2.getState().reader.epub.pageSize;
  private _bookInstance!: BookGenerator;
  private async createBook() {
    const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
    if (!bookFile) {
      this.setState({ page_loading: false });
      this.bookFileNotFound_notify();
      return;
    }

    try {
      this._bookInstance = await ReaderUtility.createEpubBook(this.book_id, bookFile);
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      this.readerError_notify();
    }
  }


  private _createBookChapters: IEpubBook_chapters | undefined;
  private async  createBookChapters() {
    await CmpUtility.waitOnMe(0);
    const bookContent: IBookContent[] = this._bookInstance.getAllChapters();
    // debugger;
    this._createBookChapters = ReaderUtility.createEpubBook_chapters(this.book_id, bookContent);
  }

  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  private initSwiper() {
    const bookPosList: IBookPosIndicator[] = this._bookInstance.getAllPages_pos();
    // const bookContent: IBookContent[] = this._bookInstance.getAllChapters();
    this.createBookChapters();
    // debugger;
    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    const progress_percent = this._libraryItem!.progress || 0;
    // debugger;
    this.book_active_index = Math.floor(this._slide_pages.length * progress_percent - 1); // - 1;
    if (this.book_active_index > this._slide_pages.length - 1 || this.book_active_index < 0) {
      console.error('this.book_active_index:', this.book_active_index, ' this._slide_pages.length:', this._slide_pages.length);
      this.book_active_index = 0;
    }

    this.getSinglePagePath(this.book_active_index);

    this.swiper_obj = new Swiper('.swiper-container', {
      // freeMode: true,
      // centeredSlides: true,
      // slidesPerView: 1,
      keyboard: true,
      virtual: {
        cache: true,
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
          this.onSwiperTaped();
        },
        slideChange: () => {
          const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
          if (activeIndex || activeIndex === 0) {
            this.set_RcSlider_value(activeIndex + 1);
          }
        },
        init: () => {
          this.setState({ page_loading: false, RcSlider_value: this.getActivePage() });
        },
      }
    });
  }

  swiper_slideTo(value: number) {
    if (this.getActivePage() - 1 === value) return;
    this.swiper_obj && this.swiper_obj!.slideTo(value);
  }

  getActivePage(): number {
    const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    return (activeIndex || activeIndex === 0) ? (activeIndex + 1) : this.book_active_index + 1;
  }

  calc_activePagePos_percent(): number {
    let activePage = this.getActivePage();
    let totalPage = this.book_page_length || 0;

    if (totalPage) {
      return Math.floor(((activePage || 0) * 100) / +totalPage);
    } else {
      return 0;
    }
  }

  overview_body_render() {
    return (
      <>
        <div className="overview-body my-3--">
          <h5 className="book-title mt-3 text-center">{this.getBookTitle()}</h5>

          {this.swiper_render()}

          <div className="page-location text-center text-muted">
            {this.getActivePage()}&nbsp;
            {Localization.of}&nbsp;
            {this.book_page_length}&nbsp;
            <i className="font-size-01 fa fa-circle mx-2"></i>&nbsp;
            {this.calc_activePagePos_percent()}%
          </div>
        </div>
      </>
    )
  }

  getPagePath_ifExist(pageIndex: number) {
    const page = this._bookInstance.getPage_ifExist(pageIndex);
    if (!page) { ReaderUtility.check_swiperImg_loaded() }
    return page;
  }
  // async 
  getPagePath(pageIndex: number) {
    // await CmpUtility.waitOnMe(0);
    const page = this._bookInstance.getPage_with_storeAround(pageIndex, 1);
    return page;
  }
  getSinglePagePath(pageIndex: number) {
    return this._bookInstance.getPage(pageIndex);
  }

  private _isThisBookRtl: boolean | undefined = undefined;
  isThisBookRtl(): boolean {
    if (this._isThisBookRtl === undefined) {
      this._isThisBookRtl = this._libraryItem ? ReaderUtility.isBookRtl(this._libraryItem.book.language) : false;
    }
    return this._isThisBookRtl;
  }

  swiper_render() {
    if (true) {
      const vrtData: any = this.state.virtualData;

      let offset_dir = 'left';
      let swiper_dir = '';
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
                      <div className="item cursor-pointer " onClick={() => this.onPageClicked(slide.id)}>
                        <div className="page-img-wrapper">
                          <img
                            className="page-img"
                            src={this.getPagePath_ifExist(slide.id)}
                            data-src={this.getPagePath(slide.id)}
                            alt=""
                            loading="lazy"
                            // onLoad={(e) => { this.getPagePath_onLoad() }}
                            width={this._bookPageSize.width}
                            height={this._bookPageSize.height}
                          />
                        </div>
                        <div className="page-number text-muted">{slide.id + 1}</div>
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

    // ReaderUtility.updateLibraryItem_progress_client(this.book_id, bookProgress);
    // ReaderUtility.updateLibraryItem_progress_server(this.book_id, bookProgress);
    updateLibraryItem_progress(this.book_id, bookProgress);

    this.gotoReader_reading(this.book_id);
  }

  gotoReader_reading(book_id: string) {
    this.props.history.replace(`/reader/${book_id}/reading`);
  }

  gotoReader_scroll(book_id: string) {
    this.props.history.replace(`/reader/${book_id}/scroll`);
  }

  handle(props: any) {
    const { value, dragging, index, ...restProps } = props;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  };

  onSliderChange(value: number) {
    // log(value);
    // this.setState({
    //   value,
    // });
    // console.log('onSliderChange', value);
    this.set_RcSlider_value(value);
  }
  set_RcSlider_value(value: number) {
    if (value === this.state.RcSlider_value) return;
    // console.log('set_RcSlider_value: ', value);
    this.setState({ ...this.state, RcSlider_value: value });
  }
  onAfterChange(value: number) {
    // console.log(value, 'RcSlider change call swiper_obj!.slideTo');
    // const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    // console.log('activeIndex: ', activeIndex, 'value: ', value);
    // console.log('getActivePage: ', this.getActivePage(), 'value: ', value);
    // if (this.getActivePage() === value) return;
    console.log('RcSlider change swiper_obj slideTo: ', value - 1);
    // this.swiper_obj!.slideTo(value - 1);
    this.swiper_slideTo(value - 1);
  }

  slider_render() {
    const maxVal = this.book_page_length; // 10
    if (!maxVal) return;
    const defaultValue = this.book_active_index + 1; // || 1;

    return (
      <>
        <RcSlider
          min={1}
          max={maxVal}
          reverse={this.props.internationalization.rtl}
          defaultValue={defaultValue}
          handle={(p) => this.handle(p)}
          onChange={(v) => this.onSliderChange(v)}
          onAfterChange={(v) => this.onAfterChange(v)}
          value={this.state.RcSlider_value}
        // step={20} 
        // onBeforeChange={log}
        // disabled
        />
      </>
    )
  }

  overview_footer_render() {
    return (
      <>
        <div className="overview-footer">
          <div className="change-view--">
            <i className="fa fa-th p-2 cursor-pointer"
              onClick={() => this.gotoReader_scroll(this.book_id)}
            ></i>
          </div>
          <div className="footer-slider">{this.slider_render()}</div>
          <div className="audio--">
            {/* <i className="fa fa-headphones p-2 cursor-pointer" */}
            <i className={"fa fa-wifi p-2 cursor-pointer " +
              (this.props.network_status === NETWORK_STATUS.OFFLINE ? 'text-danger' : '')
            }
              onClick={() => BaseService.check_network_status()}
            ></i>
          </div>
        </div>
      </>
    )
  }

  showSidebar() {
    this.setState({ is_sidebar_open: true });
  }

  hideSidebar() {
    this.setState({ is_sidebar_open: false });
  }

  // is_sidebarBody_overflow(): boolean {
  //   const sidebar = document.querySelector('.overview-sidebar');
  //   const sidebarBody = document.querySelector('.overview-sidebar-body');
  //   if (!sidebar || !sidebarBody) return false;
  //   const sidebarHeight = sidebar.clientHeight;
  //   const sidebarBodyHeight = sidebarBody.scrollHeight;
  //   if (sidebarHeight < sidebarBodyHeight) return true;
  //   return false;
  // }
  overview_sidebar_render() {
    return (
      <>
        <div
          className={"overview-sidebar-backdrop " + (this.state.is_sidebar_open ? 'open' : 'd-none--')}
          onClick={() => this.hideSidebar()}
        ></div>

        <div className={"overview-sidebar " + (this.state.is_sidebar_open ? 'open' : 'd-none--')}>
          <div className="overview-sidebar-header cursor-pointer px-2"
            onClick={() => this.goBack()}
          >
            <i className="fa fa-arrow-left-app mr-3 mt-n1"></i>
            <span className="text-capitalize">{Localization.close_book}</span>
          </div>

          {/* <div className={"overview-sidebar-body " + (this.is_sidebarBody_overflow() ? 'overflow-y-scroll--' : '')}> */}
          <div className={"overview-sidebar-body"}>
            <div className="item px-2 py-3">
              {this.sidebar_book_main_detail_render()}
            </div>
            <div className="item px-2 py-3 text-capitalize cursor-pointer"
              onClick={() => {
                this.openModal_goto();
                this.hideSidebar();
              }}
            >
              {Localization.goto}
            </div>
            <div className="item px-2 py-3">
              {this.sidebar_book_chapter_render()}
            </div>
          </div>

        </div>
      </>
    )
  }

  sidebar_book_main_detail_render() {
    if (!this.state.book) return;
    const book_title = this.getBookTitle();
    const firstWriterFullName = CmpUtility.getBook_role_fisrt_fullName_reverse_with_comma(
      this.state.book!,
      BOOK_ROLES.Writer,
      this.props.internationalization.flag === 'fa'
    );
    const book_img = CmpUtility.getBook_firstImg(this.state.book!);

    return (
      <>
        <div className="book-main-detail row">
          <div className="col-4">
            <div className="img-scaffolding-container">
              <img src={CmpUtility.bookSizeImagePath} alt="" className="img-scaffolding" />
              <img src={book_img} alt="book" onError={e => CmpUtility.bookImageOnError(e)}
                className="main-img center-el-in-box" loading="lazy" />
            </div>
          </div>
          <div className="col-8 p-align-0">
            <div className="book-title-writer-wrapper">
              <div className="book-title">{book_title}</div>
              <div className="book-writer">{firstWriterFullName}</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  generateEl(eb_chapters: IEpubBook_chapters['tree']) {
    return (
      <>
        {/* <ul> */}
        <li
          className={(eb_chapters.clickable) ? 'clickable' : 'disabled'}
        // onClick={() => { if (eb_chapters.clickable) this.chapterClicked(eb_chapters.chapter!); }}
        >
          <div className="chapter-title p-2"
            onClick={() => { if (eb_chapters.clickable) this.chapterClicked(eb_chapters.content!); }}
          >
            {eb_chapters.content!.text}
          </div>
          {/* </li> */}
          {
            eb_chapters.children.length ?
              <ul className="pl-1 mb-2">
                {
                  eb_chapters.children.map((ch, index) => (
                    <Fragment key={index}>
                      {this.generateEl(ch)}
                    </Fragment>
                  ))
                }
              </ul>
              : ''
          }
        </li>
        {/* </ul> */}
      </>
    )
  }
  sidebar_book_chapter_render(): JSX.Element {
    if (!this._createBookChapters) {
      return <div></div>;
    } else {
      return (
        <div className="book-chapters">
          <ul className="p-0">
            {this.generateEl(this._createBookChapters.tree)}
          </ul>
        </div>
      )
    }
  }
  async chapterClicked(ibc: IBookContent) {
    // debugger;
    const pageIndex = this.getPageIndex_byChapter(ibc.pos);
    if (pageIndex || pageIndex === 0) {
      this.hideSidebar();
      await CmpUtility.waitOnMe(100);
      this.set_RcSlider_value(pageIndex + 1);
      this.swiper_slideTo(pageIndex);
      // this.setState({});
    }
  }

  private _pagePosList: number[] = [];
  getPageIndex_byChapter(chapterPos: IBookPosIndicator): number | undefined {
    if (!this._pagePosList.length) {
      const bookPosList: IBookPosIndicator[] = this._bookInstance.getAllPages_pos();
      bookPosList.forEach(bpi => {
        this._pagePosList.push(bpi.group * 1000000 + bpi.atom);
      });
    }

    const chapterIndex = chapterPos.group * 1000000 + chapterPos.atom;
    let pageIndex = undefined;
    for (var i = 0; i < this._pagePosList.length; i++) {
      if (this._pagePosList[i] === chapterIndex) {
        pageIndex = i;
        break;
      } else if (this._pagePosList[i] > chapterIndex) {
        pageIndex = i - 1;
        break;
      }
    }

    if (pageIndex && pageIndex < 0) return;

    if (pageIndex === undefined && this._pagePosList.length) {
      pageIndex = this._pagePosList.length - 1;
    }

    return pageIndex;
  }

  goBack() {
    if (this.props.history.length > 1) { this.props.history.goBack(); }
    else { this.props.history.push(`/dashboard`); }
  }

  //#region modal_goto
  openModal_goto() {
    this.setState({ ...this.state, modal_goto: { ...this.state.modal_goto, show: true } });
  }

  closeModal_goto() {
    this.setState({ ...this.state, modal_goto: { ...this.state.modal_goto, show: false } });
  }

  modal_goto_render() {
    return (
      <>
        <Modal
          show={this.state.modal_goto.show}
          className={"reader-overview-modal-goto theme-" + this.props.reader.epub.theme}
          onHide={() => this.closeModal_goto()}
          centered
        >
          <Modal.Header
            // closeButton
            className="border-bottom-0 pb-0">
            <Modal.Title className="text-capitalize font-weight-normal">
              {Localization.enter_location + ` (1-${this.book_page_length})`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-12">
                <p>{Localization.formatString(Localization.you_are_reading_loaction_n, this.book_active_index + 1)}</p>
              </div>
              <div className="col-12">
                <Input
                  defaultValue={this.state.modal_goto.input.value}
                  onChange={(val, isValid) => { this.handleModalGoto_inputChange(val, isValid) }}
                  required
                  hideError
                  className="input-bordered-bottom input-border-danger"
                  pattern={AppRegex.integer}
                  validationFunc={(val) => this.goto_validation(val)}
                  onKeyUp={(e) => this.handleModalGoto_keyUp(e)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="pt-0 border-top-0">
            <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_goto()}>
              {Localization.cancel}
            </button>
            <button className="btn btn-danger-- text-danger btn-sm text-uppercase min-w-70px"
              onClick={() => this.modal_goto_onGoto()}
              disabled={!this.state.modal_goto.input.isValid}>
              {Localization.go}
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  handleModalGoto_inputChange(value: any, isValid: boolean) {
    this.setState({
      ...this.state,
      modal_goto: {
        ...this.state.modal_goto,
        input: { value, isValid }
      }
    });
  }

  handleModalGoto_keyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      this.modal_goto_onGoto()
    }
  }

  goto_validation(val: any): boolean {
    if (val <= this.book_page_length && val >= 1) {
      return true
    }
    return false;
  }

  async modal_goto_onGoto() {
    if (!this.state.modal_goto.input.isValid) return;
    this.closeModal_goto();
    await this.waitOnMe(100);
    this.set_RcSlider_value(+this.state.modal_goto.input.value!);
    this.swiper_slideTo(+this.state.modal_goto.input.value! - 1);
    this.setState({
      ...this.state, modal_goto: {
        ...this.state.modal_goto,
        input: { value: undefined, isValid: false }
      }
    });
  }
  //#endregion

  //#region modal_epub
  openModal_epub() {
    // const reader_state = { ...Store2.getState().reader };
    const reader_epub = this.props.reader.epub; // reader_state.epub;

    this.setState({
      ...this.state, modal_epub: {
        ...this.state.modal_epub,
        show: true,
        fontSize: reader_epub.fontSize,
        fontName: reader_epub.fontName,
        theme: reader_epub.theme,
      }
    });
  }

  closeModal_epub() {
    this.setState({ ...this.state, modal_epub: { ...this.state.modal_epub, show: false } });
  }

  modal_epub_render() {
    const font_list: IReader_schema_epub_fontName[] = ["zar", "iransans", "nunito"];
    const theme_list: IReader_schema_epub_theme[] = ["white", "dark", 'green', 'sepia'];

    return (
      <>
        <Modal show={this.state.modal_epub.show}
          className={"reader-overview-modal-epub theme-" + this.props.reader.epub.theme}
          onHide={() => this.closeModal_epub()}
          centered
        >
          <Modal.Body>
            <div className="row">
              <div className="col-12">
                <ul className="list-group list-group-flush">

                  <li className="list-group-item d-flex justify-content-between px-0 pt-0--">
                    <div className="text-capitalize">{Localization.text_size}</div>
                    <div>
                      <span className="mr-3">{this.state.modal_epub.fontSize}</span>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-light min-w-40px"
                          onClick={() => this.modal_epub_fontSizeChanged('down')}
                        ><i className="fa fa-minus"></i></button>
                        <button className="btn btn-light min-w-40px"
                          onClick={() => this.modal_epub_fontSizeChanged('up')}
                        ><i className="fa fa-plus"></i></button>
                      </div>
                    </div>
                  </li>

                  <li className="section-theme list-group-item d-flex justify-content-between px-0">
                    <div className="text-capitalize">{Localization.theme}</div>
                    <ToggleButtonGroup
                      className="btn-group-sm"
                      type="radio"
                      name="reader-epub-theme"
                      defaultValue={this.state.modal_epub.theme}
                      onChange={(theme: IReader_schema_epub_theme) => this.modal_epub_colorChanged(theme)}
                    >
                      {
                        theme_list.map(th => (
                          <ToggleButton
                            key={th}
                            className={"min-w-70px btn-light theme-" + th}
                            value={th}
                          >
                            {Localization.reader_theme_obj[th]}
                          </ToggleButton>
                        ))
                      }
                    </ToggleButtonGroup>
                  </li>

                  <li className="section-font list-group-item d-flex justify-content-between px-0 pb-0--">
                    <div className="text-capitalize">{Localization.font}</div>
                    <ToggleButtonGroup
                      className="btn-group-sm"
                      type="radio"
                      name="reader-epub-font"
                      defaultValue={this.state.modal_epub.fontName}
                      onChange={(fontName: IReader_schema_epub_fontName) => this.modal_epub_fontChanged(fontName)}
                    >
                      {
                        font_list.map(f => (
                          <ToggleButton
                            key={f}
                            className="min-w-70px btn-light"
                            value={f}
                          >
                            {Localization.font_obj[f]}
                          </ToggleButton>
                        ))
                      }
                    </ToggleButtonGroup>
                  </li>

                </ul>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="pt-0 border-top-0">
            <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_epub()}>
              {Localization.cancel}
            </button>
            <button className="btn btn-danger-- text-system btn-sm text-uppercase min-w-70px"
              onClick={() => this.modal_epub_confirm()}
            // disabled={!this.state.modal_epub.input.isValid}
            >
              {Localization.ok}
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }
  modal_epub_fontSizeChanged(change: 'up' | 'down') {
    let fs: number | undefined = this.state.modal_epub.fontSize;
    if (!fs) return;

    if (change === 'down') {
      if (fs <= 5) return;
      fs = fs - 1;
    } else if (change === 'up') {
      if (fs >= 50) return;
      fs = fs + 1;
    }

    this.setState({ modal_epub: { ...this.state.modal_epub, fontSize: fs } });
  }
  modal_epub_colorChanged(theme: IReader_schema_epub_theme) {
    this.setState({ modal_epub: { ...this.state.modal_epub, theme } });
  }
  modal_epub_fontChanged(fontName: IReader_schema_epub_fontName) {
    this.setState({ modal_epub: { ...this.state.modal_epub, fontName } });
  }
  modal_epub_confirm() {
    // debugger;
    // const reader_state = { ...Store2.getState().reader };
    const reader_state = { ...this.props.reader };
    const reader_epub = reader_state.epub;

    if (this.state.modal_epub.fontName) reader_epub.fontName = this.state.modal_epub.fontName!;
    if (this.state.modal_epub.fontSize) reader_epub.fontSize = this.state.modal_epub.fontSize!;
    if (this.state.modal_epub.theme) reader_epub.theme = this.state.modal_epub.theme!;

    // Store2.dispatch(action_update_reader(reader_state));
    this.props.update_reader(reader_state);
    this.gotoReader_reading(this.book_id);
  }
  //#endregion

  render() {
    return (
      <>
        <div className="row">
          <div className="col-12 px-0">
            <div className={"reader-overview-wrapper mt-3-- mb-5-- theme-" + this.props.reader.epub.theme}>
              {this.overview_header_render()}
              {this.overview_body_render()}
              {this.overview_footer_render()}
              {this.overview_sidebar_render()}

              <ContentLoader gutterClassName="gutter-0" show={this.state.page_loading}></ContentLoader>
            </div>
          </div>
        </div>

        {this.modal_goto_render()}
        {this.modal_epub_render()}

        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    update_reader: (reader: IReader_schema) => dispatch(action_update_reader(reader)),
  };
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
    network_status: state.network_status,
    reader: state.reader
  };
};

export const ReaderOverview = connect(state2props, dispatch2props)(ReaderOverviewComponent);
