import React from 'react';
import { Provider } from 'react-redux';
import { Store } from '../../redux/store';
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
import { Setup } from '../../config/setup';
import { Localization } from '../../config/localization';

const appRoutes = (
  <HashRouter>
    <Switch>

      <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
      <RouteLayoutMain exact path="/dashboard" component={Dashboard} />
      <RouteLayoutMain exact path="/user" component={User} />
      <RouteLayoutMain path="/user/create" component={CreateUser} />
      <RouteLayoutMain path="/role" component={Role} />
      <RouteLayoutMain path="/products" component={Products} />

      <RouteLayoutAccount path="/login" component={Login} />
      <RouteLayoutAccount path="/register" component={Register} />
      <Route component={NotFound} />

    </Switch>
  </HashRouter>
);

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    document.title = Localization.app_title;

    if (Setup.internationalization.rtl) {
      document.body.classList.add('rtl');
    }
  }
  // const App: React.FC = () => {
  render() {
    return (
      <Provider store={Store}>
        <div className="app">
          <Router>
            {appRoutes}
          </Router>
        </div>
      </Provider>
    );
  }
}

export /* default */ { App };
