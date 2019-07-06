import React from 'react';
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";
import { redux_state } from "../../redux/app_state";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { BookService } from '../../service/service.book';
import { IBook } from '../../model/model.book';

interface IProps {
    internationalization: TInternationalization;
    match: any;
}
interface IState {
    book: IBook | undefined;
}
class BookDetailComponent extends BaseComponent<IProps, IState> {
    state = {
        book: undefined
    }
    private _bookService = new BookService();
    //get route id
    //search base on bookId

    componentDidMount() {
        this.fetchBook(this.props.match.params.bookId);
    }

    fetchBook(bookId: string) {
        this._bookService.get(bookId).catch(error => {
            this.handleError({ error: error });
        });
    }

    render() {
        return (
            <>
                <div>error occured</div>
                <div>book name: </div>
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
        internationalization: state.internationalization
    }
}

export const BookDetail = connect(state2props, dispatch2props)(BookDetailComponent);
