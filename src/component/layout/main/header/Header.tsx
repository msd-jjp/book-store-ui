import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../../../redux/app_state';
import { Localization } from '../../../../config/localization/localization';
import { History } from "history";
import { NETWORK_STATUS } from '../../../../enum/NetworkStatus';
import { BaseService } from '../../../../service/service.base';
import { ICartItems } from '../../../../redux/action/cart/cartAction';
import { IReaderEngine_schema } from '../../../../redux/action/reader-engine/readerEngineAction';

interface IProps {
    history: History;
    match: any;
    network_status: NETWORK_STATUS;
    cart: ICartItems;
    reader_engine: IReaderEngine_schema;
}
interface IState {
    search_query: string | undefined;
}
class LayoutMainHeaderComponent extends React.Component<IProps, IState> {
    state = {
        search_query: undefined
    }
    search_query!: string;
    componentDidMount() {
        // debugger;
        if (this.props.match.path === "/search/:searchQuery"
            && this.props.match.params.searchQuery
            && this.props.match.params.searchQuery.trim()) {

            this.search_query = this.props.match.params.searchQuery.trim();
            this.setState({ ...this.state, search_query: this.search_query });
        }
    }
    /* componentWillReceiveProps(nextProps: IProps) {
        debugger;
        if (this.props.match.params.searchQuery !== nextProps.match.params.searchQuery) {
            debugger;
        }
    } */
    updateSearchQuery_with_url() {

    }

    handleSearchKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            if (this.validate_searchQuery()) {
                this.gotoSearch();
            }
        }
    }
    validate_searchQuery(): boolean {
        if (this.search_query && this.search_query.trim()) {
            return true;
        }
        return false;
    }
    handleSearchIcon() {
        if (this.validate_searchQuery()) {
            this.gotoSearch();
        }
    }
    gotoSearch() {
        this.props.history.push(`/search/${this.search_query.trim()}`);
    }
    handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.search_query = event.target.value;
    }

    gotoCart() {
        this.props.history.push('/cart');
    }

    readerEngineStatus() {
        // return this.props.reader_engine.status;
        const className_color = this.props.reader_engine.status === 'failed' ? 'text-danger' :
            this.props.reader_engine.status === 'initing' ? 'text-warning' :
                this.props.reader_engine.status === 'inited' ? 'text-success' : '';

        const downloading = this.props.reader_engine.reader_status === 'downloading' ||
            this.props.reader_engine.wasm_status === 'downloading';

        const className_icon = downloading ? 'fa-download' : 'fa-lock'

        return (
            <i className={
                "fa fa-lock-- cursor-pointer ml-3 " +
                className_color + ' ' + className_icon
            }
            ></i>
        )
    }

    render() {
        return (
            <>
                <header className="header fixed-top">
                    <div className="row">
                        <div className="col-lg-4 offset-lg-4 col-md-8 offset-md-2">

                            <div className="d-flex mb-2 mx-2-- align-items-center header-inner mx-3 mx-md-2 mx-lg-1">
                                <div className="mr-3 flex-grow-1">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text search-icon" onClick={() => this.handleSearchIcon()}>
                                                <i className="fa fa-search"></i>
                                            </span>
                                        </div>
                                        <input
                                            className="form-control search-input"
                                            type="text"
                                            defaultValue={this.state.search_query}
                                            placeholder={Localization.search}
                                            onKeyUp={(e) => this.handleSearchKeyUp(e)}
                                            onChange={e => this.handleSearchChange(e)}
                                        />
                                    </div>
                                </div>

                                {/* <div className=""> */}
                                <div className="bellcontainer d-flex">
                                    {/* fa-bell-o */}
                                    <i className={"fa fa-wifi bell  cursor-pointer " +
                                        (this.props.network_status === NETWORK_STATUS.OFFLINE ? 'text-danger' : '')
                                    }
                                        onClick={() => BaseService.check_network_status()}
                                    ></i>

                                    <i className="fa fa-shopping-cart bell ml-3 cursor-pointer"
                                        title={Localization.shopping_cart}
                                        onClick={() => this.gotoCart()}
                                    ></i>
                                    {
                                        this.props.cart.length ?
                                            <small className="font-weight-bold cursor-pointer"
                                                title={Localization.shopping_cart}
                                                onClick={() => this.gotoCart()}
                                            >({this.props.cart.length})</small>
                                            : ''
                                    }
                                    {this.readerEngineStatus()}

                                </div>
                                {/* </div> */}
                            </div>

                        </div>
                    </div>
                </header>
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
        internationalization: state.internationalization,
        network_status: state.network_status,
        cart: state.cart,
        reader_engine: state.reader_engine
    }
}

export const LayoutMainHeader = connect(state2props, dispatch2props)(LayoutMainHeaderComponent);
