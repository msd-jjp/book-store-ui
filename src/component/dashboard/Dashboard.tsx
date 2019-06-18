import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
}

class DashboardComponent extends React.Component<IProps, any> {

    logOut() {
        debugger;
        this.props.do_logout && this.props.do_logout();
    }
    render() {
        return (
            <>

                <div className="row">
                    <div className="col-md-3 offset-md-6">
                        <span>{JSON.stringify(this.props.logged_in_user)}</span>
                        {
                            this.props.logged_in_user &&
                            <div className="btn btn-light" onClick={() => this.logOut()}>log out</div>
                        }
                    </div>
                </div>
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

export const Dashboard = connect(state2props, dispatch2props)(DashboardComponent);
