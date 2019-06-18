import { combineReducers, createStore, ReducersMapObject, AnyAction/* , Action */ } from 'redux';
import { redux_state } from './app_state';
import { reducer as UserReducer } from './reducer/user';

const reducers: ReducersMapObject<redux_state, AnyAction> = { // Action
    logged_in_user: UserReducer,
}

const main_reducer = combineReducers(reducers);

export const Store = createStore(main_reducer);