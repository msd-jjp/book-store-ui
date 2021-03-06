import React, { Fragment } from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../../redux/app_state';
import { IUser } from '../../../../../model/model.user';
import { TInternationalization } from '../../../../../config/setup';
import { BaseComponent } from '../../../../_base/BaseComponent';
import { Localization } from '../../../../../config/localization/localization';
import { ToastContainer } from 'react-toastify';
import { Dropdown } from 'react-bootstrap';
import { History } from "history";
import { ILibrary } from '../../../../../model/model.library';
import { ICollection } from '../../../../../model/model.collection';
import { action_set_collections_data } from '../../../../../redux/action/collection';
import { ILibrary_schema } from '../../../../../redux/action/library/libraryAction';
import { ICollection_schema } from '../../../../../redux/action/collection/collectionAction';
import { CollectionService } from '../../../../../service/service.collection';
import { NETWORK_STATUS } from '../../../../../enum/NetworkStatus';
import { libraryItem_viewGrid_render } from '../../libraryViewTemplate';

export interface IProps {
    logged_in_user?: IUser | null;
    internationalization: TInternationalization;
    // token: IToken;
    history: History;
    match: any;

    library: ILibrary_schema;
    collection: ICollection_schema;
    set_collections_data: (data: ICollection[]) => any;
    network_status: NETWORK_STATUS;
}

interface IState {
    collection_library_data: ILibrary[];
    // collection_library_dataId_selected: string[];
    collection_library_data_selected: ILibrary[];
    add_loader: boolean;
}

class CollectionUpdateComponent extends BaseComponent<IProps, IState> {
    state = {
        collection_library_data: [],
        collection_library_data_selected: [],
        add_loader: false,
    }

    private collectionTitle: string = '';
    private _collectionService = new CollectionService();

    constructor(props: IProps) {
        super(props);

        // this._collectionService.setToken(this.props.token);
        this.collectionTitle = this.props.match.params.collectionTitle;
    }

    componentDidMount() {
        this.set_col_libraryData();
    }

    get_col_libraryData(): ILibrary[] {
        let thisCol: ICollection | undefined =
            this.props.collection.data.find(col => col.title === this.collectionTitle);

        let collection_library_data: ILibrary[] = [];
        if (thisCol) {
            let thisCol_bookId_list = thisCol.books.map(bk => bk.id);

            collection_library_data = this.props.library.data.filter(lb => !thisCol_bookId_list.includes(lb.book.id));

            return collection_library_data;
        }

        return []; // this.props.library.data;
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
                    <div className="col-8">
                        <div className="icon-wrapper">
                            <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer"
                                onClick={() => this.goBack()}
                            ></i>

                            <div className="title h6 text-capitalize d-inline-block mb-0 font-weight-normal"
                                title={this.collectionTitle}>{this.collectionTitle}</div>

                            <span className={"text-muted mx-2 "
                                + (!this.state.collection_library_data.length ?
                                    'd-none' : '')
                            }>|</span>

                            <Dropdown className={
                                "d-inline-block-- collection-menu-dd "
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

                                <Dropdown.Menu className="dropdown-menu-right-- border-0 rounded-0 shadow2">
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
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="col-4 text-right ">
                        <div className="icon-wrapper">

                            {
                                (this.state.collection_library_data_selected.length
                                    && !this.state.add_loader
                                ) ?
                                    <span className={
                                        "icon-- text-primary p-2 text-uppercase "
                                        + (
                                            this.props.network_status === NETWORK_STATUS.OFFLINE
                                                ? 'opacity-5 cursor-not-allowed' : 'cursor-pointer'
                                        )
                                    }
                                        onClick={() => this.addBookToCollection()}
                                    >
                                        {Localization.add}
                                        {
                                            this.props.network_status === NETWORK_STATUS.OFFLINE
                                                ? <i className="fa fa-wifi text-danger"></i> : ''
                                        }
                                    </span>
                                    : ''

                            }
                            {
                                this.state.add_loader ?
                                    <i className="icon-- text-primary fa fa-spinner fa-spin p-2"></i>
                                    : ''
                            }

                        </div>
                    </div>
                </div>
            </div>
        )
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
                                            (it) => this.toggleSelect_libraryData(it),
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

    isItemSelected(item: ILibrary): boolean {
        let selected_list: ILibrary[] = [...this.state.collection_library_data_selected];
        let index = selected_list.indexOf(item);
        if (index < 0) {
            return false;
        }
        return true;
    }

    toggleSelect_libraryData(item: ILibrary) {
        let selected_list: ILibrary[] = [...this.state.collection_library_data_selected];
        let index = selected_list.indexOf(item);
        if (index < 0) {
            selected_list.push(item);
        } else {
            selected_list.splice(index, 1);
        }

        this.setState({ ...this.state, collection_library_data_selected: selected_list });
    }

    selectAll_libraryData() {
        // const allLib: ILibrary[] = this.state.collection_library_data;
        // const selected_list: ILibrary[] = allLib.map(lb => lb.id);
        this.setState({ ...this.state, collection_library_data_selected: [...this.state.collection_library_data] });
    }

    deselectAll_libraryData() {
        this.setState({ ...this.state, collection_library_data_selected: [] });
    }

    goBack() {
        /* if (this.props.history.length > 1) { this.props.history.goBack(); }
        // else { this.props.history.push(`/library`); }
        else { this.props.history.push(`/collection/${this.collectionTitle}`); } */

        this.props.history.replace(`/collection/${this.collectionTitle}`);
    }

    async addBookToCollection() {
        if (!this.state.collection_library_data_selected.length
            ||
            (this.props.network_status === NETWORK_STATUS.OFFLINE)
        ) return;
        this.setState({ ...this.state, add_loader: true });

        let newBook_ids = this.state.collection_library_data_selected.map((lib: ILibrary) => lib.book.id);
        // let allColl = [...this.props.collection.data];
        // let thisColl: ICollection = allColl.find(col => col.title === this.collectionTitle)!;
        // let currentBook_ids = thisColl.books.map(bk => bk.id);

        let res = await this._collectionService.add_toCollections(
            [this.collectionTitle],
            // [...newBook_ids, ...currentBook_ids]
            newBook_ids
        ).catch(error => {
            this.handleError({ error: error.response });
            // this.setState({ ...this.state, add_loader: false });
        });

        this.setState({ ...this.state, add_loader: false });
        // res = { data: { title: 'test' } };

        if (res) {
            let allColl = [...this.props.collection.data];
            let thisColl: ICollection = allColl.find(col => col.title === this.collectionTitle)!;

            let newBooks = this.state.collection_library_data_selected.map((lib: ILibrary) => lib.book);
            thisColl.books = [...newBooks, ...thisColl.books];
            this.props.set_collections_data(allColl);

            this.goBack();
        }
    }

    render() {
        return (
            <>
                <div className="collection-wrapper">
                    {this.collection_header_render()}

                    {this.view_grid_render()}
                </div>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        set_collections_data: (data: ICollection[]) => dispatch(action_set_collections_data(data)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        // token: state.token,
        library: state.library,
        collection: state.collection,
        network_status: state.network_status,
    }
}

export const CollectionUpdate = connect(state2props, dispatch2props)(CollectionUpdateComponent);
