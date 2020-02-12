import React from 'react';
import { Route } from 'react-router-dom';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
// import { IUser } from '../../../model/model.user';
import { History } from "history";
// import { IToken } from '../../../model/model.token';

export const RouteLayoutNoWrap = ({ component: Component, ...rest }: { [key: string]: any }) => {
    return (
        <Route {...rest} render={matchProps => (
            <LayoutNoWrap {...matchProps}>
                <Component {...matchProps} />
            </LayoutNoWrap>
        )} />
    )
};

interface IProps {
    // logged_in_user?: IUser | null;
    history: History;
    // token: IToken;
    match: any;
}

class LayoutNoWrapComponent extends React.Component<IProps> {

    render() {
        return (
            <>
                <div className="layout-nowrap-wrapper">
                    <main className="mx-3">
                        <div className="row">
                            <div className="col-lg-4 offset-lg-4 col-md-8 offset-md-2">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
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

export const LayoutNoWrap = connect(state2props, dispatch2props)(LayoutNoWrapComponent);
