import { IUser } from '../model/model.user'
import { TInternationalization } from '../config/setup';
import { IToken } from '../model/model.token';

export interface redux_state {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    token: IToken;
    authentication: string;
}