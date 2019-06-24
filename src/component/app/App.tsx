import React from 'react';
import { Provider } from 'react-redux';
import { Store } from '../../redux/store';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Dashboard } from '../dashboard/Dashboard';
import User from '../user/User';
import CreateUser from '../user/CreateUser';
import Role from '../role/Role';
import Products from '../products/Products';
import { Login } from '../login/Login';
import { Register } from '../register/Register';
import NotFound from '../layout/main/not-found/NotFound';
import { RouteLayout } from '../layout/main/Main';

const appRoutes = (
  <Switch>

    <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
    <RouteLayout exact path="/dashboard" component={Dashboard} />
    <RouteLayout exact path="/user" component={User} />
    <RouteLayout path="/user/create" component={CreateUser} />
    <RouteLayout path="/role" component={Role} />
    <RouteLayout path="/products" component={Products} />

    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route component={NotFound} />

  </Switch>
);

class App extends React.Component<any, any> {
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
