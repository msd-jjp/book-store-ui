import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutMainHeader } from './header/Header';
import { LayoutMainFooter } from './footer/Footer';

import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { History } from "history";
import { IToken } from '../../../model/model.token';
import { action_set_token } from '../../../redux/action/token';
import { action_user_logged_in } from '../../../redux/action/user';

export const RouteLayoutMain = ({ component: Component, ...rest }: { [key: string]: any }) => {
    // console.log("RouteLayout");
    //todo: logic for validate user 
    // debugger;

    return (
        <Route {...rest} render={matchProps => (
            <LayoutMain {...matchProps}>
                <Component {...matchProps} />
            </LayoutMain>
        )} />
    )
};

interface IProps {
    logged_in_user?: IUser | null;
    history: History;
    onUserLoggedIn?: (user: IUser) => void;
    onSetToken?: (token: IToken) => void;
    token: IToken;
}

class LayoutMainComponent extends React.Component<IProps> {

    componentWillMount() {
        // debugger;
        if (!this.props.logged_in_user) {
            this.props.history.push("/login");
            // this.setFromLocalStorage();
            /* if (!this.props.logged_in_user) {
                this.props.history.push("/login");
            } */
        }
    }

    /* setFromLocalStorage() {
        // todo: _DELETE_ME
        let user = localStorage.getItem('user');
        let token = localStorage.getItem('token');

        if (user) {
            this.props.onUserLoggedIn && this.props.onUserLoggedIn(JSON.parse(user));
        }
        if (token) {
            this.props.onSetToken && this.props.onSetToken(JSON.parse(token));
        }
    } */

    shouldComponentUpdate() {
        // debugger;
        if (!this.props.logged_in_user) {
            this.props.history.push("/login");
            return false;
        }
        return true;
    }
    render() {
        // debugger;
        if (!this.props.logged_in_user) {
            return (
                <div></div>
            );
        }
        return (
            <>
                <div className="layout-main-wrapper">
                    <LayoutMainHeader history={this.props.history} />
                    <main className="main mx-3">
                        <div className="row">
                            <div className="col-md-4 offset-md-4">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
                    <LayoutMainFooter />
                </div>
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
        onSetToken: (token: IToken) => dispatch(action_set_token(token))
    }
}

const state2props = (state: redux_state) => {
    // debugger;
    return {
        logged_in_user: state.logged_in_user,
        token: state.token
    }
}

export const LayoutMain = connect(state2props, dispatch2props)(LayoutMainComponent);
