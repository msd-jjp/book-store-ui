import React from 'react';
import { /* Link, */ BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';
import Dashboard from '../../../dashboard/Dashboard';
import User from '../../../user/User';
import Role from '../../../role/Role';
import NotFound from '../not-found/NotFound';
import Products from '../../../products/Products';
import CreateUser from '../../../user/CreateUser';
import Login from '../../../login/Login';

const appRoutes = (
    <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/user" component={User} />
        <Route path="/user/create" component={CreateUser} />
        <Route path="/role" component={Role} />
        <Route path="/products" component={Products} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
    </Switch>
);

class Header extends React.Component {
    render() {
        return (
            <Router>
                <ul>
                    <li>
                        <NavLink exact activeClassName="active" to="/">dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink exact activeClassName="active" to="/user">user</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/role">role</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/products">products</NavLink>
                    </li>
                    <li>
                        <NavLink activeClassName="active" to="/login">login</NavLink>
                    </li>
                </ul>
                {appRoutes}
            </Router>
        )
    }
}

export default Header;