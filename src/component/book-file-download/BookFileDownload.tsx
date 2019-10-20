import React from "react";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { BookService } from "../../service/service.book";
import { ToastContainer } from "react-toastify";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { IDownloadingBookFile_schema } from "../../redux/action/downloading-book-file/downloadingBookFileAction";
import { action_update_downloading_book_file, action_reset_downloading_book_file } from "../../redux/action/downloading-book-file";
import { appLocalStorage } from "../../service/appLocalStorage";
import { CmpUtility } from "../_base/CmpUtility";

interface IProps {
    internationalization: TInternationalization;
    network_status: NETWORK_STATUS;
    downloading_book_file: IDownloadingBookFile_schema[];
    update_downloading_book_file?: (data: IDownloadingBookFile_schema[]) => any;
    reset_downloading_book_file?: () => any;
}
interface IState {

}

class BookFileDownloadComponent extends BaseComponent<IProps, IState> {
    state = {

    };
    private _bookService = new BookService();
    // constructor(props: IProps) {
    //     super(props);
    //     // this._bookService.setToken(this.props.token);
    // }

    componentDidMount() {
        // debugger;
        console.log('BookFileDownloadComponent componentDidMount');
        // if inprogress stop all of them. OR clear All of them --> clear all
        this.props.reset_downloading_book_file!();
    }

    componentWillUnmount() {
        // debugger;
        console.log('BookFileDownloadComponent componentWillUnmount');
        // if inprogress stop all of them. (probebly clear all of them).
        this.props.reset_downloading_book_file!();
    }

    componentWillReceiveProps(nextProps: IProps) {
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

        // check props.bookFileDownload, if changed:
        //  if found stop --> stop that request & remove it from redux
        //  if found start --> start downloading & replace it with inpropgress in redux
    }


    async startDownload(book_id: string, mainFile: boolean) {
        let res = await this._bookService.downloadFile(book_id, mainFile).catch(e => { });

        if (res) {
            appLocalStorage.storeBookFile(book_id, mainFile, res.data);
        }

        this.downloadFinished(book_id, mainFile);
    }

    async stopDownload(book_id: string, mainFile: boolean) {
        //stop axios
    }

    downloadFinished(book_id: string, mainFile: boolean) {
        let dbf = [...this.props.downloading_book_file];
        const existing_list = dbf.filter(d => !(d.book_id === book_id && d.mainFile === mainFile));
        this.props.update_downloading_book_file!(existing_list);
        // CmpUtility.waitOnMe(100);
        CmpUtility.refreshView();
    }

    render() {
        return (
            <>
                {/* <div className="book-file-download-wrapper mt-3"></div> */}
                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        );
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        update_downloading_book_file: (data: IDownloadingBookFile_schema[]) => dispatch(action_update_downloading_book_file(data)),
        reset_downloading_book_file: () => dispatch(action_reset_downloading_book_file()),
    };
};

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        network_status: state.network_status,
        downloading_book_file: state.downloading_book_file,
    };
};

export const BookFileDownload = connect(
    state2props,
    dispatch2props
)(BookFileDownloadComponent);
