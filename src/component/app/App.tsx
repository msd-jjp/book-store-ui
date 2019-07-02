import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, HashRouter } from 'react-router-dom';
import { Dashboard } from '../dashboard/Dashboard';
import User from '../user/User';
import CreateUser from '../user/CreateUser';
import Role from '../role/Role';
import Products from '../products/Products';
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
import { action_change_app_flag } from '../../redux/action/internationalization';
import { DashboardMore } from '../dashboard-more/DashboardMore';
import { Store } from '../store/Store';
import { Library } from '../library/Library';

const appRoutes = (
  <HashRouter>
    <Switch>

      <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
      <RouteLayoutMain exact path="/dashboard" component={Dashboard} />
      <RouteLayoutMain exact path="/user" component={User} />
      <RouteLayoutMain path="/user/create" component={CreateUser} />
      <RouteLayoutMain path="/role" component={Role} />
      <RouteLayoutMain path="/products" component={Products} />
      <RouteLayoutMain path="/dashboard-more" component={DashboardMore} />
      <RouteLayoutMain path="/store" component={Store} />
      <RouteLayoutMain path="/library" component={Library} />

      <RouteLayoutAccount path="/login" component={Login} />
      <RouteLayoutAccount path="/register" component={Register} />
      {/* <Route component={NotFound} /> */}
      <RouteLayoutMain component={NotFound} />

    </Switch>
  </HashRouter>
);

class AppComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    document.title = Localization.app_title;

    /* if (Setup.internationalization.rtl) {
      document.body.classList.add('rtl');
    } */
    if (props.internationalization.rtl) {
      document.body.classList.add('rtl');
    }
  }

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
    change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
  }
}

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization
  }
}

export const App = connect(state2props, dispatch2props)(AppComponent);
