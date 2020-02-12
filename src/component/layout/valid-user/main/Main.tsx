import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutMainHeader } from './header/Header';
import { LayoutMainFooter } from './footer/Footer';

import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
// import { IUser } from '../../../model/model.user';
import { History } from "history";
// import { IToken } from '../../../model/model.token';

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
    // logged_in_user?: IUser | null;
    history: History;
    // token: IToken;
    match: any;
}

class LayoutMainComponent extends React.Component<IProps> {

    render() {
        return (
            <>
                <div className="layout-main-wrapper">
                    <LayoutMainHeader {...this.props} />
                    <main className="main mx-3">
                        <div className="row">
                            {/* <div className="col-md-4 offset-md-4"> */}
                            <div className="col-lg-4 offset-lg-4 col-md-8 offset-md-2">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
                    <LayoutMainFooter {...this.props} />
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
        // logged_in_user: state.logged_in_user,
        // token: state.token
    }
}

export const LayoutMain = connect(state2props, dispatch2props)(LayoutMainComponent);
