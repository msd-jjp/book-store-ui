import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { TInternationalization, Setup } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import { Localization } from "../../../config/localization/localization";
import { PersonService } from "../../../service/service.person";
import { Dropdown, Modal } from "react-bootstrap";
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
import { book, IBookPosIndicator, IBookContent } from "../../../webworker/reader-engine/MsdBook";
import { appLocalStorage } from "../../../service/appLocalStorage";
import { Store2 } from "../../../redux/store";
import { ContentLoader } from "../../form/content-loader/ContentLoader";
import { ReaderUtility } from "../ReaderUtility";

interface IProps {
  internationalization: TInternationalization;
  history: History;
  match: any;
}

interface IState {
  book: IBook | undefined;
  virtualData: { // todo change to swiperVirtualData
    slides: any[],
  },
  RcSlider_value: number | undefined;
  is_sidebar_open: boolean;
  modal_goto: { show: boolean; input: { value: any; isValid: boolean } };
  page_loading: boolean;
}

class ReaderOverviewComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined, // this.getBookFromLibrary(this.book_id),
    virtualData: {
      slides: [],
    },
    RcSlider_value: undefined,
    is_sidebar_open: false,
    modal_goto: { show: false, input: { value: undefined, isValid: false } },
    page_loading: true,
  };

  private _personService = new PersonService();
  // private sliderSetting: Settings = {
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
  //   className: "center",
  //   centerMode: true,
  //   // infinite: true,
  //   centerPadding: "60px", // 4rem, 60px
  // };
  private swiper_obj: Swiper | undefined;
  private book_page_length = 1; // 2500;
  private book_active_page = 1; // 372;

  constructor(props: IProps) {
    super(props);

    // this._personService.setToken(this.props.token);
    this.book_id = this.props.match.params.bookId;
  }

  componentDidMount() {
    // this.updateUserCurrentBook_client();
    this.setBook_byId(this.book_id);
    // this.updateUserCurrentBook_server();
    this.generateReader();
  }

  // updateUserCurrentBook_client() {
  //   let logged_in_user = { ...this.props.logged_in_user! };
  //   if (!logged_in_user) return;
  //   const book = this.getBookFromLibrary(this.book_id);
  //   logged_in_user.person.current_book = book;
  //   this.props.onUserLoggedIn(logged_in_user);

  //   this.setState({ ...this.state, book: this.getBookFromLibrary(this.book_id) });
  // }

  getBookFromLibrary(book_id: string): IBook {
    // const lib = this.props.library.data.find(lib => lib.book.id === book_id);
    const lib = Store2.getState().library.data.find(lib => lib.book.id === book_id);
    return (lib! || {}).book;
  }

  setBook_byId(book_id: string) {
    this.setState({ ...this.state, book: this.getBookFromLibrary(book_id) });
  }

  // async updateUserCurrentBook_server() {
  //   if (!this.book_id) return;
  //   if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

  //   await this._personService.update(
  //     { current_book_id: this.book_id },
  //     this.props.logged_in_user!.person.id
  //   ).catch(e => {
  //     // this.handleError({ error: e.response });
  //   });
  // }

  overview_header_render() {
    return (
      <div className="overview-header">
        <div className="row">
          <div className="col-12">
            <div className="icon-wrapper">
              <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer"
                onClick={() => this.goBack()}
              ></i>

              <i className="fa fa-bars text-dark p-2 cursor-pointer"
                onClick={() => this.showSidebar()}
              ></i>

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
                      {Localization.recommend_this_book}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-capitalize"
                      as={NavLink} to={`/store`}
                    >
                      {Localization.shop_in_store}
                    </Dropdown.Item>
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
    await this.createBook();
    if (!this._bookInstance) return;
    this.initSwiper();
  }

  private _bookInstance!: book;
  private async createBook() {
    const bookFile = appLocalStorage.findBookMainFileById(this.book_id);
    if (!bookFile) {
      this.setState({ page_loading: false });
      this.bookFileNotFound_notify();
      return;
    }

    try {
      this._bookInstance = await ReaderUtility.createEpubBook(bookFile);
    } catch (e) {
      console.error(e);
      this.setState({ page_loading: false });
      this.readerError_notify();
    }
  }

  private _slide_pages!: { id: number, page: IBookPosIndicator }[];
  private initSwiper() {
    const bookPosList: IBookPosIndicator[] = this._bookInstance.getListOfPageIndicators();
    const bookContent: IBookContent[] = this._bookInstance.getContentList();
    // debugger;
    this._slide_pages = bookPosList.map((bpi, i) => { return { id: i, page: bpi } });
    this.book_page_length = this._slide_pages.length;
    this.book_active_page = 1;
    /** active page & more before and after of it */
    this.getPagePath(this.book_active_page - 1, this._slide_pages[this.book_active_page - 1].page);

    this.swiper_obj = new Swiper('.swiper-container', {
      virtual: {
        cache: true,
        slides: this._slide_pages,
        renderExternal: (data: Virtual) => {
          this.setState({
            virtualData: data,
          });
        }
      },
      initialSlide: this.book_active_page - 1,
      on: {
        doubleTap: () => {
        },
        tap: () => {
          this.onSlideClicked();
        },
        slideChange: () => {
          const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
          console.log('swiperChange --> call set_RcSlider_value', activeIndex);
          if (activeIndex || activeIndex === 0) {
            this.set_RcSlider_value(activeIndex + 1);
          }
        },
        init: () => {
          this.setState({ page_loading: false });
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
    // console.log('activeIndex', activeIndex);
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

  overview_body_render() {
    return (
      <>
        <div className="overview-body my-3--">
          <h5 className="book-title mt-3 text-center">{this.getBookTitle()}</h5>

          {/* {this.carousel_render()} */}
          {this.swiper_render()}

          <div className="page-location text-center text-muted">
            {this.getActivePage()}&nbsp;
            {Localization.of}&nbsp;
            {this.book_page_length}&nbsp;
            <i className="font-size-01 fa fa-circle mx-2"></i>&nbsp;
            {this.calc_current_read_percent()}
          </div>
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
    // console.log('getPagePath', pageIndex);
    // return this.getPageRenderedPath(pageIndex);
    console.log('getPagePath', pageIndex);
    this.getPagePathNear(pageIndex);
    return this.getPageRenderedPath(pageIndex, slide);
    // return this.bookInstance.renderNextPage();
    // return this.bookPage.sampleBookPage;
    // return `/static/media/img/sample-book-page/page-${pageIndex}.jpg`;
  }
  private _pageRenderedPath: any = {};
  private getPageRenderedPath(pageIndex: number, slide: IBookPosIndicator) {
    if (this._pageRenderedPath[pageIndex]) {
      return this._pageRenderedPath[pageIndex];
    } else {
      this._pageRenderedPath[pageIndex] = this._bookInstance.RenderSpecPage(slide);
      return this._pageRenderedPath[pageIndex];
    }
  }
  // private getPageRenderedPath(pageIndex: number) {
  //   if (this._pageRenderedPath[pageIndex]) {
  //     return this._pageRenderedPath[pageIndex];
  //   } else {
  //     if (!this.bookInstance.areWeAtEnd()) {
  //       this._pageRenderedPath[pageIndex] = 'true';
  //       setTimeout(() => {
  //         console.time('renderNextPage');
  //         this._pageRenderedPath[pageIndex] = this.bookInstance.renderNextPage();
  //         console.timeEnd('renderNextPage');
  //       }, 0)
  //       return this._pageRenderedPath[pageIndex];
  //     } else {
  //       return;
  //     }
  //   }
  // }



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
                      <div className="item cursor-pointer " onClick={() => this.onPageClicked(slide.id)}>
                        <div className="page-img-wrapper">
                          <img
                            className="page-img"
                            // src={`/static/media/img/sample-book-page/page-${slide.id}.jpg`}
                            // src={this.getPagePath(slide.id)}
                            src={this.getPagePath(slide.id, slide.page)}
                            alt="book"
                            loading="lazy"
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
  //                 <div className="item"
  //                 // onClick={() => this.onPageClicked()}
  //                 >
  //                   <div className="page-img-wrapper">
  //                     <img
  //                       className="page-img"
  //                       src={`/static/media/img/sample-book-page/page-${pageIndex + 1}.jpg`}
  //                       alt="book"
  //                     />
  //                   </div>
  //                   <div className="page-number">456</div>
  //                 </div>
  //               </div>
  //             ))}
  //           </Slider>
  //         </div>
  //       </>
  //     );
  //   }
  // }

  private swiperTaped = false;
  onSlideClicked() {
    this.swiperTaped = true;
    setTimeout(() => { this.swiperTaped = false; }, 0);
  }

  onPageClicked(pg_number: number) {
    if (!this.swiperTaped) return;
    // debugger;
    console.log('pg_number: ', pg_number);
    // TODO store active page number
    // make sure redux (reader) updated before chnage route.
    this.gotoReader_reading(this.book_id);
  }

  gotoReader_reading(book_id: string) {
    // if (this.props.history.length) {
    //   this.props.history.goBack();
    // }
    // this.props.history.push(`/reader/${book_id}/reading`);
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
    const defaultValue = this.book_active_page || 1;

    return (
      <>
        {/* <div> */}
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
        {/* </div> */}
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
            <i className="fa fa-headphones p-2 cursor-pointer"
              onClick={() => { }}
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

          <div className="overview-sidebar-body">
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
        <Modal show={this.state.modal_goto.show} onHide={() => this.closeModal_goto()} centered>
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
                <p>{Localization.formatString(Localization.you_are_reading_loaction_n, this.book_active_page)}</p>
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

  render() {
    return (
      <>
        <div className="row">
          <div className="col-12 px-0">
            <div className="reader-overview-wrapper mt-3-- mb-5--">
              {this.overview_header_render()}
              {this.overview_body_render()}
              {this.overview_footer_render()}
              {this.overview_sidebar_render()}

              <ContentLoader gutterClassName="gutter-0" show={this.state.page_loading}></ContentLoader>
            </div>
          </div>
        </div>

        {this.modal_goto_render()}
        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    // onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
  };
};

const state2props = (state: redux_state) => {
  return {
    // logged_in_user: state.logged_in_user,
    internationalization: state.internationalization,
    // token: state.token,
    // network_status: state.network_status,
    // library: state.library,
  };
};

export const ReaderOverview = connect(state2props, dispatch2props)(ReaderOverviewComponent);
