import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
import { TInternationalization } from '../../../../config/setup';
import { BaseComponent } from '../../../_base/BaseComponent';
import { Localization } from '../../../../config/localization/localization';
import { IToken } from '../../../../model/model.token';
import { ToastContainer } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { ICollection } from '../../../../model/model.collection';
import { action_set_collections_data } from '../../../../redux/action/collection';
import { ICollection_schema } from '../../../../redux/action/collection/collectionAction';
import { CollectionService } from '../../../../service/service.collection';
import { Input } from '../../../form/input/Input';
import { BtnLoader } from '../../../form/btn-loader/BtnLoader';
import { IBook } from '../../../../model/model.book';

export interface IProps {
    internationalization: TInternationalization;
    token: IToken;

    collection: ICollection_schema;
    set_collections_data?: (data: ICollection[]) => any;

    // book_id: string;
    book?: IBook;
    show: boolean;
    onHide: () => any
}

interface IState {
    // modal_addToCollections: {
    createCollection_loader: boolean;
    addToCollections_loader: boolean;
    newCollectionTitle: {
        value: string | undefined;
        isValid: boolean;
    };
    // };
    selected_collection_list: ICollection[];
}

class AddToCollectionComponent extends BaseComponent<IProps, IState> {
    state = {
        // modal_addToCollections: {
        createCollection_loader: false,
        addToCollections_loader: false,
        newCollectionTitle: {
            value: undefined,
            isValid: false,
        },
        // },
        selected_collection_list: [],
    }

    private _collectionService = new CollectionService();

    constructor(props: IProps) {
        super(props);

        this._collectionService.setToken(this.props.token);
    }

    componentDidMount() {
    }

    closeModal() {
        this.setState({
            ...this.state,
            selected_collection_list: []
        });
        this.props.onHide();
    }

