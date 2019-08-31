import { IUser } from '../model/model.user'
import { TInternationalization } from '../config/setup';
import { IToken } from '../model/model.token';
import { NETWORK_STATUS } from '../enum/NetworkStatus';
import { ICartItems } from './action/cart/cartAction';
import { ILibrary_schema } from './action/library/libraryAction';

export interface redux_state {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    token: IToken;
    authentication: string;
    network_status: NETWORK_STATUS;
    cart: ICartItems;
    library: ILibrary_schema;
}