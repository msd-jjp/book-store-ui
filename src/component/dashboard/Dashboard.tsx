import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { BaseComponent, IHandleErrorResolve } from '../_base/BaseComponent';
import Slider, { Settings } from 'react-slick';
import { Localization } from '../../config/localization/localization';

import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
// import { Dropdown, ButtonGroup } from 'react-bootstrap';

import { History } from 'history';
import { IBook } from '../../model/model.book';
import { BookService } from '../../service/service.book';
import { IToken } from '../../model/model.token';
import { ToastContainer } from 'react-toastify';
import { BOOK_ROLES } from '../../enum/Book';
import { IPerson } from '../../model/model.person';


interface IProps {
    logged_in_user?: IUser | null;
    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
    history: History;
    token: IToken
}

interface IState {

}

class DashboardComponent extends BaseComponent<IProps, IState> {
    private _bookService = new BookService();
    // dragging!: boolean;
    sliderSetting: Settings = {
        dots: false,
        accessibility: false,
        // swipe: false,
        // infinite: false,
        // className: "center2",
        //centerPadding: "60px",
        // centerPadding: '40px',
        slidesToShow: 3,
        swipeToSlide: true,
        rtl: false, // this.props.internationalization.rtl,
        // adaptiveHeight: true,
        // slidesToScroll: 1,

        speed: 100, // 200, // 200,
        // touchThreshold: 100000000,
        // useCSS: false,
        // useTransform: false,

        // swipe: false,
        // initialSlide: 5,
        // beforeChange: () => this.dragging = true,
        // afterChange: () => this.dragging = false,
    };

    bookListCategory = [
        'recomended_for_you',
        'new_release_in_bookstore',
        'more_by_writer'
    ];

    componentDidMount() {
        this._bookService.setToken(this.props.token);
        this.fetchAllData();
    }

    fetchAllData() {
        this.fetchNewestBook();

        if (this.props.logged_in_user) {
            this.fetchRecomendedBook();

            let dcvds: any = this.props.logged_in_user;
            let vsdv: IPerson = dcvds;
            /* if (this.props.logged_in_user.person
                && this.props.logged_in_user.person.current_book
                && this.props.logged_in_user.person.current_book.roles
                && this.props.logged_in_user.person.current_book.roles.length
            ) { */
            if (
                vsdv.current_book
                && vsdv.current_book.roles
                && vsdv.current_book.roles.length
            ) {
                // let writerList = this.props.logged_in_user.person.current_book.roles
                let writerList = vsdv.current_book.roles
                    .filter(r => r.role === BOOK_ROLES.Writer);
                if (writerList.length) {
                    const writerId = writerList[0].person.id;
                    // const current_book_id = this.props.logged_in_user.person.current_book.id;
                    const current_book_id = vsdv.current_book.id;
                    this.fetchBookByWriter(writerId, current_book_id);
                }
            }
        }
    }


    gotoBookDetail(bookId: string) {
        // debugger;
        // if (this.dragging) return;
        // this.props.history.push('library');
        this.props.history.push(`book-detail/${bookId}`);
    }
    getRandomHelenBookUrl(): string {
        let r = Math.floor(Math.random() * 9) + 1;
        return `static/media/img/sample-book/sample-book-h${r}.png`;
    }
    getRandomBookUrl(): string {
        let r = Math.floor(Math.random() * 12) + 1;
        return `static/media/img/sample-book/sample-book${r}.png`;
    }

    readNow() {
        debugger;
    }

    async fetchRecomendedBook() {
        let bfdd = await this._bookService.recomended().catch(error => {
            this.handleError({ error: error.response });
        });
        debugger;
    }

    async fetchNewestBook() {
        let bfdd = await this._bookService.newest().catch(error => {
            this.handleError({ error: error.response });
        });
        debugger;
    }

    async fetchBookByWriter(person_id: string, book_id: string) {
        // let vfdbf = this.props.logged_in_user;
        let bfdd = await this._bookService.bookByWriter({
            person_id: person_id,
            book_id: book_id
        }).catch(error => {
            this.handleError({ error: error.response });
        });
        debugger;
    }

    carousel_render(bookList?: IBook[], tryAgain?: { errorText: string, retry: () => void }) {
        if (bookList && bookList.length) {
            return (
                <>
                    <div className="app-carousel" >
                        <Slider {...this.sliderSetting} >
                            {bookList.map((book: IBook, bookIndex) => (
                                <div key={bookIndex} className="item" onClick={() => this.gotoBookDetail(book.id)}>
                                    <img
                                        src={this.getRandomBookUrl()}
                                        alt="book"
                                    />
                                    <span className="item-number">{bookIndex}</span>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </>
            )
        } else if (tryAgain) {
            // let ErrorResolve: IHandleErrorResolve = this.handleError({ error: error.response, notify: false });
            return (
                <>
                    {/* <div>{ErrorResolve.body}</div> */}
                    <div>{tryAgain.errorText}</div>
                    <div onClick={() => tryAgain.retry()}>retry</div>
                </>
            )
        } else {

        }
    }

    render() {

        let aa: any[] = [];
        for (let i = 0; i < 20; i++) { aa.push(i); }

        return (
            <>

                <div className="latestBook-wrapper row mt-3">
                    <div className="col-4 book-img-wrapper">
                        <img className=""
                            src="static/media/img/sample-book/sample-book.png"
                            alt="book" />
                    </div>
                    <div className="col-8 book-detail-wrapper p-align-0">
                        <h6 className="title">unchaned blood bond</h6>
                        <h6 className="more">parts 1,2,3</h6>
                        <div className="writer text-muted mb-2 mt-1">
                            <small>helen hardet</small>
                        </div>

                        <Dropdown as={ButtonGroup} className="book-btns">
                            <Button variant="dark" className="btn-read-now"
                                onClick={() => this.readNow()}>read now</Button>

                            <Dropdown.Toggle split variant="light" className="ml-2" id="dropdown-split-basic" >
                                <i className="fa fa-ellipsis-v"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item >view in store</Dropdown.Item>
                                <Dropdown.Item >add to collection</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">mark as read</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">share progress</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">recommend this book</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">remove from device</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">remove from home</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </div>
                </div>

                <div className="booklistCategory-wrapper mt-3">
                    <div className="booklist-wrapper mt-3">
                        <h6 className="title">{Localization.recomended_for_you}</h6>
                        {this.carousel_render(aa)}
                    </div>





                    {this.bookListCategory.map((category, cat_i) => (
                        <div key={cat_i} className="booklist-wrapper mt-3">
                            <h6 className="title">
                                {
                                    category === 'more_by_writer' ?
                                        Localization.formatString(Localization.more_by_writer, Localization.helen_hardet) :
                                        Localization[category]
                                }
                            </h6>
                            {/* style={{direction: "rtl"}} */}
                            <div className="app-carousel" >
                                <Slider {...this.sliderSetting} >
                                    {aa.map((x, i) => (
                                        <div key={i} className="item" >
                                            <img
                                                src={category === 'more_by_writer' ? this.getRandomHelenBookUrl() : this.getRandomBookUrl()}
                                                alt="book"
                                            />
                                            <span className="item-number">{i}</span>
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    ))}

                </div>


                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        do_logout: () => dispatch(action_user_logged_out()),
        change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        token: state.token
    }
}

export const Dashboard = connect(state2props, dispatch2props)(DashboardComponent);
