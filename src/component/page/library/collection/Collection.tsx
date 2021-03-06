import React, { Fragment } from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
import { IUser } from '../../../../model/model.user';
import { TInternationalization } from '../../../../config/setup';
import { BaseComponent } from '../../../_base/BaseComponent';
import { Localization } from '../../../../config/localization/localization';
import { ToastContainer } from 'react-toastify';
import { Modal, Dropdown } from 'react-bootstrap';
import { BtnLoader } from '../../../form/btn-loader/BtnLoader';
import { History } from "history";
import { ILibrary } from '../../../../model/model.library';
import { ICollection } from '../../../../model/model.collection';
import { action_set_collections_data, action_set_collections_view } from '../../../../redux/action/collection';
import { ILibrary_schema } from '../../../../redux/action/library/libraryAction';
import { ICollection_schema } from '../../../../redux/action/collection/collectionAction';
import { COLLECTION_VIEW } from '../../../../enum/Library';
import { NavLink } from 'react-router-dom';
import { CollectionService } from '../../../../service/service.collection';
import { AddToCollection } from './add-to-collection/AddToCollection';
import { IBook } from '../../../../model/model.book';
import { NETWORK_STATUS } from '../../../../enum/NetworkStatus';
import {
    libraryItem_viewList_render, libraryItem_viewGrid_render,
    is_libBook_downloaded, collection_download, markAsRead_libraryItem,
    markAsUnRead_libraryItem, is_libBook_downloading, start_download_book
} from '../libraryViewTemplate';
import { CmpUtility } from '../../../_base/CmpUtility';

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    history: History;
    match: any;

    library: ILibrary_schema;
    set_collections_view: (view: COLLECTION_VIEW) => any;
    collection: ICollection_schema;
    set_collections_data: (data: ICollection[]) => any;
    network_status: NETWORK_STATUS;
}

interface IState {
    collection_library_data: ILibrary[];
    collection_library_data_selected: ILibrary[];
    modal_downloadCollections: {
        show: boolean;
        loader: boolean;
    };
    isCollection_editMode: boolean;
    remove_loader: boolean;
    modal_addToCollections: {
        show: boolean;
    };
}

class CollectionComponent extends BaseComponent<IProps, IState> {
    state = {
        collection_library_data: [],
        collection_library_data_selected: [],
        modal_downloadCollections: {
            show: false,
            loader: false
        },
        isCollection_editMode: false,
        remove_loader: false,
        modal_addToCollections: {
            show: false
        },
    }

