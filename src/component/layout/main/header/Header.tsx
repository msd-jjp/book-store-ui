import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../../../redux/action/user';
import { redux_state } from '../../../../redux/app_state';

class LayoutMain_Header_Component extends React.Component<any> {
    /* logOut(history: any) {
        // AppState.isLogedIn = false;
        history.push('/login');
    } */
    async logOut() {
        debugger;
        // let res = await ServiceUIFrameContext.logout().catch...
        this.props.do_logout && this.props.do_logout();
    }
    logIn() {

    }
    renderLogIn() {
        return (
            <>
                {
                    !this.props.logged_in_user &&
                    // <div className="btn btn-light" onClick={() => this.logIn()}>log in</div>
                    <NavLink activeClassName="active" to="/login">login</NavLink>
                }
            </>
        )
    }
    renderLogOut() {
        return (
            <>
                {
                    this.props.logged_in_user &&
                    <span>{JSON.stringify(this.props.logged_in_user)}</span>
                }
                {
                    this.props.logged_in_user &&
                    <div className="d-inline-block text-success" onClick={() => this.logOut()}>log out</div>
                }
                {/* <Route render={({ history }) => (
                    <div className="d-inline-block text-danger cursor-pointer"
                        onClick={() => this.logOut()}>
                        <small>log out</small>
                    </div>
                )} /> */}
            </>
        )
    }
    render() {
        return (
            <>
                <ul>
                    <li>
                        <NavLink exact activeClassName="active" to="/dashboard">dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/user">user</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/role">role</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/products">products</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/login">login</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/register">register</NavLink>
                    </li>
                </ul>

                {this.renderLogOut()}
                {this.renderLogIn()}
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        do_logout: () => dispatch(action_user_logged_out()),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user
    }
}

export const LayoutMain_Header = connect(state2props, dispatch2props)(LayoutMain_Header_Component);
