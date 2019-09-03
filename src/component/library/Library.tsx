import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';
// import { LibraryService } from '../../service/service.library';
import { IToken } from '../../model/model.token';
import { CollectionService } from '../../service/service.collection';
import { BOOK_TYPES, BOOK_ROLES } from '../../enum/Book';
import { ToastContainer } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { Input } from '../form/input/Input';
import { BtnLoader } from '../form/btn-loader/BtnLoader';
import { History } from "history";
import { ILibrary } from '../../model/model.library';
import { LIBRARY_VIEW } from '../../enum/Library';
import { ILibrary_schema } from '../../redux/action/library/libraryAction';
import { /* action_set_library_data, */ action_set_library_view } from '../../redux/action/library';
import { ICollection } from '../../model/model.collection';
import { action_set_collections_data } from '../../redux/action/collection';
import { ICollection_schema } from '../../redux/action/collection/collectionAction';
import { NETWORK_STATUS } from '../../enum/NetworkStatus';

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    token: IToken;
    history: History;
    library: ILibrary_schema;
    // set_library_data: (data: ILibrary[]) => any;
    set_library_view: (view: LIBRARY_VIEW) => any;
    collection: ICollection_schema;
    set_collections_data: (data: ICollection[]) => any;
    network_status: NETWORK_STATUS;
}

interface IState {
    // library_view: LIBRARY_VIEW;
    // library_data: ILibrary[] | [];
    // collection_data: ICollection[] | [];
    modal_createCollections: {
        show: boolean;
        loader: boolean;
        newCollectionTitle: {
            value: string | undefined;
            isValid: boolean;
        };
    };
    isCollection_editMode: boolean;
    modal_removeCollections: {
        show: boolean;
        loader: boolean;
    };
    modal_downloadCollections: {
        show: boolean;
        loader: boolean;
    };
}

class LibraryComponent extends BaseComponent<IProps, IState> {
    state = {
        // library_view: this.props.library.view, // LIBRARY_VIEW.grid,
        // library_data: [],
        // collection_data: [],
        modal_createCollections: {
            show: false,
            loader: false,
            newCollectionTitle: {
                value: undefined,
                isValid: false,
            }
        },
        isCollection_editMode: false,
        modal_removeCollections: {
            show: false,
            loader: false
        },
        modal_downloadCollections: {
            show: false,
            loader: false
        }
    }