    private _collectionService = new CollectionService();
    private collectionTitle: string = '';
    private isUncollected: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.collectionTitle = this.props.match.params.collectionTitle;
        this.isUncollected = (this.props.match.params.isUncollected === 'true');
    }

    componentDidMount() {
        this.set_col_libraryData();
    }

    get_col_libraryData(): ILibrary[] {
        if (this.isUncollected) {
            return this.get_uncollectedCol_libraryData();

        } else {
            let thisCol: ICollection | undefined =
                this.props.collection.data.find(col => col.title === this.collectionTitle);

            let collection_library_data: ILibrary[] = [];
            if (thisCol) {
                thisCol.books.forEach(bk => {
                    for (let i = 0; i < this.props.library.data.length; i++) {
                        let lib = this.props.library.data[i];
                        if (lib.book.id === bk.id) {
                            collection_library_data.push(lib);
                            break;
                        }
                    }
                });

                return collection_library_data;
            }
            return [];
        }
    }

    get_uncollectedCol_libraryData(): ILibrary[] {
        // let uncollected_book_list_length = 0;
        let collected_book_id_list: string[] = [];
        let collected_book_id_list_unique: string[] = [];

        this.props.collection.data.forEach((coll: ICollection) => {
            let b_ids = coll.books.map(b => b.id);
            collected_book_id_list = [...collected_book_id_list, ...b_ids]
        });
        collected_book_id_list_unique = Array.from(new Set(collected_book_id_list));

        // uncollected_book_list_length = this.props.library.data.length - collected_book_id_list_unique.length;
        let uncollected_books_lib: ILibrary[] = [];
        for (let i = 0; i < this.props.library.data.length; i++) {
            let lib = this.props.library.data[i];
            if (!collected_book_id_list_unique.includes(lib.book.id)) {
                uncollected_books_lib.push(lib);
                // break;
            }
        }
        return uncollected_books_lib;
    }

    set_col_libraryData() {
        this.setState({
            ...this.state,
            collection_library_data: this.get_col_libraryData()
        });
    }

    collection_header_render() {
        return (
            <div className="collection-menu pt-2__">
                <div className="row menu-wrapper__">
                    <div className="col-6">
                        <div className="icon-wrapper">
                            <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer"
                                onClick={() => this.goBack()}
                            ></i>

                            <div className="title h4 text-capitalize d-inline-block mb-0 font-weight-normal"
                                title={
                                    this.isUncollected === true ?
                                        Localization.uncollected :
                                        this.collectionTitle
                                }>{
                                    this.isUncollected === true ?
                                        Localization.uncollected :
                                        this.collectionTitle
                                }</div>
                        </div>
                    </div>

                    <div className="col-6 text-right ">
                        <div className="icon-wrapper">

                            {
                                (
                                    this.state.isCollection_editMode
                                    // && this.state.collection_library_data_selected.length
                                ) ?
                                    <Dropdown className={
                                        "d-inline-block-- collection-menu-dd mr-3 "
                                        + (!this.state.collection_library_data.length ?
                                            'd-none' : 'd-inline-block')
                                    }>
                                        <Dropdown.Toggle
                                            as="span"
                                            id="dropdown-collection-menu"
                                            className="icon fa-- fa-ellipsis-v-- text-dark p-2-- "
                                        >
                                            {this.state.collection_library_data_selected.length}
                                            &nbsp;
                                        {Localization.selected}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="dropdown-menu-right border-0 shadow2">
                                            <Dropdown.Item
                                                onClick={() => this.selectAll_libraryData()}
                                                className={
                                                    "text-uppercase "
                                                    + (this.state.collection_library_data_selected.length ===
                                                        this.state.collection_library_data.length
                                                        ? 'd-none' : '')
                                                }
                                            >{Localization.select_all}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.deselectAll_libraryData()}
                                                className={
                                                    "text-uppercase "
                                                    + (this.state.collection_library_data_selected.length === 0 ? 'd-none' : '')
                                                }
                                            >{Localization.deselect_all}
                                            </Dropdown.Item>

                                            <Dropdown.Divider
                                                className={
                                                    (!this.state.collection_library_data_selected.length ? 'd-none' : '')
                                                }
                                            />

                                            <Dropdown.Item
                                                onClick={() => this.openModal_addToCollections()}
                                                className={
                                                    "text-capitalize "
                                                    + (!this.state.collection_library_data_selected.length ? 'd-none ' : '')
                                                    + (this.state.collection_library_data_selected.length === 1 ? '' : 'd-none')
                                                }
                                                disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                                            >
                                                {Localization.add_to_collection}
                                                {
                                                    this.props.network_status === NETWORK_STATUS.OFFLINE
                                                        ? <i className="fa fa-wifi text-danger"></i> : ''
                                                }
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.markAsRead()}
                                                className={
                                                    "text-capitalize "
                                                    + (!this.state.collection_library_data_selected.length ? 'd-none' : '')
                                                }
                                                disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                                            >
                                                {Localization.mark_as_read}
                                                {
                                                    this.props.network_status === NETWORK_STATUS.OFFLINE
                                                        ? <i className="fa fa-wifi text-danger"></i> : ''
                                                }
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.markAsUnRead()}
                                                className={
                                                    "text-capitalize "
                                                    + (!this.state.collection_library_data_selected.length ? 'd-none' : '')
                                                }
                                                disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                                            >
                                                {Localization.mark_as_unRead}
                                                {
                                                    this.props.network_status === NETWORK_STATUS.OFFLINE
                                                        ? <i className="fa fa-wifi text-danger"></i> : ''
                                                }
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.viewInStore()}
                                                className={
                                                    "text-capitalize "
                                                    + (this.state.collection_library_data_selected.length === 1 ? '' : 'd-none')
                                                }
                                            >{Localization.view_in_store}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.removeBooksFromCollection()}
                                                className={
                                                    "text-capitalize "
                                                    + (this.state.remove_loader ? 'disabled ' : '')
                                                    + (this.isUncollected ? 'd-none ' : '')
                                                    + (!this.state.collection_library_data_selected.length ? 'd-none' : '')
                                                }
                                                disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                                            >{
                                                    !this.state.remove_loader ?
                                                        Localization.remove
                                                        :
                                                        <i className="icon-- text-primary-- fa fa-spinner fa-spin p-2--"></i>
                                                }
                                                {
                                                    this.props.network_status === NETWORK_STATUS.OFFLINE
                                                        ? <i className="fa fa-wifi text-danger"></i> : ''
                                                }
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => this.removeFromDevice()}
                                                className={
                                                    "text-capitalize "
                                                    + (!this.state.collection_library_data_selected.length ? 'd-none' : '')
                                                }
                                            >{Localization.remove_from_device}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    : ''
                            }

                            <i className={
                                "icon fa fa-wrench text-dark p-2 "
                                + (this.state.isCollection_editMode ? 'shadow2' : '')
                            }
                                onClick={() => this.change_collections_mode()}
                            ></i>

                            <i className="icon fa fa-sliders text-dark p-2"
                                onClick={() => this.change_collection_view_test()}
                            ></i>

                            {
                                this.isUncollected !== true ?
                                    <Dropdown className="d-inline-block collection-menu-dd">
                                        <Dropdown.Toggle
                                            as="i"
                                            id="dropdown-collection-menu"
                                            className="icon fa fa-ellipsis-v text-dark p-2 no-default-icon">
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="dropdown-menu-right border-0 rounded-0 shadow2">
                                            <Dropdown.Item
                                                as={NavLink}
                                                to={`/collection-update/${this.collectionTitle}`}
                                                className="text-capitalize"
                                            >{Localization.add_to_collection}</Dropdown.Item>
                                            <Dropdown.Item
                                                className="text-capitalize"
                                                onClick={() => this.openModal_downloadCollection()}
                                            >{Localization.download_collection}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    :
                                    ''
                            }

                        </div>
                    </div>
                </div>
            </div>
        )
    }

    viewInStore() {
        const lib: ILibrary = this.state.collection_library_data_selected[0];
        if (lib) {
            this.gotoBookDetail(lib.book.id);
        }
    }

    removeFromDevice() {
        const id_s = this.state.collection_library_data_selected.map((item: ILibrary) => item.book.id);
        CmpUtility.removeBookFileFromDevice(id_s, true);
    }

    private async markAsRead() {
        const id_s = this.state.collection_library_data_selected.map((item: ILibrary) => item.book.id);
        for (let i = 0; i < id_s.length; i++) {
            await CmpUtility.waitOnMe(0);
            markAsRead_libraryItem(id_s[i]);
        }

        this.set_col_libraryData();
    }

    private async markAsUnRead() {
        const id_s = this.state.collection_library_data_selected.map((item: ILibrary) => item.book.id);
        for (let i = 0; i < id_s.length; i++) {
            await CmpUtility.waitOnMe(0);
            markAsUnRead_libraryItem(id_s[i]);
        }

        this.set_col_libraryData();
    }

    gotoBookDetail(bookId: string) {
        this.props.history.push(`/book-detail/${bookId}`);
    }

    change_collections_mode() {
        this.setState({
            ...this.state,
            isCollection_editMode: !this.state.isCollection_editMode,
            collection_library_data_selected: []
            // this.state.isCollection_editMode
            //     ? [] :
            //     this.state.collection_library_data_selected
        });
    }

    view_grid_render() {
        return (
            <>
                <div className={"library-items-view-grid-wrapper mt-3 "
                    + (this.state.collection_library_data.length ? 'mr-3' : '')
                }>
                    <div className="row">
                        {
                            this.state.collection_library_data.length
                                ?
                                this.state.collection_library_data.map((item: ILibrary) => (
                                    <Fragment key={item.id}>
                                        {libraryItem_viewGrid_render(
                                            item,
                                            (it) => this.onItemSelect(it),
                                            (it) => this.isItemSelected(it)
                                        )}
                                    </Fragment>
                                ))
                                :
                                <div className="col-12">
                                    <h4 className="text-center text-warning">{Localization.no_item_found}</h4>
                                </div>
                        }
                    </div>
                </div>
            </>
        )
    }
    view_list_render() {
        return (
            <>
                <div className="library-items-view-list-wrapper mt-3">
                    {
                        this.state.collection_library_data.length
                            ?
                            this.state.collection_library_data.map((item: ILibrary) => (
                                <Fragment key={item.id}>
                                    {libraryItem_viewList_render(
                                        item,
                                        (it) => this.onItemSelect(it),
                                        (it) => this.isItemSelected(it)
                                    )}
                                </Fragment>
                            ))
                            :
                            <div className="col-12">
                                <h4 className="text-center text-warning">{Localization.no_item_found}</h4>
                            </div>
                    }
                </div>
            </>
        )
    }

    //#region select item
    onItemSelect(item: ILibrary) {
        if (this.state.isCollection_editMode) {
            this.toggleSelect_libraryData(item);
        } else {
            const isDownloaded = is_libBook_downloaded(item);
            if (!isDownloaded) {
                const is_downloading = is_libBook_downloading(item);
                // toggle_libBook_download(item);
                if (!is_downloading) start_download_book(item.book.id, true);
                return;
            }

            this.openBookByReader(item.book, this.props.history, true);
        }
    }

    isItemSelected(item: ILibrary): boolean {
        let selected_list: ILibrary[] = [...this.state.collection_library_data_selected];

        let selected = false;
        for (let i = 0; i < selected_list.length; i++) {
            if (selected_list[i].id === item.id) {
                selected = true;
                break;
            }
        }

        return selected;
    }

    toggleSelect_libraryData(item: ILibrary) {
        let selected_list: ILibrary[] = [...this.state.collection_library_data_selected];

        let index = -1;
        let selected = false;
        for (let i = 0; i < selected_list.length; i++) {
            if (selected_list[i].id === item.id) {
                selected = true;
                index = i;
                break;
            }
        }

        if (selected) {
            selected_list.splice(index, 1);
        } else {
            selected_list.push(item);
        }

        this.setState({ ...this.state, collection_library_data_selected: selected_list });
    }

    selectAll_libraryData() {
        this.setState({ ...this.state, collection_library_data_selected: [...this.state.collection_library_data] });
    }

    deselectAll_libraryData() {
        this.setState({ ...this.state, collection_library_data_selected: [] });
    }

    change_collection_view_test() {
        if (this.props.collection.view === COLLECTION_VIEW.grid) {
            this.props.set_collections_view(COLLECTION_VIEW.list);
        } else if (this.props.collection.view === COLLECTION_VIEW.list) {
            this.props.set_collections_view(COLLECTION_VIEW.grid);
        }
    }

    goBack() {
        if (this.props.history.length > 1) { this.props.history.goBack(); }
        else { this.props.history.push(`/library`); }
    }

    //#endregion

    //#region modal download collection
    openModal_downloadCollection() {
        this.setState({ ...this.state, modal_downloadCollections: { ...this.state.modal_downloadCollections, show: true } });
    }

    closeModal_downloadCollection() {
        this.setState({ ...this.state, modal_downloadCollections: { ...this.state.modal_downloadCollections, show: false } });
    }

    modal_downloadCollection_render() {
        return (
            <>
                <Modal
                    show={this.state.modal_downloadCollections.show}
                    onHide={() => this.closeModal_downloadCollection()}
                    centered
                >
                    <Modal.Header className="border-bottom-0 pb-0">
                        <Modal.Title className="text-capitalize font-weight-normal">{Localization.download_collection_}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{Localization.msg.ui.your_collection_will_be_downloaded_continue}</Modal.Body>
                    <Modal.Footer className="border-top-0 pt-0">
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal_downloadCollection()}>
                            {Localization.cancel}
                        </button>
                        <BtnLoader
                            btnClassName="btn btn-system-- text-system btn-sm text-uppercase min-w-70px"
                            loading={this.state.modal_downloadCollections.loader}
                            onClick={() => this.downloadCollection()}
                            disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                        >
                            {Localization.download}
                            {
                                this.props.network_status === NETWORK_STATUS.OFFLINE
                                    ? <i className="fa fa-wifi text-danger"></i> : ''
                            }
                        </BtnLoader>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    async downloadCollection() {
        // let collection_title = this.collectionTitle;
        // let isUncollected = this.isUncollected;
        if (this.isUncollected) return;
        collection_download(this.collectionTitle);

        this.closeModal_downloadCollection();
    }
    //#endregion

    async removeBooksFromCollection() {
        if (this.isUncollected || !this.state.collection_library_data_selected.length) return;
        this.setState({ ...this.state, remove_loader: true });

        let book_ids_toRemove = this.state.collection_library_data_selected.map((lib: ILibrary) => lib.book.id);

        let res = await this._collectionService.remove_books(
            this.collectionTitle,
            book_ids_toRemove
        ).catch(error => {
            this.handleError({ error: error.response });
        });

        this.setState({ ...this.state, remove_loader: false });

        if (res) {
            let allColl = [...this.props.collection.data];
            let thisColl: ICollection = allColl.find(col => col.title === this.collectionTitle)!;

            let thisColl_currentBooks = [...thisColl.books];
            thisColl_currentBooks = thisColl_currentBooks.filter(bk => !book_ids_toRemove.includes(bk.id));
            thisColl.books = [...thisColl_currentBooks];
            this.props.set_collections_data(allColl);

            this.set_col_libraryData();
            CmpUtility.waitOnMe(100);
            this.deselectAll_libraryData();

        }
    }

    //#region modal add to collection
    openModal_addToCollections(/* book_id: string */) {
        this.setState({ ...this.state, modal_addToCollections: { ...this.state.modal_addToCollections, show: true } });
    }

    async closeModal_addToCollections() {
        if (this.isUncollected) {
            // remove "removed item" from collection_library_data_selected.
            // after add book to collection(s) it should remove from uncollected clt.
            this.set_col_libraryData();
            await this.waitOnMe(100);
            this.unCollected_remove_from_selected();
        }
        this.setState({ ...this.state, modal_addToCollections: { ...this.state.modal_addToCollections, show: false } });
    }

    /**
     * in uncollected mode, after add item to other collcetion remove it from selected_list
     */
    unCollected_remove_from_selected() {
        const list: ILibrary[] = [...this.state.collection_library_data];
        const list_ids = list.map(li => li.id);
        let selected_list: ILibrary[] = [...this.state.collection_library_data_selected];
        selected_list = selected_list.filter(lib => list_ids.includes(lib.id));
        this.setState({ ...this.state, collection_library_data_selected: selected_list });
    }

    getBookModal_addToCollections(): IBook | undefined {
        const lib_0: ILibrary = this.state.collection_library_data_selected[0];
        if (lib_0) { return lib_0.book; }
    }
    //#endregion

    render() {
        return (
            <>
                <div className="collection-wrapper">
                    {this.collection_header_render()}
                    {(() => {
                        switch (this.props.collection.view) {
                            case COLLECTION_VIEW.grid:
                                return this.view_grid_render();
                            case COLLECTION_VIEW.list:
                                return this.view_list_render();
                            default:
                                return undefined;
                        }
                    })()}
                </div>

                {this.modal_downloadCollection_render()}

                <AddToCollection
                    show={this.state.modal_addToCollections.show}
                    book={this.getBookModal_addToCollections()}
                    onHide={() => this.closeModal_addToCollections()}
                />

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        set_collections_view: (view: COLLECTION_VIEW) => dispatch(action_set_collections_view(view)),
        set_collections_data: (data: ICollection[]) => dispatch(action_set_collections_data(data)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        library: state.library,
        collection: state.collection,
        network_status: state.network_status,
    }
}

export const Collection = connect(state2props, dispatch2props)(CollectionComponent);
