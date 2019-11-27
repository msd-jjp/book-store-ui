import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, HashRouter } from 'react-router-dom';
import { Login } from '../login/Login';
import { Register } from '../register/Register';
import { RouteLayoutAccount } from '../layout/account/Account';
import { TInternationalization } from '../../config/setup';
import { Localization } from '../../config/localization/localization';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { ForgotPassword } from '../forgot-password/ForgotPassword';
import { appLocalStorage } from '../../service/appLocalStorage';
import { AppInitService } from '../../service/service.app-init';
import { BaseService } from '../../service/service.base';
import { Modal } from 'react-bootstrap';
import { RouteLayoutValidUser } from '../layout/valid-user/ValidUser';
import { ReaderDownload } from '../../webworker/reader-engine/reader-download/reader-download';

const appRoutes = (
  <HashRouter>
    <Switch>

      <Route exact path="/" component={() => <Redirect to="/dashboard" />} />
      <RouteLayoutValidUser exact path="/dashboard" />
      <RouteLayoutValidUser path="/dashboard-more/:paymentStatus?" />
      <RouteLayoutValidUser path="/store" />
      <RouteLayoutValidUser path="/library" />
      <RouteLayoutValidUser path="/book-detail/:bookId" />
      <RouteLayoutValidUser path="/category/:searchType/:searchValue" />
      <RouteLayoutValidUser path="/search/:searchQuery" />
      <RouteLayoutValidUser path="/cart/:paymentStatus?" />
      <RouteLayoutValidUser path="/collection/:collectionTitle/:isUncollected?" />
      <RouteLayoutValidUser path="/collection-update/:collectionTitle" />
      <RouteLayoutValidUser path="/profile" />
      <RouteLayoutValidUser path="/purchase-history" />

      <RouteLayoutAccount path="/login" component={Login} />
      <RouteLayoutAccount path="/register" component={Register} />
      <RouteLayoutAccount path="/forgot-password" component={ForgotPassword} />

      <RouteLayoutValidUser path="/reader/:bookId/overview" />
      <RouteLayoutValidUser path="/reader/:bookId/reading" />
      <RouteLayoutValidUser path="/reader/:bookId/scroll" />
      <RouteLayoutValidUser path="/reader/:bookId/audio" />

      <RouteLayoutValidUser />

    </Switch>
  </HashRouter>
);

interface IProps {
  internationalization: TInternationalization;
}
interface IState {
  showConfirmReloadModal: boolean;
}

class AppComponent extends React.Component<IProps, IState> {
  private initStore = new appLocalStorage();
  private _appInitService = new AppInitService();
  state = {
    showConfirmReloadModal: false,
  }

  constructor(props: IProps) {
    super(props);

    Localization.setLanguage(props.internationalization.flag);
    document.title = Localization.app_title;

    if (props.internationalization.rtl) {
      document.body.classList.add('rtl');
    }

    BaseService.check_network_status();
  }

  componentWillMount() {
    ReaderDownload.downloadReaderFiles();
    ReaderDownload.createWorkerAfterDownload();
  }
  componentDidMount() {
    this.event_confirmReloadModal();
  }

  event_confirmReloadModal() {
    window.addEventListener("app-event-newContentAvailable", () => {
      this.setState({ ...this.state, showConfirmReloadModal: true });
    });
    console.log('-------mozila check 2:--------------- addEventListener app-event-newContentAvailable ------------');
  }

  closeModal_confirmReload() {
    this.setState({ ...this.state, showConfirmReloadModal: false });
  }

  confirmModal_confirmReload() {
    window.location.reload();
  }

  modal_confirmReload_render() {
    return (
      <>
        <Modal show={this.state.showConfirmReloadModal} onHide={() => this.closeModal_confirmReload()}
          centered
          backdrop='static'>
          <Modal.Body>{Localization.msg.ui.new_vesion_available_update}</Modal.Body>
          <Modal.Footer className="pt-0 border-top-0">
            <button className="btn btn-light-- btn-sm btn-link text-muted text-uppercase min-w-70px" onClick={() => this.closeModal_confirmReload()}>
              {Localization.dont_want_now}
            </button>
            <button className="btn btn-system-- text-system btn-sm text-uppercase min-w-70px" onClick={() => this.confirmModal_confirmReload()}>
              {Localization.update}
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  render() {
    return (
      <div className="app">
        <Router>
          {appRoutes}
        </Router>

        {this.modal_confirmReload_render()}
      </div>
    );
  }
}


const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
  }
}

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
  }
}

export const App = connect(state2props, dispatch2props)(AppComponent);
