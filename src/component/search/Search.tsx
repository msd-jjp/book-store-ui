import React from 'react';
import { BaseComponent } from '../_base/BaseComponent';
import { History } from "history";
import { TInternationalization } from '../../config/setup';
import { IToken } from '../../model/model.token';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { BookService } from '../../service/service.book';
import { Localization } from '../../config/localization/localization';
import { ToastContainer } from 'react-toastify';

interface IProps {
    internationalization: TInternationalization;
    history: History;
    token: IToken;
    match: any;
}
interface IState {

}
class SearchComponent extends BaseComponent<IProps, IState> {
    state = {};
    private _bookService = new BookService();
    componentDidMount() {
        this.gotoTop();
        // this._bookService.setToken(this.props.token);

        /*  this.setState({
             ...this.state,
             categoryType: this.props.match.params.searchType,
             categoryTitle: this.props.match.params.searchValue,
         }, this.fetchCategoryBooks); */
    }
    gotoBookDetail(bookId: string) {
        this.props.history.push(`/book-detail/${bookId}`);
    }
    book_list_render() {
        return (
            <>
                <div className="book-list-wrapper mt-3">
                    {[1, 1, 1, 1, 1, 2, 1, 1, 3, 3, 4, 5, 2, 2, 2, 1, 2].map((book: any, bookIndex) => (
                        <div className="book-list-item pb-2 mb-2" key={bookIndex}>
                            <div className="row">
                                <div className="img-wrapper col-4" onClick={() => this.gotoBookDetail(book.id)}>
                                    <div>
                                        <img src="/static/media/img/icon/default-book.png" alt="book" />
                                    </div>
                                </div>
                                <div className="detail-wrapper col-8 p-align-0">
                                    <div className="book-title">book title is every thing</div>
                                    <span className="book-writer text-muted py-2 small">book writer is every one</span>
                                    <span className="book-progress mr-2 small">7%</span>
                                    <span className="book-volume small">789.3 kb</span>
                                    <i className="fa fa-check-circle downloaded-icon"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }
    render() {
        return (
            <>
                <div className="search-wrapper">
                    {this.book_list_render()}
                </div>

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
        internationalization: state.internationalization,
        token: state.token
    }
}

export const Search = connect(state2props, dispatch2props)(SearchComponent);
