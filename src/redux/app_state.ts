import { IUser } from '../model/model.user'
import { TInternationalization } from '../config/setup';

export interface redux_state {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
}