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
import { NavLink } from 'react-router-dom';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

class DashboardMoreComponent extends BaseComponent<IProps, any> {
    change(lang: string) {
        debugger;
        if (lang === 'fa') {
            if (!this.props.internationalization.rtl) {
                document.body.classList.add('rtl');
                Localization.setLanguage('fa');
                this.props.change_app_flag && this.props.change_app_flag({
                    rtl: true,
                    language: 'فارسی',
                    flag: 'fa',
                });
            }
        } else if (lang === 'en') {
            if (this.props.internationalization.rtl) {
                document.body.classList.remove('rtl');
                Localization.setLanguage('en');
                this.props.change_app_flag && this.props.change_app_flag({
                    rtl: false,
                    language: 'english',
                    flag: 'en',
                });
            }
        }

    }
    render() {

        return (
            <>
                <br />
                <br />

                <ul className="list-group list-group-flush__ text-center">
                    <NavLink className="list-group-item list-group-item-action" to="/register">{Localization.register}</NavLink>
                    <NavLink className="list-group-item list-group-item-action" to="/login"
                        style={{
                            borderBottom: 0
                        }}
                    >{Localization.login}</NavLink>
                </ul>

                <ul className="list-group list-group-horizontal list-group-flush__ text-center">
                    <button className="list-group-item list-group-item-action" onClick={() => this.change('fa')}>
                        <img src="static/media/img/flag/ir.png" alt="" width="50px" />
                    </button>
                    <button className="list-group-item list-group-item-action" onClick={() => this.change('en')}>
                        <img src="static/media/img/flag/us.png" alt="" width="50px" />
                    </button>
                </ul>


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

export const DashboardMore = connect(state2props, dispatch2props)(DashboardMoreComponent);
