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
    private downloadProgress_queue: { book_id: string; mainFile: boolean; }[] = [];
    private _partialDownload: PartialDownload | undefined;

    componentDidMount() {
        // debugger;
        // console.log('BookFileDownloadComponent componentDidMount');
        // if inprogress stop all of them. OR clear All of them --> clear all
        // this.props.reset_downloading_book_file!();
        this.downloadProgress_queue = this.props.downloading_book_file.map(dbf => {
            return {
                book_id: dbf.book_id,
                mainFile: dbf.mainFile
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
                    const filtered_dbf = new_dbf.filter(nd => !(nd.book_id === d.book_id && nd.mainFile === d.mainFile));
                    new_dbf = filtered_dbf;
                    const new_d: IDownloadingBookFile_schema = { ...d, status: 'inProgress' };
                    new_dbf.push(new_d);
                    this.startDownload(d.book_id, d.mainFile);

                } else if (d.status === 'stop') {
                    debugger;
                    const filtered_dbf = new_dbf.filter(nd => !(nd.book_id === d.book_id && nd.mainFile === d.mainFile));
                    new_dbf = filtered_dbf;
                    this.stopDownload(d.book_id, d.mainFile);
                }
            });

            this.props.update_downloading_book_file!(new_dbf);
        }

    }

    async startDownload(book_id: string, mainFile: boolean) {
        this.downloadProgress_queue.push({ book_id, mainFile });

        this.checkDownload();
        // this.downloadRequest(book_id, mainFile);
    }

    private checkDownload(nextProps?: IProps) {
        console.log('downloadProgress_queue', this.downloadProgress_queue);
        if (!this.downloadProgress_queue.length) return;
        if (this.is_downloadInProgress) return;
        // if(!nextProps || nextProps.network_status=== NETWORK_STATUS.OFFLINE)
        if (this.props.network_status === NETWORK_STATUS.OFFLINE &&
            !(nextProps && nextProps.network_status === NETWORK_STATUS.ONLINE)) return;

        this.is_downloadInProgress = true;
        const firstItem = this.downloadProgress_queue[0];
        this.downloadRequest(firstItem.book_id, firstItem.mainFile);
    }

    // private canceledBook: { book_id: string, mainFile: boolean } | undefined;
    async stopDownload(book_id: string, mainFile: boolean) {
        const d_index = this.downloadProgress_queue.findIndex(obj => obj.book_id === book_id && obj.mainFile === mainFile);
        if (d_index === -1) return;
        /* if (d_index === 0) {
            this.is_downloadInProgress = false;
        } */
        this.downloadProgress_queue.splice(d_index, 1);

        //stop axios
        /* const _cancelTokenSource = this.get_cancelToken(book_id, mainFile, true);
        _cancelTokenSource && _cancelTokenSource.cancel('download-canceled'); */
        if (d_index === 0) {
            console.log('stopDownload book_id:', book_id);
            this._partialDownload && this._partialDownload.cancelDownloadFile();
            // this.canceledBook = { book_id, mainFile };
        }
    }

    downloadFinished(book_id: string, mainFile: boolean) {
        let dbf = [...this.props.downloading_book_file];
        const existing_list = dbf.filter(d => !(d.book_id === book_id && d.mainFile === mainFile));
        this.props.update_downloading_book_file!(existing_list);
        // CmpUtility.waitOnMe(100);
        CmpUtility.refreshView();
    }

    private async downloadRequest(book_id: string, mainFile: boolean) {
        console.log('downloadRequest started: book_id', book_id);

        this._partialDownload = new PartialDownload(book_id, mainFile);
        let error: any = undefined;
        let canceled = false;
        let res = await this._partialDownload.downloadFile().catch(e => {
            debugger;
            error = e;
            if (e && e.message === 'download-canceled') {
                canceled = true;
            }
        });

        if (res) {
            debugger;
            this.downloadFinished(book_id, mainFile);
            this.downloadProgress_queue.splice(0, 1);
            console.log('downloadRequest COMPLETED: book_id', book_id);
        } else {
            debugger;
            // this.canceledBook = undefined;
            console.log('downloadRequest ERROR: book_id', book_id, error);
        }

        /* if (!(this.canceledBook && this.canceledBook.book_id === book_id && this.canceledBook.mainFile === mainFile)) {
            this.downloadFinished(book_id, mainFile);
            this.downloadProgress_queue.splice(0, 1);
        } else {
            this.canceledBook = undefined;
        } */
        // this.downloadFinished(book_id, mainFile);
        // console.log('downloadRequest finished: book_id', book_id);

        await CmpUtility.waitOnMe((res || canceled) ? 0 : 2000);

        this.is_downloadInProgress = false;
        // this.downloadProgress_queue.splice(0, 1);
        this.checkDownload();


        // if (downloadCanceled) return;

        // this.downloadFinished(book_id, mainFile);
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
