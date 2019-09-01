import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
import { IUser } from '../../../../model/model.user';
import { TInternationalization } from '../../../../config/setup';
import { BaseComponent } from '../../../_base/BaseComponent';
import { Localization } from '../../../../config/localization/localization';
// import { LibraryService } from '../../../service/service.library';
import { IToken } from '../../../../model/model.token';
// import { CollectionService } from '../../../service/service.collection';
import { BOOK_TYPES, BOOK_ROLES } from '../../../../enum/Book';
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

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    token: IToken;
    history: History;
    match: any;

    library: ILibrary_schema;
    set_collections_view: (view: COLLECTION_VIEW) => any;
    collection: ICollection_schema;
    set_collections_data: (data: ICollection[]) => any;
}

interface IState {
    collection_library_data: ILibrary[];
    modal_downloadCollections: {
        show: boolean;
        loader: boolean;
    };
}

class CollectionComponent extends BaseComponent<IProps, IState> {
    state = {
        collection_library_data: [],
        modal_downloadCollections: {
            show: false,
            loader: false
        }
    }

    // private _libraryService = new LibraryService();
    // private _collectionService = new CollectionService();
    private collectionTitle: string = '';
    private isUncollected: boolean = false;

    constructor(props: IProps) {
        super(props);
        // this._libraryService.setToken(this.props.token);
        // this._collectionService.setToken(this.props.token);

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
                break;
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
                        <div className="filter-collection pl-2__">
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
                        <div className="view-collection pr-2__">

                            <i className="icon fa fa-sliders text-dark p-2"
                                onClick={() => this.change_collection_view_test()}
                            ></i>

                            {
                                this.isUncollected !== true ?
                                    <Dropdown className="d-inline-block collection-menu-dd">
                                        <Dropdown.Toggle
                                            as="i"
                                            id="dropdown-collection-menu"
                                            className="icon fa fa-ellipsis-v text-dark p-2 ">
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="dropdown-menu-right border-0 shadow2">
                                            <Dropdown.Item
                                                as={NavLink}
                                                to={`/dashboard`}
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

    calc_read_percent(item: ILibrary): string {
        let read = 0;
        let total = 0;

        if (item.book.type === BOOK_TYPES.Audio) {
            read = item.status.read_duration;
            total = +item.book.duration;

        } else if (item.book.type === BOOK_TYPES.Epub || item.book.type === BOOK_TYPES.Pdf) {
            read = item.status.read_pages;
            total = +item.book.pages;
        }

        if (total) {
            return Math.floor(((read || 0) * 100) / +total) + '%';
        } else {
            return '0%';
        }
    }

    view_grid_render() {
        return (
            <>
                <div className={"collection-view-grid-wrapper mr-3-- mt-3 "
                    + (this.state.collection_library_data.length ? 'mr-3' : '')
                }>
                    <div className="row">
                        {
                            this.state.collection_library_data.length
                                ?
                                this.state.collection_library_data.map((item: ILibrary, index) => {
                                    let book_img =
                                        (item.book.images && item.book.images.length && this.getImageUrl(item.book.images[0]))
                                        ||
                                        this.defaultBookImagePath;

                                    return (
                                        <div className="col-4 p-align-inverse-0 mb-3" key={index}>
                                            <div className="item-wrapper">
                                                <img src={book_img}
                                                    alt="book"
                                                    className="collection-grid-book-show"
                                                    onError={e => this.bookImageOnError(e)} />

                                                <div className="book-progress-state">
                                                    <div className="bp-state-number">
                                                        <div className="text">{this.calc_read_percent(item)}</div>
                                                    </div>
                                                    <div className="bp-state-arrow" />
                                                </div>
                                                <div className="book-download">
                                                    <i className="fa fa-check" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
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
                <div className="collection-view-list-wrapper mt-3">
                    {
                        this.state.collection_library_data.length
                            ?
                            this.state.collection_library_data.map((item: ILibrary, index) => {
                                let book_img =
                                    (item.book.images && item.book.images.length && this.getImageUrl(item.book.images[0]))
                                    ||
                                    this.defaultBookImagePath;

                                let writerList = item.book.roles.filter(
                                    r => r.role === BOOK_ROLES.Writer
                                );

                                let writerName = '';
                                if (writerList && writerList.length && writerList[0].person) {
                                    writerName = this.getPersonFullName(writerList[0].person);
                                }

                                return (
                                    <div className="view-list-item py-2__ pb-2 mb-2" key={index}>
                                        <div className="item-wrapper row">
                                            <div className="img-wrapper col-4">
                                                <div className="img-container__ mt-2__">
                                                    <img src={book_img} alt="book"
                                                        onError={e => this.bookImageOnError(e)} />
                                                </div>
                                            </div>
                                            <div className="detail-wrapper col-8 p-align-0">
                                                <div className="book-title">{item.book.title}</div>
                                                <span className="book-writer text-muted py-2 small">{writerName}</span>
                                                <span className="book-progress mr-2 small">{this.calc_read_percent(item)}</span>
                                                {/* todo: size */}
                                                {/* <span className="book-volume small">789.3 kb</span> */}
                                                <i className="fa fa-check-circle downloaded-icon"></i>
                                            </div>
                                            {/* <div className="col-2 text-right is-downloaded pt-1">
                                        
                                    </div> */}
                                        </div>
                                    </div>
                                )
                            })
                            :
                            <div className="col-12">
                                <h4 className="text-center text-warning">{Localization.no_item_found}</h4>
                            </div>
                    }
                </div>
            </>
        )
    }

    change_collection_view_test() {
        if (this.props.collection.view === COLLECTION_VIEW.grid) {
            this.props.set_collections_view(COLLECTION_VIEW.list);
        } else if (this.props.collection.view === COLLECTION_VIEW.list) {
            this.props.set_collections_view(COLLECTION_VIEW.grid);
        }
    }

    // gotoLibrary() {
    goBack() {
        if (this.props.history.length > 1) { this.props.history.goBack(); }
        else { this.props.history.push(`/library`); }
    }

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
                        <button className="btn btn-light btn-sm" onClick={() => this.closeModal_downloadCollection()}>
                            {Localization.cancel}
                        </button>
                        <BtnLoader
                            btnClassName="btn btn-system btn-sm"
                            loading={this.state.modal_downloadCollections.loader}
                            onClick={() => this.downloadCollection()}
                        >
                            {Localization.download}
                        </BtnLoader>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    async downloadCollection() {
        let collection_title = this.collectionTitle;
        let isUncollected = this.isUncollected;

        this.closeModal_downloadCollection();
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
        token: state.token,
        library: state.library,
        collection: state.collection,
    }
}

export const Collection = connect(state2props, dispatch2props)(CollectionComponent);
