import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { BaseComponent } from '../_base/BaseComponent';
import Slider, { Settings } from 'react-slick';
import { Localization } from '../../config/localization/localization';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
    history: any;
}

class DashboardComponent extends BaseComponent<IProps, any> {
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
        rtl: false, // this.props.internationalization.rtl
        // adaptiveHeight: true,
        // slidesToScroll: 1,
        speed: 200,
        // touchThreshold: 20,
        // useCSS: false
        // useTransform: false
        // initialSlide: 5,
        // beforeChange: () => this.dragging = true,
        // afterChange: () => this.dragging = false,
    };

    bookListCategory = [
        'recomended_for_you',
        'new_release_in_bookstore',
        'more_by_writer'
    ];

    clickk(x: any, i: any) {
        // debugger;
        // if (this.dragging) return;
        // this.props.history.push('library');
    }
    getRandomHelenBookUrl(): string {
        let r = Math.floor(Math.random() * 9) + 1;
        return `static/media/img/sample-book/sample-book-h${r}.png`;
    }
    getRandomBookUrl(): string {
        let r = Math.floor(Math.random() * 12) + 1;
        return `static/media/img/sample-book/sample-book${r}.png`;
    }
    render() {

        let aa: any[] = [];
        for (let i = 0; i < 20; i++) { aa.push(i); }

        return (
            <>

                <div className="booklistCategory-wrapper mt-3">

                    {this.bookListCategory.map((category, cat_i) => (
                        <div key={cat_i} className="booklist-wrapper mt-3">
                            <h6 className="title">
                                {
                                    category === 'more_by_writer' ?
                                        Localization.formatString(Localization.more_by_writer, Localization.helen_hardet) :
                                        Localization[category]
                                }
                            </h6>
                            <div className="app-carousel">
                                <Slider {...this.sliderSetting} >
                                    {aa.map((x, i) => (
                                        <div key={i} className="item" onClick={() => this.clickk(x, i)}>
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
        internationalization: state.internationalization
    }
}

export const Dashboard = connect(state2props, dispatch2props)(DashboardComponent);
