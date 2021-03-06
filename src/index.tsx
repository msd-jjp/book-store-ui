import React from 'react';
import ReactDOM from 'react-dom';
import './asset/style/app/skin-default/style.scss';
import { App } from './component/app/App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { persistor, Store2 } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

ReactDOM.render(
    <Provider store={Store2}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>
    , document.getElementById('root')
);

serviceWorker.register({ onUpdate: openConfirmReloadModal });

function openConfirmReloadModal(registration: ServiceWorkerRegistration) {
    console.log('update modal should open now...');
}
