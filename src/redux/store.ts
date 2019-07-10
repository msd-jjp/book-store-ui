import { combineReducers, createStore, ReducersMapObject, AnyAction/* , Action */, applyMiddleware } from 'redux';
import { redux_state } from './app_state';
import { reducer as UserReducer } from './reducer/user';
import { reducer as InternationalizationReducer } from './reducer/internationalization';
import { IUser } from '../model/model.user';
import { Reducer } from 'redux';
import { TInternationalization } from '../config/setup';
import { IToken } from '../model/model.token';
import { reducer as TokenReducer } from './reducer/token';
import logger from 'redux-logger'

const reducers: ReducersMapObject<redux_state, AnyAction> = { // Action
    logged_in_user: UserReducer as Reducer<IUser | null, AnyAction>,
    internationalization: InternationalizationReducer as Reducer<TInternationalization, AnyAction>,
    token: TokenReducer as Reducer<IToken, AnyAction>,
}

const main_reducer = combineReducers(reducers);

export const Store = createStore(main_reducer,applyMiddleware(logger));