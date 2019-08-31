import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../redux/app_state';
import { IUser } from '../../../model/model.user';
import { TInternationalization } from '../../../config/setup';
import { BaseComponent } from '../../_base/BaseComponent';
import { Localization } from '../../../config/localization/localization';
import { LibraryService } from '../../../service/service.library';
import { IToken } from '../../../model/model.token';
import { CollectionService, ICollection } from '../../../service/service.collection';
import { BOOK_TYPES, BOOK_ROLES } from '../../../enum/Book';
import { ToastContainer } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { Input } from '../../form/input/Input';
import { BtnLoader } from '../../form/btn-loader/BtnLoader';
import { History } from "history";
import { ILibrary } from '../../../model/model.library';

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    token: IToken;
    history: History;
}

enum COLLECTION_VIEW {
    grid = 'grid',
    list = 'list',
}

interface IState {
    library_view: COLLECTION_VIEW;
    library_data: ILibrary[] | [];
    collection_data: ICollection[] | [];
    modal_createCollections: {
        show: boolean;
        loader: boolean;
        newCollectionTitle: {
            value: string | undefined;
            isValid: boolean;
        };
    }
}

class CollectionComponent extends BaseComponent<IProps, IState> {
    state = {
        library_view: COLLECTION_VIEW.grid,
        library_data: [],
        collection_data: [],
        modal_createCollections: {
            show: false,
            loader: false,
            newCollectionTitle: {
                value: undefined,
                isValid: false,
            }
        },
    }

    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    constructor(props: IProps) {
        super(props);
        this._libraryService.setToken(this.props.token);
        this._collectionService.setToken(this.props.token);
    }

    componentDidMount() {
        this.fetchLibrary()
    }

    async fetchLibrary() {
        let res = await this._libraryService.getAll().catch(error => {
            this.handleError({ error: error.response });
        });

        let res_coll = await this._collectionService.getAll().catch(error => {
            this.handleError({ error: error.response });
        });

        if (res) {
            this.setState({
                ...this.state,
                library_data: res.data.result,
                collection_data: res_coll ? res_coll.data.result : []
            });
        }
    }

    library_header_render() {
        return (
            <div className="library-menu pt-2__">
                <div className="row menu-wrapper__">
                    <div className="col-2">
                        <div className="filter-library pl-2__">
                            <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer"
                                onClick={() => this.gotoLibrary()}
                            ></i>
                        </div>
                    </div>
                    <div className={
                        "col-8 --111 filter-option text-center "
                        // + (this.state.library_view === COLLECTION_VIEW.collections ? 'col-10' : 'col-8')
                    }>
                        {/* <span className="filter-link text-uppercase mr-3 active">{Localization.all}</span> */}
                        {/* <span className="filter-link text-uppercase ">{Localization.downloaded}</span> */}
                    </div>

                    <div className={
                        "col-2 text-right "
                        // + (this.state.library_view === COLLECTION_VIEW.collections ? 'col-4' : 'col-2')
                    }>
                        <div className="view-library pr-2__">

                            <i className="icon fa fa-sliders text-dark p-2" onClick={() => this.change_library_view_test()}></i>
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
                <div className="library-view-grid-wrapper mr-3 mt-3">
                    <div className="row">
                        {
                            this.state.library_data.map((item: ILibrary, index) => {
                                let book_img =
                                    (item.book.images && item.book.images.length && this.getImageUrl(item.book.images[0]))
                                    ||
                                    this.defaultBookImagePath;

                                return (
                                    <div className="col-4 p-align-inverse-0 mb-3" key={index}>
                                        <div className="item-wrapper">
                                            <img src={book_img}
                                                alt="book"
                                                className="library-grid-book-show"
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
                        }
                    </div>
                </div>
            </>
        )
    }
    view_list_render() {
        return (
            <>
                <div className="library-view-list-wrapper mt-3">
                    {this.state.library_data.map((item: ILibrary, index) => {
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
                    })}
                </div>
            </>
        )
    }

    change_library_view_test() {
        if (this.state.library_view === COLLECTION_VIEW.grid) {
            this.setState({ ...this.state, library_view: COLLECTION_VIEW.list });
        } else if (this.state.library_view === COLLECTION_VIEW.list) {
            this.setState({ ...this.state, library_view: COLLECTION_VIEW.grid });
        }

    }

    gotoLibrary() {
        this.props.history.push(`/library`);
    }

    //#region modal
    openModal_createCollections() {
        this.setState({ ...this.state, modal_createCollections: { ...this.state.modal_createCollections, show: true } });
    }

    closeModal_createCollections() {
        this.setState({ ...this.state, modal_createCollections: { ...this.state.modal_createCollections, show: false } });
    }

    modal_createCollections_render() {
        return (
            <>
                <Modal
                    className="dashboard-modal-createCollections--"
                    show={this.state.modal_createCollections.show}
                    onHide={() => this.closeModal_createCollections()}
                    centered
                >
                    <Modal.Header
                        // closeButton
                        className="border-bottom-0 pb-0">
                        <Modal.Title className="text-capitalize">{Localization.create_new_collection}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <div className="create-collection-wrapper--">
                                    <div className="input-wrapper--">
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
                        <BtnLoader
                            btnClassName="btn btn-success btn-sm text-uppercase"
                            loading={this.state.modal_createCollections.loader}
                            disabled={!this.state.modal_createCollections.newCollectionTitle.isValid}
                            onClick={() => this.create_Collection()}
                        >
                            {Localization.create}
                        </BtnLoader>
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
            // todo add ro redux collection
            this.setState({
                ...this.state,
                collection_data: [...this.state.collection_data, { title: res.data.title, books: [] }],
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

            // todo goto new collection page
        }
    }
    //#endregion

    render() {
        return (
            <>
                <div className="library-wrapper">
                    {this.library_header_render()}
                    {(() => {
                        switch (this.state.library_view) {
                            case COLLECTION_VIEW.grid:
                                return this.view_grid_render();
                            case COLLECTION_VIEW.list:
                                return this.view_list_render();
                            default:
                                return undefined;
                        }
                    })()}
                </div>

                {this.modal_createCollections_render()}

                <ToastContainer {...this.getNotifyContainerConfig()} />

            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        token: state.token,
    }
}

export const Collection = connect(state2props, dispatch2props)(CollectionComponent);
