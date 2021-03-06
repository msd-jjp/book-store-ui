import { IUser } from '../model/model.user'
import { TInternationalization } from '../config/setup';
import { IToken } from '../model/model.token';
import { NETWORK_STATUS } from '../enum/NetworkStatus';
import { ICartItems } from './action/cart/cartAction';
import { ILibrary_schema } from './action/library/libraryAction';
import { ICollection_schema } from './action/collection/collectionAction';
import { ISync_schema } from './action/sync/syncAction';
import { IDownloadingBookFile_schema } from './action/downloading-book-file/downloadingBookFileAction';
import { IReader_schema } from './action/reader/readerAction';
import { IReaderEngine_schema } from './action/reader-engine/readerEngineAction';
import { IDeviceKey_schema } from './action/device-key/deviceKeyAction';
import { TAuthentication_schema } from './action/authentication/authenticationAction';

export interface redux_state {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    token: IToken | null;
    authentication: TAuthentication_schema;
    network_status: NETWORK_STATUS;
    cart: ICartItems;
    library: ILibrary_schema;
    collection: ICollection_schema;
    sync: ISync_schema;
    downloading_book_file: IDownloadingBookFile_schema[];
    reader: IReader_schema;
    reader_engine: IReaderEngine_schema;
    device_key: IDeviceKey_schema;
}
