import React from 'react';
// import { NavLink } from 'react-router-dom';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
// import { action_user_logged_out } from '../../../../redux/action/user';
import { redux_state } from '../../../../redux/app_state';
import { Localization } from '../../../../config/localization/localization';
import { History } from "history";
import { NETWORK_STATUS } from '../../../../enum/NetworkStatus';
// import { action_set_network_status } from '../../../../redux/action/netwok-status';
import { BaseService } from '../../../../service/service.base';
import { ICartItems } from '../../../../redux/action/cart/cartAction';

interface IProps {
    history: History;
    match: any;
    network_status: NETWORK_STATUS;
    // set_network_status?: (network_status: NETWORK_STATUS) => any;
    cart: ICartItems;
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
    /* check_network_status() {
        if (this.props.network_status === NETWORK_STATUS.ONLINE) {
            if (BaseService.isAppOffline()) {
                this.props.set_network_status && this.props.set_network_status(NETWORK_STATUS.OFFLINE);
            }

        } else if (this.props.network_status === NETWORK_STATUS.OFFLINE) {
            if (!BaseService.isAppOffline()) {
                this.props.set_network_status && this.props.set_network_status(NETWORK_STATUS.ONLINE);
            }
        }
    } */

    render() {
        return (
            <>
                <header className="header fixed-top">
                    <div className="row">
                        <div className="col-lg-4 offset-lg-4 col-md-8 offset-md-2">

                            <div className="row mb-2 mx-2 align-items-center header-inner">
                                <div className="col-10-- col-md-10-- col-md-8 col-sm-8 col-6">
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
                                <div className="col-2-- col-md-2-- col-md-4 col-sm-4 col-6">
                                    <div className="bellcontainer">
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

                                    </div>
                                </div>
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
        // do_logout: () => dispatch(action_user_logged_out()),
        // set_network_status: (network_status: NETWORK_STATUS) => dispatch(action_set_network_status(network_status)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        network_status: state.network_status,
        cart: state.cart,
    }
}

export const LayoutMainHeader = connect(state2props, dispatch2props)(LayoutMainHeaderComponent);
