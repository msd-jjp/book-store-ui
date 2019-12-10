import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutAccountHeader } from './header/Header';
import { LayoutAccountFooter } from './footer/Footer';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { History } from "history";

export const RouteLayoutAccount = ({ component: Component, ...rest }: { [key: string]: any }) => {
    return (
        <Route {...rest} render={matchProps => (
            <LayoutAccount {...matchProps}>
                <Component {...matchProps} />
            </LayoutAccount>
        )} />
    )
};

interface IProps {
    logged_in_user: IUser | null;
    history: History;
    // match: any;
}

class LayoutAccountComponent extends React.Component<IProps> {

    componentWillMount() {
        if (this.props.logged_in_user) {
            this.props.history.push("/dashboard");
        }
    }

    shouldComponentUpdate() {
        if (this.props.logged_in_user) {
            this.props.history.push("/dashboard");
            return false;
        }
        return true;
    }

    render() {
        return (
            <>
                <div className="layout-account-wrapper">
                    <LayoutAccountHeader />
                    <main className="main mx-3">
                        <div className="row">
                            <div className="col-md-4 offset-md-4">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
                    <LayoutAccountFooter />
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
        logged_in_user: state.logged_in_user,
    }
}

export const LayoutAccount = connect(state2props, dispatch2props)(LayoutAccountComponent);
