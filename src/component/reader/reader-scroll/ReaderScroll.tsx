import React, { Fragment } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../../model/model.token";
import { ToastContainer } from "react-toastify";
// import { Localization } from "../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
// import { Dropdown } from "react-bootstrap";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
import Swiper from 'swiper';
// import { Virtual } from 'swiper/dist/js/swiper.esm';
import { ReaderWorker } from "../../../webworker/reader-worker/ReaderWorker"; // .reader";
// import { Store2 } from "../../../redux/store";
// import { readerWorker } from '../../../webworker/reader/reader';

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
  // virtualData: {
  //   slides: any[];
  // },
  swiper_slides: any[];
  page_loading: boolean;
}

class ReaderScrollComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined, // this.getBookFromLibrary(this.book_id),
    // virtualData: {
    //   slides: [],
    // },
    swiper_slides: [],
    page_loading: true,
  };

  private _personService = new PersonService();

  swiper_obj: Swiper | undefined;
  private book_page_length = 2500;
  private book_active_page = 372;

  constructor(props: IProps) {
    super(props);

    this._personService.setToken(this.props.token);
    this.book_id = this.props.match.params.bookId;
  }

  componentDidMount() {
    this.getData_readerWorker();
  }

  private _readerWorker: ReaderWorker | undefined;
  getData_readerWorker() {
    this._readerWorker = new ReaderWorker();
    if (!this._readerWorker) return;

    this._readerWorker.postMessage({
      book_active_page: this.book_active_page
    });

    // this._readerWorker.onmessage(this.onReceive_data_from_worker.bind(this));
    this._readerWorker.onmessage((data) => { this.onReceive_data_from_worker(data) });
  }

  onReceive_data_from_worker(data: { bookSlideList: any[]; active_slide: number | undefined; }) {
    console.log('main: Message received from worker', data);

    this.setState(
      { ...this.state, swiper_slides: data.bookSlideList },
      () => {
        this.initSwiper(data.bookSlideList, data.active_slide);
      }
    );

    this._readerWorker!.terminate();
  }

  componentWillUnmount() {
    if (this._readerWorker) { this._readerWorker.terminate(); }
  }

  getBookFromLibrary(book_id: string): IBook {
    const lib = this.props.library.data.find(lib => lib.book.id === book_id);
    return (lib! || {}).book;
  }

  getBookTitle(): string {
    const book: IBook | undefined = this.state.book;
    if (!book) return '';
    return book!.title;
  }

  initSwiper(slides: any[] = [], initialSlide: number = 0) {
    const self = this;
    // const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    // this.swiper_obj && this.swiper_obj.destroy(true, true);
    // let slides = [];

    this.swiper_obj = new Swiper('.swiper-container', {

      // virtual: {
      //   cache: true,
      //   slides: slides,
      //   renderExternal(data: Virtual) {
      //     // assign virtual slides data
      //     self.setState({
      //       virtualData: data,
      //     });
      //   },
      //   // renderSlide(slide: any, index: any) {
      //   //   console.log(slide, index);
      //   //   // self.setState({
      //   //   //   virtualData: slide,
      //   //   // });
      //   // },
      // },

      initialSlide: initialSlide,
      direction: 'vertical',
      // autoHeight: true,
      // slidesPerView: 3,
      mousewheel: true,
      // direction: 'vertical',
      // slidesPerView: undefined,
      autoHeight: true,
      spaceBetween: 32,
      // direction: 'vertical',
      slidesPerView: 'auto',
      // slidesPerView: 10, // 3
      freeMode: true,
      centeredSlides: true,
      // scrollbar: {
      //   el: '.swiper-scrollbar',
      // },
      // mousewheel: true,
      keyboard: true,
      // effect: 'flip',
      // normalizeSlideIndex: true,
      // speed: 30,
      // virtualTranslate:true,
      roundLengths: true,
      // watchOverflow: true,
      centerInsufficientSlides: true,
      grabCursor: true,
      simulateTouch: true,
      observer: true,
      observeParents: true,
      // init:


      on: {
        tap: function () {
          /* do something */
          console.log('tap');
          self.onSlideClicked();
        },
        init: function () {
          // console.log('init swiper, stop page loader here...');
          // todo: stop page loader
          // self.swiper_obj && self.swiper_obj.slideTo(3);

          // console.log('swiper_obj1:', self.swiper_obj);
          // setTimeout(() => {
          //   console.log('swiper_obj2:', self.swiper_obj);
          //   self.swiper_obj && self.swiper_obj.slideTo(initialSlide);
          //   self.setState({ page_loading: false });
          // }, 500);

          // self.swiper_slideTo_initialSlide(initialSlide);
          self.swiper_solid_slideTo_initialSlide(initialSlide);
        },

      }
    });
    // activeIndex && this.gotoIndex(activeIndex);

    // this.swiper_obj.on('touchMove', function(){
    //     console.log('touchMove');
    // })
  }

  swiper_solid_slideTo_initialSlide(initialSlide: number) {
    setTimeout(() => {
      this.swiper_obj && this.swiper_obj.slideTo(initialSlide, undefined, false);
      this.setState({ page_loading: false });
    }, 500);
    setTimeout(() => {
      this.swiper_obj && this.swiper_obj.slideTo(initialSlide, undefined, false);
    }, 1000);
  }

  /* _DELETE_ME */
  swiper_slideTo_initialSlide(initialSlide: number) {
    const maximum_wait = 1000;
    let waiting = 0;

    const goto_slide = () => {
      setTimeout(() => {

        console.log(
          'swiper_obj2: ', this.swiper_obj,
          ' --------------- ',
          'waiting: ', waiting,
          ' --------------- ',
          'initialSlide: ', initialSlide
        );

        if (this.swiper_obj) {
          this.swiper_obj.slideTo(initialSlide);
          this.setState({ page_loading: false });
        } else {
          if (waiting >= maximum_wait) {
            this.setState({ page_loading: false });
          } else {
            waiting = waiting + 100;
            goto_slide();
          }
        }

      }, waiting);
    };

    goto_slide();
  }

  reading_body_render() {
    return (
      <>
        <div className="scroll-body mx-3">

          {this.swiper_render()}

          <div className={
            "lds-roller-wrapper gutter-0 "
            + (this.state.page_loading ? '' : 'd-none')
          }>
            <div className="lds-roller">
              <div></div><div></div><div></div><div></div>
              <div></div><div></div><div></div><div></div>
            </div>
          </div>

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

  swiper_item_render(
    slide: { id: string; chapterTitle: string; isTitle: boolean; pages: { url: string; number: number }[] },
    // offset: any
  ) {
    if (slide.isTitle) {
      return (
        <>
          {/* <div className="swiper-slide" style={{ top: `${offset}px` }}> */}
          <div className="swiper-slide" >
            <div className="item-- text-center d-block-- my-4" >
              <h3 className="chapterTitle-- font-weight-normal">{slide.chapterTitle}</h3>
            </div>
          </div>
        </>
      )

    } else {
      const slide_pages = [...slide.pages];
      if (slide_pages.length < 3) {
        for (let i = 0; i < 3 - slide_pages.length; i++) {
          slide_pages.push({ number: -1, url: '' });
        }
      }
      return (
        <>
          {/* <div className="swiper-slide" style={{ top: `${offset}px` }}> */}
          <div className="swiper-slide" >
            <div className="item-wrapper" >
              {slide_pages.map((pg, pg_index) => {
                return (
                  <Fragment key={pg_index}>
                    <div className={
                      "item " +
                      ((pg.number === this.book_active_page) ? 'active ' : '') +
                      ((pg.number === -1) ? 'invisible' : '')
                    } onClick={() => this.onPageClicked(pg.number)}>
                      <div className="page-img-wrapper">
                        <img
                          className="page-img"
                          src={pg.url}
                          alt="book"
                        />
                      </div>
                      <div className="page-number text-muted">{pg.number}</div>
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

  swiper_render() {
    if (true) {
      // const vrtData: any = this.state.virtualData;
      const swiper_slides: any = this.state.swiper_slides;

      // let offset_dir = 'top';
      // let swiper_dir = '';
      // if (this.props.internationalization.rtl) {
      //   offset_dir = 'right';
      //   swiper_dir = 'rtl';
      // }

      return (
        <>
          <div className="app-swiper">
            <div className="swiper-container" >
              <div className="swiper-wrapper">
                {/* {vrtData.slides.map(( */}
                {swiper_slides.map((
                  slide: { id: string; chapterTitle: string; isTitle: boolean; pages: { url: string; number: number }[] },
                  index: any) => (
                    <Fragment key={slide.id}>
                      {this.swiper_item_render(slide/* , vrtData.offset */)}
                    </Fragment>
                  ))}
              </div>

              {/* <div className="swiper-scrollbar"></div> */}
            </div>
          </div>
        </>
      );
    }
  }

  private swiperTaped = false;
  onSlideClicked() {
    this.swiperTaped = true;
    setTimeout(() => { this.swiperTaped = false; }, 0);
  }

  onPageClicked(pg_number: number) {
    if (!this.swiperTaped) return;
    // debugger;
    console.log('pg_number: ', pg_number);
    // todo store active page number
    // make sure redux (reader) updated before chnage route.
    this.gotoReader_reading(this.book_id);
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
            <div className="reader-scroll-wrapper">
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

export const ReaderScroll = connect(state2props, dispatch2props)(ReaderScrollComponent);
