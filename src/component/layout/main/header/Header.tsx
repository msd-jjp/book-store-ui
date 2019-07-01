import React from 'react';
// import { NavLink } from 'react-router-dom';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../../../redux/action/user';
import { redux_state } from '../../../../redux/app_state';

class LayoutMainHeaderComponent extends React.Component<any> {
    
    render() {
        return (
            <>
                <input type="text" className="form-control" />
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

export const LayoutMainHeader = connect(state2props, dispatch2props)(LayoutMainHeaderComponent);
