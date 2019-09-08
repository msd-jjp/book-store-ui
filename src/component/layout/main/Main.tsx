import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutMainHeader } from './header/Header';
import { LayoutMainFooter } from './footer/Footer';

import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { History } from "history";
import { LibraryService } from '../../../service/service.library';
import { CollectionService } from '../../../service/service.collection';
import { IToken } from '../../../model/model.token';
import { ILibrary } from '../../../model/model.library';
import { ICollection } from '../../../model/model.collection';
import { action_set_library_data } from '../../../redux/action/library';
import { action_set_collections_data } from '../../../redux/action/collection';
// import { IToken } from '../../../model/model.token';
// import { action_set_token } from '../../../redux/action/token';
// import { action_user_logged_in } from '../../../redux/action/user';
// import { NETWORK_STATUS } from '../../../enum/NetworkStatus';
// import { action_set_network_status } from '../../../redux/action/netwok-status';

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
    // onUserLoggedIn?: (user: IUser) => void;
    // onSetToken?: (token: IToken) => void;
    token: IToken;
    match: any;
    // set_network_status?: (network_status: NETWORK_STATUS) => any;
    set_library_data?: (data: ILibrary[]) => any;
    set_collections_data?: (data: ICollection[]) => any;
}

class LayoutMainComponent extends React.Component<IProps> {

    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    constructor(props: IProps) {
        super(props);
        this._libraryService.setToken(this.props.token);
        this._collectionService.setToken(this.props.token);
    }

    componentWillMount() {
        // debugger;
        if (!this.props.logged_in_user) {
            this.props.history.push("/login");

        } else {
            this.start_fetchingData();
        }
    }

    componentWillUnmount() {
        this.stop_fetchingData();
    }

    private fetch_timeout_timer: number = 30000; // in ms --> 30second
    start_fetchingData() {
        this.fetchLibrary();
        this.fetchCollection();
    }

    stop_fetchingData() {
        clearTimeout(this.fetchLibrary_timeout);
        clearTimeout(this.fetchCollection_timeout);
    }

    private fetchLibrary_timeout: any;
    async fetchLibrary() {
        await this._libraryService.getAll().then(res => {
            this.props.set_library_data &&
                this.props.set_library_data(res.data.result);
        }).catch(error => { });

        clearTimeout(this.fetchLibrary_timeout);
        this.fetchLibrary_timeout = setTimeout(() => {
            this.fetchLibrary();
        }, this.fetch_timeout_timer);
    }

    private fetchCollection_timeout: any;
    async fetchCollection() {
        await this._collectionService.getAll().then(res => {
            this.props.set_collections_data &&
                this.props.set_collections_data(res.data.result);
        }).catch(error => { });

        clearTimeout(this.fetchCollection_timeout);
        this.fetchCollection_timeout = setTimeout(() => {
            this.fetchCollection();
        }, this.fetch_timeout_timer);
    }

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
        // onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
        // onSetToken: (token: IToken) => dispatch(action_set_token(token)),
        // set_network_status: (network_status: NETWORK_STATUS) => dispatch(action_set_network_status(network_status)),
        set_library_data: (data: ILibrary[]) => dispatch(action_set_library_data(data)),
        set_collections_data: (data: ICollection[]) => dispatch(action_set_collections_data(data)),
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
