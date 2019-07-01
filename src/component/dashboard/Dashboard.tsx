import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { Localization } from '../../config/localization/localization';
import { BaseComponent } from '../_base/BaseComponent';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

class DashboardComponent extends BaseComponent<IProps, any> {

    logOut() {
        debugger;
        this.props.do_logout && this.props.do_logout();
    }
    change() {
        debugger;
        if (this.props.internationalization.rtl) {
            document.body.classList.remove('rtl');
            Localization.setLanguage('en');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: false,
                language: 'english',
                flag: 'en',
            });
        } else {
            document.body.classList.add('rtl');
            Localization.setLanguage('fa');
            this.props.change_app_flag && this.props.change_app_flag({
                rtl: true,
                language: 'فارسی',
                flag: 'fa',
            });
        }
    }
    render() {
        return (
            <>

                <div className="row">
                    <div className="col-md-3 offset-md-6">
                        <pre>{JSON.stringify(this.props.logged_in_user)}</pre>
                        {
                            this.props.logged_in_user &&
                            <div className="btn btn-light" onClick={() => this.logOut()}>log out</div>
                        }


                    </div>

                    <div className="col-md-3 offset-md-6">
                        <pre>rtl: {JSON.stringify(this.props.internationalization.rtl)}</pre>
                        <pre>language: {this.props.internationalization.language}</pre>
                        <pre>flag: {this.props.internationalization.flag}</pre>
                        <br />
                        <button className="btn btn-info" onClick={() => this.change()}>change</button>
                    </div>

                    {/* <div className="col-md-8">
                        <input type="file" className="forncontrol"/>
                    </div> */}
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
