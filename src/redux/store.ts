import { combineReducers, createStore, ReducersMapObject, AnyAction/* , Action */ } from 'redux';
import { redux_state } from './app_state';
import { reducer as UserReducer } from './reducer/user';
import { IUser } from '../model/model.user';
import { Reducer } from 'redux';

const reducers: ReducersMapObject<redux_state, AnyAction> = { // Action
    logged_in_user: UserReducer as Reducer<IUser | null, AnyAction>,
}

const main_reducer = combineReducers(reducers);

export const Store = createStore(main_reducer);