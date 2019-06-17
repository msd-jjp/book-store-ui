import React from 'react';
// import User from '../user/User';
// import Role from '../role/Role';
// import { Route, Link, BrowserRouter as Router } from 'react-router-dom';
// import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom';
// import Dashboard from '../dashboard/Dashboard';
import Header from '../layout/main/header/Header';
import { Provider } from 'react-redux';
import { Store } from '../../redux/store';

const App: React.FC = () => {
  return (
    <Provider store={Store}>
      <div className="app container-fluid">
        <Header />
      </div>
    </Provider>

  );
}

export default App;
