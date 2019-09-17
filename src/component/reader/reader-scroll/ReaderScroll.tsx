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
import { Localization } from "../../../config/localization/localization";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
// import { Dropdown } from "react-bootstrap";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";
import Swiper from 'swiper';
import { Virtual } from 'swiper/dist/js/swiper.esm';
import { ReaderWorker } from "../../../webworker/reader/worker.reader";
// import { readerWorker } from '../../../webworker/reader/reader';
// import { WebWorkerSetup } from "../../../webworker/workerSetup";

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
  virtualData: {
    slides: any[],
  },
}

class ReaderScrollComponent extends BaseComponent<IProps, IState> {
  private book_id: string = '';

  state = {
    book: undefined, // this.getBookFromLibrary(this.book_id),
    virtualData: {
      slides: [],
    },
  };

  private _personService = new PersonService();

  swiper_obj: Swiper | undefined;
  private book_page_length = 2500;
  private book_tree: {
    chapter_list: {
      title: string;
      pages: string[];
    }[];
  } = {
      chapter_list: [],
    };
  private swiper_slide_list: {
    isTitle: boolean;
    chapterTitle: string;
    pages: number[];
  }[] | undefined;

  constructor(props: IProps) {
    super(props);

    this._personService.setToken(this.props.token);
    this.book_id = this.props.match.params.bookId;
    this.generate_book_tree_mock();
  }

  generate_book_tree_mock() {

  }

  async test_worker() {
    // const _window: any = window;
    // if (_window.Worker) {
    // const myWorker = new Worker("/static/webworker/reader/reader.js");
    const _readerWorker/* :Worker */ = await new ReaderWorker().init();

    if (!_readerWorker) return;
    console.log(_readerWorker);

    setTimeout(() => {
      _readerWorker.postMessage([53, 10]);
    }, 1000);

    _readerWorker.onmessage = function (e) {
      // result.textContent = e.data;
      console.log('Message received from worker', e);
      _readerWorker.terminate();
    }
    // } else {
    //   console.log('Your browser doesn\'t support web workers.')
    // }
  }

  componentDidMount() {
    // setTimeout(() => {
    //   this.initSwiper();
    // }, 3000);
    this.initSwiper();

    // setTimeout(() => {
    //   if (!this.swiper_obj) return;
    //   console.log('ssssssssss')
    //   this.swiper_obj!.params.slidesPerView = 'auto';
    //   this.swiper_obj!.update();
    // }, 3000);

    setTimeout(() => {
      this.test_worker();
    }, 3000);
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

  getBookTree(): Promise<any> {
    return new Promise((res, rej) => {
      res(this.book_tree);
    });
  }

  initSwiper() {
    const self = this;
    // const activeIndex = this.swiper_obj && this.swiper_obj!.activeIndex;
    // this.swiper_obj && this.swiper_obj.destroy(true, true);
    let slides = [];
    for (var i = 0; i < this.book_page_length; i += 1) { // 10
      slides.push({ name: 'Slide_' + (i + 1), id: i + 1 });
    }
    this.swiper_obj = new Swiper('.swiper-container', {
      // ...
      virtual: {
        slides: slides, // self.state.slides,
        renderExternal(data: Virtual) {
          // assign virtual slides data
          self.setState({
            virtualData: data,
          });
        }
      },


      direction: 'vertical',
      // autoHeight: true,
      // slidesPerView: 3,
      mousewheel: true,
      // direction: 'vertical',
      // slidesPerView: undefined,
      autoHeight: true,
      spaceBetween: 130,
      // direction: 'vertical',
      // slidesPerView: 'auto',
      freeMode: true,
      // scrollbar: {
      //   el: '.swiper-scrollbar',
      // },
      // mousewheel: true,


      on: {
        tap: function () {
          /* do something */
          console.log('tap');
          self.onPageClicked();
        },


      }
    });
    // activeIndex && this.gotoIndex(activeIndex);


    // this.swiper_obj.on('touchMove', function(){
    //     console.log('touchMove');
    // })
  }

  reading_body_render() {
    return (
      <>
        <div className="scroll-body">
          {this.swiper_render()}
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

  swiper_render() {
    if (true) {
      const vrtData: any = this.state.virtualData;

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
                {vrtData.slides.map((slide: any, index: any) => (
                  <Fragment key={slide.id}>
                    <div className="swiper-slide" style={{ top: `${vrtData.offset}px` }}>
                      <div className="item" >
                        <div className="item-header text-capitalize">chapter {slide.id}</div>

                        <div className="page-img-wrapper">
                          <img
                            className="page-img"
                            src={`/static/media/img/sample-book-page/page-${slide.id}.jpg`}
                            alt="book"
                          />
                        </div>
                      </div>
                    </div>
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

  onPageClicked() {
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