    modal_render() {
        return (
            <>
                <Modal
                    className="modal-addToCollections"
                    show={this.props.show}
                    onHide={() => this.closeModal()}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title className="text-capitalize">{Localization.add_to_collection}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                <div className="create-collection-wrapper">
                                    <div className="input-wrapper">
                                        <Input
                                            placeholder={Localization.new_collection}
                                            defaultValue={this.state.newCollectionTitle.value}
                                            onChange={(val, isValid) => { this.handleNewCollectionInputChange(val, isValid) }}
                                            required
                                            hideError
                                            className="input-bordered-bottom"
                                        />
                                    </div>

                                    <BtnLoader
                                        btnClassName="btn btn-link text-success btn-sm text-uppercase"
                                        loading={this.state.createCollection_loader}
                                        onClick={() => this.create_Collection()}
                                        disabled={!this.state.newCollectionTitle.isValid}
                                    >
                                        {Localization.create}
                                    </BtnLoader>
                                </div>
                            </div>

                            <div className="col-12">
                                <ul className="collcetion-list">
                                    {
                                        this.props.collection.data.map((clt, clt_index) => {
                                            const isBk_exist_Clt = this.isBook_existInCollection(clt);
                                            const isClt_selected = this.isCollectionSelected(clt);

                                            return (
                                                <li key={clt.title}
                                                    onClick={() => !isBk_exist_Clt && this.toggleSelectCollection(clt)}
                                                    className={isBk_exist_Clt ? "disabled" : ''}
                                                >
                                                    <div>{clt.title}</div>
                                                    <div
                                                        className={
                                                            "selected-icon "
                                                            + (isClt_selected || isBk_exist_Clt ? '' : 'd-none')
                                                        }
                                                    >
                                                        <i className="fa fa-check-square text-primary"></i>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-light btn-sm text-uppercase" onClick={() => this.closeModal()}>
                            {Localization.cancel}
                        </button>
                        <BtnLoader
                            btnClassName="btn btn-success btn-sm text-uppercase"
                            loading={this.state.addToCollections_loader}
                            onClick={() => this.add_toCollections()}
                            disabled={!this.props.book || !this.props.book.id || !this.state.selected_collection_list.length}
                        >
                            {Localization.ok}
                        </BtnLoader>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    handleNewCollectionInputChange(value: any, isValid: boolean) {
        this.setState({
            ...this.state,
            newCollectionTitle: { value, isValid }
        });
    }

    isBook_existInCollection(collection: ICollection): boolean {
        if (!this.props.book) return false;

        const book_ids = collection.books.map(bk => bk.id);
        if (book_ids.includes(this.props.book.id)) {
            return true;
        }
        return false;
    }

    isCollectionSelected(collection: ICollection): boolean {
        let selected_list: ICollection[] = [...this.state.selected_collection_list];
        // let index = selected_list.indexOf(collection);

        let selected = false;
        for (let i = 0; i < selected_list.length; i++) {
            if (selected_list[i].title === collection.title) {
                selected = true;
                // index = i;
                break;
            }
        }

        return selected;
        // if (index < 0) {
        //     return false;
        // }
        // return true;
    }

    toggleSelectCollection(collection: ICollection) {
        let selected_list: ICollection[] = [...this.state.selected_collection_list];
        let index = -1; // = selected_list.indexOf(collection);

        let selected = false;
        for (let i = 0; i < selected_list.length; i++) {
            if (selected_list[i].title === collection.title) {
                selected = true;
                index = i;
                break;
            }
        }

        if (selected) {
            selected_list.splice(index, 1);
        } else {
            selected_list.push(collection);
        }

        // if (index < 0) {
        //     selected_list.push(collection);
        // } else {
        //     selected_list.splice(index, 1);
        // }

        this.setState({
            ...this.state,
            selected_collection_list: selected_list
        });
    }

    async create_Collection() {
        if (!this.state.newCollectionTitle.isValid) return;

        this.setState({
            ...this.state,
            createCollection_loader: true
        });

        let res = await this._collectionService.create(
            this.state.newCollectionTitle.value!
        ).catch(error => {
            this.handleError({ error: error.response });
            this.setState({
                ...this.state,
                createCollection_loader: false
            });
        });

        if (res) {
            const newClt: ICollection = { title: res.data.title, books: [] };
            this.props.set_collections_data &&
                this.props.set_collections_data([newClt, ...this.props.collection.data]);

            this.setState({
                ...this.state,
                createCollection_loader: false,
                newCollectionTitle: {
                    value: undefined,
                    isValid: false
                },
                // push new added collection to selected_collection_list
                selected_collection_list: [...this.state.selected_collection_list, newClt]
            });

        }
    }

    async add_toCollections() {
        if (!this.props.book || !this.props.book.id || !this.state.selected_collection_list.length) return;
        const book_toAdd = this.props.book;

        this.setState({
            ...this.state,
            addToCollections_loader: true
        });

        let selected_collection_list_title = this.state.selected_collection_list.map((clt: ICollection) => clt.title);

        let res = await this._collectionService.add_toCollections(
            selected_collection_list_title,
            [book_toAdd.id]
        ).catch(error => {
            this.handleError({ error: error.response });
        });

        this.setState({
            ...this.state,
            addToCollections_loader: false
        });

        if (res) {
            let allColl = [...this.props.collection.data];
            this.state.selected_collection_list.forEach((clt_selected: ICollection) => {
                const c = allColl.find(clt => clt.title === clt_selected.title);
                // clt_selected.books.unshift(book_toAdd);
                if (c) {
                    c.books.unshift(book_toAdd);
                }
            });

            this.props.set_collections_data &&
                this.props.set_collections_data(allColl);

            this.closeModal();
        }
    }

    render() {
        return (
            <>
                {this.modal_render()}

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
        internationalization: state.internationalization,
        token: state.token,
        collection: state.collection,
    }
}

export const AddToCollection = connect(state2props, dispatch2props)(AddToCollectionComponent);
