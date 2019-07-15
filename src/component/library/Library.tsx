import React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { action_user_logged_out } from '../../redux/action/user';
import { redux_state } from '../../redux/app_state';
import { IUser } from '../../model/model.user';
import { TInternationalization } from '../../config/setup';
import { action_change_app_flag } from '../../redux/action/internationalization';
import { BaseComponent } from '../_base/BaseComponent';
import { Localization } from '../../config/localization/localization';

export interface IProps {
    logged_in_user?: IUser | null;

    do_logout?: () => void;
    change_app_flag?: (internationalization: TInternationalization) => void;
    internationalization: TInternationalization;
}

enum LIBRARY_VIEW {
    grid = 'grid', list = 'list', collections = 'collections'
}

interface IState {
    library_view: LIBRARY_VIEW;
}

class LibraryComponent extends BaseComponent<IProps, IState> {
    state = {
        library_view: LIBRARY_VIEW.grid
    }
    view_grid_render() {
        return (
            <>
                <div className="library-view-grid-wrapper mr-3 mt-3">
                    <div className="row">
                        {
                            [1, 1, 1, 1, 1, 2, 1, 1, 3, 3, 4, 5, 2, 2, 2, 1, 2].map((item, index) => (
                                <div className="col-4 p-align-inverse-0 mb-3" key={index}>
                                    <div className="item-wrapper">
                                        <img src="static/media/img/icon/default-book.png"
                                            alt="book"
                                            className="library-grid-book-show" />

                                        <div className="book-progress-state">
                                            <div className="bp-state-number">
                                                <div className="text">7%</div>
                                            </div>
                                            <div className="bp-state-arrow" />
                                        </div>
                                        <div className="book-download">
                                            <i className="fa fa-check" />
                                        </div>
                                    </div>
                                </div>
                            ))
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
                    {[1, 1, 1, 1, 1, 2, 1, 1, 3, 3, 4, 5, 2, 2, 2, 1, 2].map((item, index) => (
                        <div className="view-list-item py-2__ pb-2 mb-2" key={index}>
                            <div className="list-row__ row">
                                <div className="img-wrapper col-4">
                                    <div className="img-container__ mt-2__">
                                        <img src="static/media/img/icon/default-book.png" alt="book" />
                                    </div>
                                </div>
                                <div className="detail-wrapper col-8 p-align-0">
                                    <div className="book-title">book title is every thing</div>
                                    <span className="book-writer text-muted py-2 small">book writer is every one</span>
                                    <span className="book-progress mr-2 small">7%</span>
                                    <span className="book-volume small">789.3 kb</span>
                                    <i className="fa fa-check-circle downloaded-icon"></i>
                                </div>
                                {/* <div className="col-2 text-right is-downloaded pt-1">
                                    
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }
    view_collection_render() {
        return (
            <>
            </>
        )
    }
    change_library_view_test() {
        if (this.state.library_view === LIBRARY_VIEW.grid) {
            this.setState({ ...this.state, library_view: LIBRARY_VIEW.list });
        } else {
            this.setState({ ...this.state, library_view: LIBRARY_VIEW.grid });
        }

    }
    render() {
        return (
            <>
                <div className="library-wrapper">
                    <div className="library-menu pt-2__">
                        <div className="row menu-wrapper__">
                            <div className="col-3">
                                <div className="filter-library pl-2__">
                                    <i className="fa fa-filter text-dark p-2"></i>
                                </div>
                            </div>
                            <div className="col-6 filter-option text-center">
                                <span className="filter-link text-uppercase mr-3 active">{Localization.all}</span>
                                <span className="filter-link text-uppercase ">{Localization.downloaded}</span>
                            </div>
                            <div className="col-3 text-right">
                                <div className="view-library pr-2__">
                                    <i className="fa fa-sliders text-dark p-2" onClick={() => this.change_library_view_test()}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(() => {
                        switch (this.state.library_view) {
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
            </>
        )
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        do_logout: () => dispatch(action_user_logged_out()),
        change_app_flag: (internationalization: TInternationalization) => dispatch(action_change_app_flag(internationalization)),
    }
}

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization
    }
}

export const Library = connect(state2props, dispatch2props)(LibraryComponent);
