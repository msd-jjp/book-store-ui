import React from "react";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { IDownloadingBookFile_schema } from "../../redux/action/downloading-book-file/downloadingBookFileAction";
import {
    action_update_downloading_book_file
    // , action_reset_downloading_book_file
} from "../../redux/action/downloading-book-file";
import { CmpUtility } from "../_base/CmpUtility";
import { PartialDownload } from "./PartialDownload";
import { FILE_STORAGE_KEY } from "../../service/appLocalStorage/FileStorage";

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
    downloading_book_file: IDownloadingBookFile_schema[];
    update_downloading_book_file?: (data: IDownloadingBookFile_schema[]) => any;
    // reset_downloading_book_file?: () => any;
}
interface IState {
}

class BookFileDownloadComponent extends BaseComponent<IProps, IState> {
    state = {
    };

    private is_downloadInProgress = false;
    private downloadProgress_queue: { fileId: string; collectionName: FILE_STORAGE_KEY; }[] = [];
    private _partialDownload: PartialDownload | undefined;

    componentDidMount() {
        // this.props.reset_downloading_book_file!();
        this.downloadProgress_queue = this.props.downloading_book_file.map(dbf => {
            return {
                fileId: dbf.fileId,
                collectionName: dbf.collectionName
            }
        });
        this.checkDownload();
    }

    componentWillUnmount() {
        // this.props.reset_downloading_book_file!();
    }

    componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.network_status === NETWORK_STATUS.ONLINE && this.props.network_status === NETWORK_STATUS.OFFLINE) {
            this.checkDownload(nextProps);
        }

        if (JSON.stringify(nextProps.downloading_book_file) !== JSON.stringify(this.props.downloading_book_file)) {

            let new_dbf = [...nextProps.downloading_book_file];

            nextProps.downloading_book_file.forEach(d => {
                if (d.status === 'start') {
                    debugger;
                    const filtered_dbf = new_dbf.filter(nd => !(nd.fileId === d.fileId && nd.collectionName === d.collectionName));
                    new_dbf = filtered_dbf;
                    const new_d: IDownloadingBookFile_schema = { ...d, status: 'inProgress' };
                    new_dbf.push(new_d);
                    this.startDownload(d.fileId, d.collectionName);

                } else if (d.status === 'stop') {
                    debugger;
                    const filtered_dbf = new_dbf.filter(nd => !(nd.fileId === d.fileId && nd.collectionName === d.collectionName));
                    new_dbf = filtered_dbf;
                    this.stopDownload(d.fileId, d.collectionName);
                }
            });

            this.props.update_downloading_book_file!(new_dbf);
        }

    }

    async startDownload(fileId: string, collectionName: FILE_STORAGE_KEY) {
        this.downloadProgress_queue.push({ fileId, collectionName });

        this.checkDownload();
    }

    private checkDownload(nextProps?: IProps) {
        // console.log('downloadProgress_queue', this.downloadProgress_queue);
        if (!this.downloadProgress_queue.length) return;
        if (this.is_downloadInProgress) return;
        if (this.props.network_status === NETWORK_STATUS.OFFLINE &&
            !(nextProps && nextProps.network_status === NETWORK_STATUS.ONLINE)) return;

        this.is_downloadInProgress = true;
        const firstItem = this.downloadProgress_queue[0];
        this.downloadRequest(firstItem.fileId, firstItem.collectionName);
    }

    async stopDownload(fileId: string, collectionName: FILE_STORAGE_KEY) {
        const d_index = this.downloadProgress_queue.findIndex(obj => obj.fileId === fileId && obj.collectionName === collectionName);
        if (d_index === -1) return;

        // this.downloadProgress_queue.splice(d_index, 1);
        this.removeFrom_dp_queue(fileId, collectionName);

        if (d_index === 0) {
            // console.log('stopDownload book_id:', book_id);
            this._partialDownload && this._partialDownload.cancelDownloadFile();
        }
    }

    private removeFrom_dp_queue(fileId: string, collectionName: FILE_STORAGE_KEY): void {
        this.downloadProgress_queue = this.downloadProgress_queue.filter(obj => !(obj.fileId === fileId && obj.collectionName === collectionName));
    }

    downloadFinished(fileId: string, collectionName: FILE_STORAGE_KEY) {
        let dbf = [...this.props.downloading_book_file];
        const existing_list = dbf.filter(d => !(d.fileId === fileId && d.collectionName === collectionName));
        this.props.update_downloading_book_file!(existing_list);
        CmpUtility.refreshView();
    }

    private async downloadRequest(fileId: string, collectionName: FILE_STORAGE_KEY) {
        console.log('downloadRequest started: book_id', fileId);

        this._partialDownload = new PartialDownload(fileId, collectionName);
        let error: any = undefined;
        let canceled = false;
        let res = await this._partialDownload.downloadFile().catch(e => {
            error = e;
            if (e && e.message === 'download-canceled') {
                canceled = true;
            }
        });

        if (res) {
            // debugger;
            this.downloadFinished(fileId, collectionName);
            // this.downloadProgress_queue.splice(0, 1);
            this.removeFrom_dp_queue(fileId, collectionName);
            console.log('downloadRequest COMPLETED: book_id', fileId);
        } else {
            // debugger;
            console.log('downloadRequest ERROR: book_id', fileId, error);
        }

        await CmpUtility.waitOnMe((res || canceled) ? 0 : 2000);

        this.is_downloadInProgress = false;
        this.checkDownload();

    }


    render() { return (<></>); }

}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        update_downloading_book_file: (data: IDownloadingBookFile_schema[]) => dispatch(action_update_downloading_book_file(data)),
        // reset_downloading_book_file: () => dispatch(action_reset_downloading_book_file()),
    };
};

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        network_status: state.network_status,
        downloading_book_file: state.downloading_book_file,
    };
};

export const BookFileDownload = connect(state2props, dispatch2props)(BookFileDownloadComponent);
