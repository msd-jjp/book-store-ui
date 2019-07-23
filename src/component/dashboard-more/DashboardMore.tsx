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
// import { NavLink } from 'react-router-dom';
import { action_remove_token } from '../../redux/action/token';

import { History } from 'history';
import { action_remove_authentication } from '../../redux/action/authentication';

export interface IProps {
    logged_in_user?: IUser | null;
    do_logout: () => void;
    change_app_flag: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
    remove_token: () => void;
    history: History;
    remove_authentication: () => void;
}

class DashboardMoreComponent extends BaseComponent<IProps, any> {
    change(lang: string) {
        // debugger;
        if (lang === 'fa') {
            // if (!this.props.internationalization.rtl) {
            document.body.classList.add('rtl');
            Localization.setLanguage('fa');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: true,
                language: 'فارسی',
                flag: 'fa',
            });
            // }
        } else if (lang === 'en') {
            // if (this.props.internationalization.rtl) {
            document.body.classList.remove('rtl');
            Localization.setLanguage('en');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: false,
                language: 'english',
                flag: 'en',
            });
            // }
        } else if (lang === 'ar') {
            document.body.classList.add('rtl');
            Localization.setLanguage('ar');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: true,
                language: 'العربیه',
                flag: 'ar',
            });
        }

    }
    logout() {
        // debugger;
        this.props.do_logout();
        this.props.remove_token();
        this.props.remove_authentication();
        this.props.history.push('/login');
    }
    render() {

        return (
            <>
                <div className="dashboard-more-wrapper">
                    <ul className="more-list list-group list-group-flush">
                        <li className="more-item list-group-item p-align-0 d-flex align-items-center">
                            <i className="icon fa fa-refresh mr-3"></i>
                            <div className="wrapper d-inline">
                                <span className="text">{Localization.sync}</span>
                                <span className="sub-text d-block text-muted">Last synced on 06/12/2019, 11:25 AM</span>
                            </div>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-headphones mr-3"></i>
                            <span className="text text-capitalize">{Localization.read_listen_with_audible}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-leanpub mr-3"></i>
                            <span className="text text-capitalize">{Localization.book_update}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-free-code-camp mr-3"></i>
                            <span className="text text-capitalize">{Localization.reading_insights}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-cog mr-3"></i>
                            <span className="text text-capitalize">{Localization.settings}</span>
                        </li>


                        <li className="more-item list-group-item p-align-0" onClick={() => this.logout()}>
                            <i className="icon fa fa-sign-out mr-3"></i>
                            <span className="text text-capitalize">{Localization.log_out}</span>
                        </li>


                        <li className="more-item list-group-item p-align-0 flag">
                            <i className="icon fa fa-flag mr-3"></i>

                            <ul className="flag-list list-group list-group-horizontal list-group-flush__ text-center  p-0">
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('fa')}>
                                    <img src="/static/media/img/flag/ir.png" alt="" width="50px" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('en')}>
                                    <img src="/static/media/img/flag/us.png" alt="" width="50px" />
                                </button>
                                <button className="flag-btn list-group-item list-group-item-action" onClick={() => this.change('ar')}>
                                    <img src="/static/media/img/flag/ar.png" alt="" width="50px" />
                                </button>
                            </ul>
                        </li>


                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-info-circle mr-3"></i>
                            <span className="text text-capitalize">{Localization.info}</span>
                        </li>
                        <li className="more-item list-group-item p-align-0">
                            <i className="icon fa fa-twitch mr-3"></i>
                            <span className="text text-capitalize">{Localization.help_feedback}</span>
                        </li>
                    </ul>
                </div>

            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        do_logout: () => dispatch(action_user_logged_out()),
        change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
        remove_token: () => dispatch(action_remove_token()),
        remove_authentication: () => dispatch(action_remove_authentication()),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization
    }
}

export const DashboardMore = connect(state2props, dispatch2props)(DashboardMoreComponent);
