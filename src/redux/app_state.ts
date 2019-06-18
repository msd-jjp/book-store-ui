import { IUser } from '../model/model.user'

export interface redux_state {
    logged_in_user: IUser | undefined | null;
}