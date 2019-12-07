import { combineReducers, createStore, ReducersMapObject, AnyAction/* , Action *//* , applyMiddleware */ } from 'redux';
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
import { reducer as LibraryReducer } from './reducer/library';
import { reducer as CollectionReducer } from './reducer/collection';
import { reducer as SyncReducer } from './reducer/sync';
import { reducer as DownloadingBookFileReducer } from './reducer/downloading-book-file';
import { reducer as ReaderReducer } from './reducer/reader';
import { reducer as ReaderEngineReducer } from './reducer/reader-engine';
import { reducer as DeviceKeyReducer } from './reducer/device-key';

// import logger from 'redux-logger';
//
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { NETWORK_STATUS } from '../enum/NetworkStatus';
import { ICartItems } from './action/cart/cartAction';
import { ILibrary_schema } from './action/library/libraryAction';
import { ICollection_schema } from './action/collection/collectionAction';
import { ISync_schema } from './action/sync/syncAction';
import { IDownloadingBookFile_schema } from './action/downloading-book-file/downloadingBookFileAction';
import { IReader_schema } from './action/reader/readerAction';
import { IReaderEngine_schema } from './action/reader-engine/readerEngineAction';
import { IDeviceKey_schema } from './action/device-key/deviceKeyAction';

const reducers: ReducersMapObject<redux_state, AnyAction> = { // Action
  logged_in_user: UserReducer as Reducer<IUser | null, AnyAction>,
  internationalization: InternationalizationReducer as Reducer<TInternationalization, AnyAction>,
  token: TokenReducer as Reducer<IToken, AnyAction>,
  authentication: AuthenticationReducer as Reducer<string, AnyAction>,
  network_status: NetworkStatusReducer as Reducer<NETWORK_STATUS, AnyAction>,
  cart: CartReducer as Reducer<ICartItems, AnyAction>,
  library: LibraryReducer as Reducer<ILibrary_schema, AnyAction>,
  collection: CollectionReducer as Reducer<ICollection_schema, AnyAction>,
  sync: SyncReducer as Reducer<ISync_schema, AnyAction>,
  downloading_book_file: DownloadingBookFileReducer as Reducer<IDownloadingBookFile_schema[], AnyAction>,
  reader: ReaderReducer as Reducer<IReader_schema, AnyAction>,
  reader_engine: ReaderEngineReducer as Reducer<IReaderEngine_schema, AnyAction>,
  device_key: DeviceKeyReducer as Reducer<IDeviceKey_schema, AnyAction>,
}

const main_reducer = combineReducers(reducers);

// export const Store = createStore(main_reducer, applyMiddleware(logger));

//////////////////////////////////////////////////

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['reader_engine'],
}

const persistedReducer = persistReducer(persistConfig, main_reducer)

/* export default () => {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
} */
// export const Store2 = createStore(persistedReducer, applyMiddleware(logger));
export const Store2 = createStore(persistedReducer);
export const persistor = persistStore(Store2);