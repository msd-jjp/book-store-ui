import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, HashRouter } from 'react-router-dom';
import { Dashboard } from '../dashboard/Dashboard';
import { Login } from '../login/Login';
import { Register } from '../register/Register';
import NotFound from '../layout/main/not-found/NotFound';
import { RouteLayoutMain } from '../layout/main/Main';
import { RouteLayoutAccount } from '../layout/account/Account';
import { TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';

import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { DashboardMore } from '../dashboard-more/DashboardMore';
import { Store } from '../store/Store';
import { Library } from '../library/Library';
import { BookDetail } from '../book-detail/BookDetail';
import { ForgotPassword } from '../forgot-password/ForgotPassword';
import { Category } from '../category/Category';
import { Search } from '../search/Search';
import { appLocalStorage } from '../../service/appLocalStorage';
import { AppInitService } from '../../service/service.app-init';
// import { NETWORK_STATUS } from '../../enum/NetworkStatus';
import { BaseService } from '../../service/service.base';
// import { action_set_network_status } from '../../redux/action/netwok-status';
// import { Store2 } from '../../redux/store';

const appRoutes = (
  <HashRouter>
    <Switch>

      <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
      <RouteLayoutMain exact path="/dashboard" component={Dashboard} />
      <RouteLayoutMain path="/dashboard-more" component={DashboardMore} />
      <RouteLayoutMain path="/store" component={Store} />
      <RouteLayoutMain path="/library" component={Library} />
      <RouteLayoutMain path="/book-detail/:bookId" component={BookDetail} />
      <RouteLayoutMain path="/category/:searchType/:searchValue" component={Category} />
      <RouteLayoutMain path="/search/:searchQuery" component={Search} />

      <RouteLayoutAccount path="/login" component={Login} />
      <RouteLayoutAccount path="/register" component={Register} />
      <RouteLayoutAccount path="/forgot-password" component={ForgotPassword} />
      <RouteLayoutMain component={NotFound} />

    </Switch>
  </HashRouter>
);

interface IProps {
  internationalization: TInternationalization;
  // network_status: NETWORK_STATUS;
  // set_network_status?: (network_status: NETWORK_STATUS) => any;
}

class AppComponent extends React.Component<IProps, any> {
  private initStore = new appLocalStorage();
  private _appInitService = new AppInitService();

  constructor(props: any) {
    super(props);

    Localization.setLanguage(props.internationalization.flag);
    document.title = Localization.app_title;

    if (props.internationalization.rtl) {
      document.body.classList.add('rtl');
    }

    // if (BaseService.isAppOffline()) {
    //   // Store2.dispatch(action_set_network_status(NETWORK_STATUS.OFFLINE));
    //   this.props.set_network_status && this.props.set_network_status(NETWORK_STATUS.OFFLINE);
    // }
    BaseService.check_network_status();

  }

  /* check_network_status() {
    if (this.props.network_status === NETWORK_STATUS.ONLINE) {
      if (BaseService.isAppOffline()) {
        this.props.set_network_status && this.props.set_network_status(NETWORK_STATUS.OFFLINE);
      }

    } else if (this.props.network_status === NETWORK_STATUS.OFFLINE) {
      if (!BaseService.isAppOffline()) {
        this.props.set_network_status && this.props.set_network_status(NETWORK_STATUS.ONLINE);
      }
    }
  } */

  render() {
    return (
      <div className="app">
        <Router>
          {appRoutes}
        </Router>
      </div>
    );
  }
}


const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
    // set_network_status: (network_status: NETWORK_STATUS) => dispatch(action_set_network_status(network_status)),
  }
}

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
    // network_status: state.network_status
  }
}

export const App = connect(state2props, dispatch2props)(AppComponent);
