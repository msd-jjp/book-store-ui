import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

class LibraryComponent extends BaseComponent<IProps, any> {

    render() {

        return (
            <>
                <div className="library-wrapper">
                    <div className="container-fluid__ library-menu pt-2">
                        <div className="row menu-wrapper">
                            <div className="col-3">
                                <div className="pl-2"><i className="fa fa-sliders text-dark"></i></div>
                            </div>
                            {/* <div className="col-2 filter-option">
                                <a href="" className="filter-link"><span className="">ALL</span></a>
                            </div>
                            <div className="col-4 filter-option">
                                <a href="" className="filter-link"><span className="">DOWNLOADED</span></a>
                            </div> */}
                            <div className="col-6 filter-option text-center">
                                <span className="filter-link text-uppercase">{Localization.all}</span>
                                <span className="filter-link text-uppercase">{Localization.downloaded}</span>
                            </div>
                            <div className="col-3 text-right">
                                <div className="pr-2"><i className="fa fa-filter text-dark"></i></div>
                            </div>
                        </div>
                    </div>
                    <div className="row-wrapper p-3__ mr-3 mt-3">
                        <div className="row library-grid-wrapper">
                            {
                                [1, 1, 1, 1, 1, 2, 1, 1, 3, 3, 4, 5, 2, 2, 2, 1, 2].map((item, index) => (
                                    <div className="col-4 m-0__ p-align-inverse-0 mb-3" key={index}>
                                        <div className="item-wrapper p-1__">
                                            <img src="static/media/img/icon/default-book.png"
                                                alt=""
                                                className="library-grid-book-show" />

                                            <div className="book-progress-state">
                                                <div className="bp-state-number">
                                                    <div className="text">7%</div>
                                                </div>
                                                <div className="bp-state-arrow" />
                                            </div>
                                            <div className="book-download">
                                                <i className="fa fa-check" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
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

export const Library = connect(state2props, dispatch2props)(LibraryComponent);
