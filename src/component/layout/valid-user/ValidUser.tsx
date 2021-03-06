import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { History } from "history";
import { BrowserRouter as Router, Route, Switch, Redirect, HashRouter } from 'react-router-dom';
import { RouteLayoutMain } from './main/Main';
import { Dashboard } from '../../page/dashboard/Dashboard';
import { DashboardMore } from '../../page/dashboard-more/DashboardMore';
import { Store } from '../../page/store/Store';
import { Library } from '../../page/library/Library';
import { BookDetail } from '../../page/book-detail/BookDetail';
import { Category } from '../../page/category/Category';
import { Search } from '../../page/search/Search';
import { Cart } from '../../page/cart/Cart';
import { Collection } from '../../page/library/collection/Collection';
import { CollectionUpdate } from '../../page/library/collection/collection-update/CollectionUpdate';
import { Profile } from '../../page/profile/Profile';
import { PurchaseHistory } from '../../page/purchase-history/PurchaseHistory';
import { RouteLayoutNoWrap } from './no-wrap/NoWrap';
import { ReaderOverview } from '../../page/reader/reader-overview/ReaderOverview';
import { ReaderReading } from '../../page/reader/reader-reading/ReaderReading';
import { ReaderScroll } from '../../page/reader/reader-scroll/ReaderScroll';
import { ReaderAudio } from '../../page/reader/reader-audio/ReaderAudio';
import { LayoutMainNotFound } from './main/not-found/NotFound';
import { BookFileDownload } from '../../other/book-file-download/BookFileDownload';
import { FetchIntervalWorker } from '../../../webworker/fetch-interval-worker/FetchIntervalWorker';
import { SyncWorker } from '../../../webworker/sync-worker/SyncWorker';
import { Settings } from '../../page/settings/Settings';
import { DeviceKey } from '../../other/device-key/DeviceKey';

const appValidUserRoutes = (
    <HashRouter>
        <Switch>

            <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
            <RouteLayoutMain exact path="/dashboard" component={Dashboard} />
            <RouteLayoutMain path="/dashboard-more/:paymentStatus?" component={DashboardMore} />
            <RouteLayoutMain path="/store" component={Store} />
            <RouteLayoutMain path="/library" component={Library} />
            <RouteLayoutMain path="/book-detail/:bookId" component={BookDetail} />
            <RouteLayoutMain path="/category/:searchType/:searchValue" component={Category} />
            <RouteLayoutMain path="/search/:searchQuery" component={Search} />
            <RouteLayoutMain path="/cart/:paymentStatus?" component={Cart} />
            <RouteLayoutMain path="/collection/:collectionTitle/:isUncollected?" component={Collection} />
            <RouteLayoutMain path="/collection-update/:collectionTitle" component={CollectionUpdate} />
            <RouteLayoutMain path="/profile" component={Profile} />
            <RouteLayoutMain path="/purchase-history" component={PurchaseHistory} />

            <RouteLayoutNoWrap path="/reader/:bookId/:isOriginalFile/overview" component={ReaderOverview} />
            <RouteLayoutNoWrap path="/reader/:bookId/:isOriginalFile/reading" component={ReaderReading} />
            <RouteLayoutNoWrap path="/reader/:bookId/:isOriginalFile/scroll" component={ReaderScroll} />
            <RouteLayoutNoWrap path="/reader/:bookId/:isOriginalFile/audio" component={ReaderAudio} />

            <RouteLayoutMain path="/settings" component={Settings} />

            <RouteLayoutMain component={LayoutMainNotFound} />

        </Switch>
    </HashRouter>
);

export const RouteLayoutValidUser = ({ ...rest }: { [key: string]: any }) => {
    return (
        <Route {...rest} render={matchProps => (
            <LayoutValidUser {...matchProps} />
        )} />
    )
};

interface IProps {
    logged_in_user: IUser | null;
    history: History;
    match: any;
}

class LayoutValidUserComponent extends React.Component<IProps> {

    private _fetchIntervalWorker = new FetchIntervalWorker();
    private _syncWorker = new SyncWorker();

    componentDidMount() { // componentWillMount
        // debugger;
        if (!this.props.logged_in_user) {
            // this.props.history.push("/login");

        } else {
            this.start_fetchingData();
            this._syncWorker.postMessage('check');
            // ReaderDownload.downloadReaderFiles();
            // DeviceKey.check();
        }
    }

    componentWillUnmount() {
        this.stop_fetchingData();
        this._fetchIntervalWorker.terminate();
        this._syncWorker.terminate();
    }

    start_fetchingData() {
        this._fetchIntervalWorker.postMessage({ type: 'start' });
    }

    stop_fetchingData() {
        this._fetchIntervalWorker.postMessage({ type: 'stop' });
    }

    shouldComponentUpdate() {
        // debugger;
        // if (!this.props.logged_in_user) {
        //     this.props.history.push("/login");
        //     return false;
        // }
        return true;
    }

    render() {
        // if (!this.props.logged_in_user) {
        //     return (
        //         <div></div>
        //     );
        // }
        return (
            <>
                <Router>{appValidUserRoutes}</Router>

                <BookFileDownload history={this.props.history} />
                <DeviceKey history={this.props.history} />
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

export const LayoutValidUser = connect(state2props, dispatch2props)(LayoutValidUserComponent);