    // private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    constructor(props: IProps) {
        super(props);
        // this._libraryService.setToken(this.props.token);
        this._collectionService.setToken(this.props.token);
    }

    componentDidMount() {
        // this.fetchLibrary()
    }

    // async fetchLibrary() {
    //     let res = await this._libraryService.getAll().catch(error => {
    //         this.handleError({ error: error.response });
    //     });

    //     if (res) {
    //         this.props.set_library_data(res.data.result);
    //     }

    //     let res_coll = await this._collectionService.getAll().catch(error => {
    //         this.handleError({ error: error.response });
    //     });

    //     if (res_coll) {
    //         this.props.set_collections_data(res_coll.data.result);
    //     }
    // }

    library_header_render() {
        return (
            <div className="library-menu pt-2__">
                <div className="row menu-wrapper__">
                    {
                        // this.state.library_view
                        this.props.library.view === LIBRARY_VIEW.collections ? '' :
                            <div className="col-2">
                                <div className="filter-library pl-2__">
                                    <i className="fa fa-filter text-dark p-2"></i>
                                </div>
                            </div>
                    }
                    <div className={
                        "col-8-- --111 filter-option text-center "
                        + (
                            // this.state.library_view
                            this.props.library.view === LIBRARY_VIEW.collections ? 'col-4' : 'col-8')
                    }>
                        {
                            // this.state.library_view
                            this.props.library.view === LIBRARY_VIEW.collections ? '' :
                                <>
                                    <span className="filter-link text-uppercase mr-3 active">{Localization.all}</span>
                                    <span className="filter-link text-uppercase ">{Localization.downloaded}</span>
                                </>
                        }
                    </div>

                    <div className={
                        "col-2-- text-right "
                        + (
                            // this.state.library_view
                            this.props.library.view === LIBRARY_VIEW.collections ? 'col-4-- col-8' : 'col-2')
                    }>
                        <div className="view-library pr-2__">
                            {
                                // this.state.library_view
                                this.props.library.view !== LIBRARY_VIEW.collections ? '' :
                                    <>
                                        <i className={
                                            "icon fa fa-circle-o-- fa-gear text-dark p-2 "
                                            // + (this.state.isCollection_editMode ? 'fa-check-circle-o' : 'fa-circle-o')
                                            + (this.state.isCollection_editMode ? 'shadow2' : '')
                                        }
                                            onClick={() => this.change_collections_mode()}></i>
                                        <i className={
                                            "icon fa fa-plus text-dark p-2 "
                                            + (this.state.isCollection_editMode ? 'disabled' : '')
                                        }
                                            onClick={() => this.openModal_createCollections()}></i>
                                    </>
                            }
                            <i className={
                                "icon fa fa-sliders text-dark p-2 "
                                + (this.state.isCollection_editMode ? 'disabled' : '')
                            }
                                onClick={() => this.change_library_view_test()}
                            ></i>
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
                <div className={"library-view-grid-wrapper-- library-items-view-grid-wrapper mr-3-- mt-3 "
                    + (this.props.library.data.length ? 'mr-3' : '')
                }>
                    <div className="row">
                        {
                            // this.state.library_data
                            this.props.library.data.length
                                ?
                                this.props.library.data.map((item: ILibrary, index) => {
                                    let book_img =
                                        (item.book.images && item.book.images.length && this.getImageUrl(item.book.images[0]))
                                        ||
                                        this.defaultBookImagePath;

                                    return (
                                        <div className="col-4 p-align-inverse-0 mb-3" key={index}>
                                            <div className="item-wrapper">
                                                <img src={book_img}
                                                    alt="book"
                                                    className="library-grid-book-show-- lib-img"
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
                <div className="library-view-list-wrapper-- library-items-view-list-wrapper mt-3">
                    {
                        // this.state.library_data
                        this.props.library.data.length
                            ?
                            this.props.library.data.map((item: ILibrary, index) => {
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

    view_collection_render() {
        let uncollected_book_list_length = 0;
        let collected_book_id_list: string[] = [];
        let collected_book_id_list_unique: string[] = [];

        this.props.collection.data.forEach((coll: ICollection) => {
            let b_ids = coll.books.map(b => b.id);
            collected_book_id_list = [...collected_book_id_list, ...b_ids]
        });
        collected_book_id_list_unique = Array.from(new Set(collected_book_id_list));

        uncollected_book_list_length = this.props.library.data.length - collected_book_id_list_unique.length;

        return (
            <>
                <div className="library-view-collection-wrapper mr-3 mt-3">
                    <div className="row">
                        {
                            (this.props.library.data.length || this.props.collection.data.length)
                                ?
                                <>
                                    {this.props.collection.data.map((collection: ICollection, collection_index) => (
                                        <div className="col-4 p-align-inverse-0 mb-3" key={collection_index}>
                                            <div className="item-wrapper">
                                                <div className="cursor-pointer" onClick={() => this.gotoCollection(collection.title)}>
                                                    <img src={this.defaultBookImagePath}
                                                        className="item-size" alt="" onError={e => this.bookImageOnError(e)} />

                                                    <div className="collection-detail p-2">
                                                        <div className="collection-detail-inner">
                                                            <div className="book-wrapper">
                                                                <div className="row pr-3">
                                                                    {collection.books.slice(0, 4).map((sampleBook, sampleBook_index) => {
                                                                        const book_img =
                                                                            (sampleBook.images && sampleBook.images.length && this.getImageUrl(sampleBook.images[0]))
                                                                            ||
                                                                            this.defaultBookImagePath;

                                                                        return (
                                                                            <div className="col-6 book p-align-inverse-0 mb-2" key={sampleBook_index}>
                                                                                <img src={book_img} alt="book"
                                                                                    onError={e => this.bookImageOnError(e)} />
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="collection-name small">{collection.title}</div>
                                                            <div className="collection-book-count small float-right text-right">
                                                                {collection.books.length}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={
                                                    "collection-actions "
                                                    + (this.state.isCollection_editMode ? '' : 'd-none')
                                                }>
                                                    <div className="actions">
                                                        <div className="action download" onClick={() => this.openModal_downloadCollection(collection.title)}>
                                                            <i className="fa fa-download"></i>
                                                        </div>
                                                        <div className="action rename" onClick={() => this.openModal_renameCollections(collection.title)}>
                                                            <i className="fa fa-pencil"></i>
                                                        </div>
                                                        <div className="action remove" onClick={() => this.openModal_removeCollection(collection.title)}>
                                                            <i className="fa fa-trash"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {uncollected_book_list_length ?
                                        <div className="col-4 p-align-inverse-0 mb-3">
                                            <div className="item-wrapper uncollected">
                                                <div className="cursor-pointer" onClick={() => this.gotoCollection('uncollected', true)}>
                                                    <img src={this.defaultBookImagePath}
                                                        className="item-size" alt="" onError={e => this.bookImageOnError(e)} />

                                                    <div className="collection-detail p-2">
                                                        <div className="collection-detail-inner">
                                                            <div className="collection-book-count">{uncollected_book_list_length}</div>
                                                            <div className="collection-name small text-muted text-capitalize">
                                                                {Localization.uncollected}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={
                                                    "collection-actions "
                                                    + (this.state.isCollection_editMode ? '' : 'd-none')
                                                }>
                                                    <div className="actions d-none">
                                                        <div className="action download" onClick={() => this.openModal_downloadCollection('uncollected', true)}>
                                                            <i className="fa fa-download"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        : ''}
                                </>
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

    change_library_view_test() {
        if (this.state.isCollection_editMode) return;

        // if (this.state.library_view === LIBRARY_VIEW.grid) {
        if (this.props.library.view === LIBRARY_VIEW.grid) {
            // this.setState({ ...this.state, library_view: LIBRARY_VIEW.list });
            this.props.set_library_view(LIBRARY_VIEW.list);
            // } else if (this.state.library_view === LIBRARY_VIEW.list) {
        } else if (this.props.library.view === LIBRARY_VIEW.list) {
            // this.setState({ ...this.state, library_view: LIBRARY_VIEW.collections });
            this.props.set_library_view(LIBRARY_VIEW.collections);
        } else {
            // this.setState({ ...this.state, library_view: LIBRARY_VIEW.grid });
            this.props.set_library_view(LIBRARY_VIEW.grid);
        }

    }

    gotoCollection(collectionTitle: string, isUncollected: boolean = false) {
        if (this.state.isCollection_editMode) return;

        let unClt = isUncollected ? `/${isUncollected}` : '';
        this.props.history.push(`/collection/${collectionTitle}${unClt}`);
    }

    change_collections_mode() {
        this.setState({
            ...this.state,
            isCollection_editMode: !this.state.isCollection_editMode
        });
    }

    //#region modal remove collection
    private collection_title_to_remove: string | undefined;
    openModal_removeCollection(title: string) {
        this.collection_title_to_remove = title;
        this.setState({ ...this.state, modal_removeCollections: { ...this.state.modal_removeCollections, show: true } });
    }

    closeModal_removeCollection() {
        this.collection_title_to_remove = undefined;
        this.setState({ ...this.state, modal_removeCollections: { ...this.state.modal_removeCollections, show: false } });
    }

    modal_removeCollection_render() {
        return (
            <>
                <Modal
                    show={this.state.modal_removeCollections.show}
                    onHide={() => this.closeModal_removeCollection()}
                    centered
                >
                    <Modal.Header
                        className="border-bottom-0 pb-0">
                        <Modal.Title className="text-capitalize font-weight-normal">{Localization.delete_collection_}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{Localization.msg.ui.your_collection_will_be_removed_continue}</Modal.Body>
                    <Modal.Footer className="border-top-0 pt-0">
                        <button className="btn btn-light btn-sm" onClick={() => this.closeModal_removeCollection()}>
                            {Localization.cancel}
                        </button>
                        <BtnLoader
                            btnClassName="btn btn-danger btn-sm"
                            loading={this.state.modal_removeCollections.loader}
                            onClick={() => this.removeCollection(this.collection_title_to_remove!)}
                            disabled={this.props.network_status === NETWORK_STATUS.OFFLINE}
                        >
                            {/* {Localization.remove_collection} */}
                            {Localization.remove}
                            {
                                this.props.network_status === NETWORK_STATUS.OFFLINE
                                    ? <i className="fa fa-wifi text-danger--"></i> : ''
                            }
                        </BtnLoader>

                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    async removeCollection(title: string) {
        this.setState({
            ...this.state,
            modal_removeCollections: { ...this.state.modal_removeCollections, loader: true }
        });

        let res = await this._collectionService.remove(title).catch(error => {
            this.handleError({ error: error.response });
        });

        this.setState({
            ...this.state,
            modal_removeCollections: { ...this.state.modal_removeCollections, loader: false }
        });

        if (res) {
            let allColls = [...this.props.collection.data];
            let newColls = allColls.filter(cl => cl.title !== title);
            this.props.set_collections_data(newColls);
            this.closeModal_removeCollection();
        }
    }
    //#endregion

    //#region modal create collection
    private modal_saveCollection_mode: 'create' | 'edit' = 'create';
    private collection_title_to_rename: string | undefined;

    openModal_createCollections() {
        if (this.state.isCollection_editMode) return;

        this.modal_saveCollection_mode = 'create';

        this.setState({ ...this.state, modal_createCollections: { ...this.state.modal_createCollections, show: true } });
    }

    openModal_renameCollections(title: string) {
        if (!this.state.isCollection_editMode) return;

        this.modal_saveCollection_mode = 'edit';
        this.collection_title_to_rename = title;

        this.setState({
            ...this.state, modal_createCollections: {
                ...this.state.modal_createCollections,
                show: true,
                newCollectionTitle: {
                    value: title,
                    isValid: true
                }
            }
        });
    }

    closeModal_createCollections() {
        this.collection_title_to_rename = undefined;

        this.setState({
            ...this.state, modal_createCollections: {
                ...this.state.modal_createCollections,
                show: false,
                newCollectionTitle: {
                    value: undefined,
                    isValid: false
                }
            }
        });
    }

    modal_createCollections_render() {
        return (
            <>
                <Modal
                    className=""
                    show={this.state.modal_createCollections.show}
                    onHide={() => this.closeModal_createCollections()}
                    centered
                >
                    <Modal.Header
                        // closeButton
                        className="border-bottom-0 pb-0">
                        <Modal.Title className="text-capitalize font-weight-normal">{
                            this.modal_saveCollection_mode === 'create' ?
                                Localization.create_new_collection
                                :
                                Localization.rename_collection
                        }</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <div className="">
                                    <div className="">
                                        <Input
                                            placeholder={Localization.collection_name}
                                            defaultValue={this.state.modal_createCollections.newCollectionTitle.value}
                                            onChange={(val, isValid) => { this.handleNewCollectionInputChange(val, isValid) }}
                                            required
                                            hideError
                                            className="input-bordered-bottom"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 pt-0">
                        <button className="btn btn-light btn-sm text-uppercase" onClick={() => this.closeModal_createCollections()}>
                            {Localization.cancel}
                        </button>
                        {
                            this.modal_saveCollection_mode === 'create' ?
                                <BtnLoader
                                    btnClassName="btn btn-success btn-sm text-uppercase"
                                    loading={this.state.modal_createCollections.loader}
                                    disabled={
                                        !this.state.modal_createCollections.newCollectionTitle.isValid
                                        ||
                                        (this.props.network_status === NETWORK_STATUS.OFFLINE)
                                    }
                                    onClick={() => this.create_Collection()}
                                >
                                    {Localization.create}
                                    {
                                        this.props.network_status === NETWORK_STATUS.OFFLINE
                                            ? <i className="fa fa-wifi text-danger"></i> : ''
                                    }
                                </BtnLoader>
                                :
                                <BtnLoader
                                    btnClassName="btn btn-primary btn-sm text-uppercase"
                                    loading={this.state.modal_createCollections.loader}
                                    disabled={
                                        !this.state.modal_createCollections.newCollectionTitle.isValid
                                        ||
                                        (this.props.network_status === NETWORK_STATUS.OFFLINE)
                                    }
                                    onClick={() => this.renameCollection(
                                        this.collection_title_to_rename!,
                                        this.state.modal_createCollections.newCollectionTitle.value!
                                    )}
                                >
                                    {Localization.rename}
                                    {
                                        this.props.network_status === NETWORK_STATUS.OFFLINE
                                            ? <i className="fa fa-wifi text-danger"></i> : ''
                                    }
                                </BtnLoader>
                        }
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    handleNewCollectionInputChange(value: any, isValid: boolean) {
        this.setState({
            ...this.state,
            modal_createCollections: {
                ...this.state.modal_createCollections,
                newCollectionTitle: { value, isValid }
            }
        });
    }

    async create_Collection() {
        if (!this.state.modal_createCollections.newCollectionTitle.isValid) return;

        this.setState({
            ...this.state,
            modal_createCollections: {
                ...this.state.modal_createCollections,
                loader: true
            }
        });

        let res = await this._collectionService.create(
            this.state.modal_createCollections.newCollectionTitle.value!
        ).catch(error => {
            this.handleError({ error: error.response });
            this.setState({
                ...this.state,
                modal_createCollections: {
                    ...this.state.modal_createCollections,
                    loader: false
                }
            });
        });

        if (res) {
            this.props.set_collections_data([{ title: res.data.title, books: [] }, ...this.props.collection.data]);

            this.setState({
                ...this.state,
                modal_createCollections: {
                    ...this.state.modal_createCollections,
                    loader: false,
                    newCollectionTitle: {
                        value: undefined,
                        isValid: false
                    }
                }
            });
            this.closeModal_createCollections();

            this.props.history.push(`/collection/${res.data.title}`);
            this.props.history.push(`/collection-update/${res.data.title}`);
        }
    }

    async renameCollection(currentTitle: string, newTitle: string) {
        if (!this.state.modal_createCollections.newCollectionTitle.isValid) return;

        this.setState({
            ...this.state,
            modal_createCollections: {
                ...this.state.modal_createCollections,
                loader: true
            }
        });

        let res = await this._collectionService.rename(currentTitle, newTitle).catch(error => {
            this.handleError({ error: error.response });
            this.setState({
                ...this.state,
                modal_createCollections: {
                    ...this.state.modal_createCollections,
                    loader: false
                }
            });
        });

        if (res) {
            let allColls = [...this.props.collection.data];
            let col_index = allColls.findIndex(c => c.title === currentTitle);
            allColls[col_index].title = newTitle;

            this.props.set_collections_data(allColls);

            this.setState({
                ...this.state,
                modal_createCollections: {
                    ...this.state.modal_createCollections,
                    loader: false,
                    newCollectionTitle: {
                        value: undefined,
                        isValid: false
                    }
                }
            });
            this.closeModal_createCollections();
        }
    }
    //#endregion

    //#region modal download collection
    private collection_title_to_download: string | undefined;
    private collection_to_download_isUncollected: boolean = false;
    openModal_downloadCollection(title: string, isUncollected: boolean = false) {
        this.collection_title_to_download = title;
        this.collection_to_download_isUncollected = isUncollected;
        this.setState({ ...this.state, modal_downloadCollections: { ...this.state.modal_downloadCollections, show: true } });
    }

    closeModal_downloadCollection() {
        this.collection_title_to_download = undefined;
        this.collection_to_download_isUncollected = false;
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
                    <Modal.Header
                        className="border-bottom-0 pb-0">
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
                            onClick={() => this.downloadCollection(this.collection_title_to_download!)}
                        >
                            {Localization.download}
                        </BtnLoader>

                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    async downloadCollection(title: string) {
        // let collection_title = title;
        // let isUncollected = this.collection_to_download_isUncollected;

        this.closeModal_downloadCollection();
    }
    //#endregion

    render() {
        return (
            <>
                <div className="library-wrapper">
                    {this.library_header_render()}
                    {(() => {
                        // switch (this.state.library_view) {
                        switch (this.props.library.view) {
                            case LIBRARY_VIEW.grid:
                                return this.view_grid_render();
                            case LIBRARY_VIEW.list:
                                return this.view_list_render();
                            case LIBRARY_VIEW.collections:
                                return this.view_collection_render();
                            default:
                                return undefined;
                        }
                    })()}
                </div>

                {this.modal_createCollections_render()}
                {this.modal_removeCollection_render()}
                {this.modal_downloadCollection_render()}

                <ToastContainer {...this.getNotifyContainerConfig()} />

            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        // set_library_data: (data: ILibrary[]) => dispatch(action_set_library_data(data)),
        set_library_view: (view: LIBRARY_VIEW) => dispatch(action_set_library_view(view)),
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
        network_status: state.network_status,
    }
}

export const Library = connect(state2props, dispatch2props)(LibraryComponent);
