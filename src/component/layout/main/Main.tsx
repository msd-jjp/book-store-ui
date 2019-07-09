import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutMainHeader } from './header/Header';
import { LayoutMainFooter } from './footer/Footer';

import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { History } from "history";

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
}

class LayoutMainComponent extends React.Component<IProps> {
    /* componentDidMount(){
        debugger;
    } */
    /* componentWillUpdate() {
        debugger;
    } */
    componentWillMount() {
        // debugger;
        if (!this.props.logged_in_user) {
            this.props.history.push("/login");
        }
    }
    /* componentDidUpdate() {
        debugger;
    }
    componentDidMount(){
        debugger;
    } */
    shouldComponentUpdate(){
        // debugger;
        if (!this.props.logged_in_user) {
            this.props.history.push("/login");
            return false;
        }
        return true;
    }
    render() {
        // debugger;
        /* if (!this.props.logged_in_user) {
            this.props.history.push("/login");
            return (
                <div></div>
            );
        } */
        if (!this.props.logged_in_user) {
            return (
                <div></div>
            );
        }
        return (
            <>
                <div className="layout-main-wrapper">
                    <LayoutMainHeader />
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
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user
    }
}

export const LayoutMain = connect(state2props, dispatch2props)(LayoutMainComponent);
