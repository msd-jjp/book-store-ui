import { combineReducers, createStore, ReducersMapObject, AnyAction/* , Action */, applyMiddleware } from 'redux';
import { redux_state } from './app_state';
import { reducer as UserReducer } from './reducer/user';
import { reducer as InternationalizationReducer } from './reducer/internationalization';
import { IUser } from '../model/model.user';
import { Reducer } from 'redux';
import { TInternationalization } from '../config/setup';
import { IToken } from '../model/model.token';
import { reducer as TokenReducer } from './reducer/token';
import { reducer as AuthenticationReducer } from './reducer/authentication';
import { reducer as NetworkStatusReducer } from './reducer/network-status';
import { reducer as CartReducer } from './reducer/cart';
import logger from 'redux-logger'
//
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { NETWORK_STATUS } from '../enum/NetworkStatus';
import { ICartItem } from './action/cart/cartAction';

const reducers: ReducersMapObject<redux_state, AnyAction> = { // Action
  logged_in_user: UserReducer as Reducer<IUser | null, AnyAction>,
  internationalization: InternationalizationReducer as Reducer<TInternationalization, AnyAction>,
  token: TokenReducer as Reducer<IToken, AnyAction>,
  authentication: AuthenticationReducer as Reducer<string, AnyAction>,
  network_status: NetworkStatusReducer as Reducer<NETWORK_STATUS, AnyAction>,
  cart: CartReducer as Reducer<ICartItem[], AnyAction>,
}

const main_reducer = combineReducers(reducers);

export const Store = createStore(main_reducer, applyMiddleware(logger));

//////////////////////////////////////////////////

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, main_reducer)

/* export default () => {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
} */
export const Store2 = createStore(persistedReducer, applyMiddleware(logger));
export const persistor = persistStore(Store2);