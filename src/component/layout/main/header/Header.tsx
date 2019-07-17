import React from 'react';
// import { NavLink } from 'react-router-dom';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../../../redux/action/user';
import { redux_state } from '../../../../redux/app_state';
import { Localization } from '../../../../config/localization/localization';
import { History } from "history";

interface IProps {
    history: History;
    match: any;
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

    render() {
        return (
            <>
                <header className="header fixed-top">
                    <div className="row mb-2 mx-2 align-items-center header-inner">
                        <div className="col-10">
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
                        <div className="col-1">
                            <div className="bellcontainer">
                                <i className="fa fa-bell-o bell"></i>
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
        do_logout: () => dispatch(action_user_logged_out()),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization
    }
}

export const LayoutMainHeader = connect(state2props, dispatch2props)(LayoutMainHeaderComponent);
