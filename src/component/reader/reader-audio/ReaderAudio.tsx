import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { IUser } from "../../../model/model.user";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { History } from "history";
import { IToken } from "../../../model/model.token";
import { ToastContainer } from "react-toastify";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";
import { PersonService } from "../../../service/service.person";
import { action_user_logged_in } from "../../../redux/action/user";
import { IBook } from "../../../model/model.book";
import { ILibrary_schema } from "../../../redux/action/library/libraryAction";

interface IProps {
    logged_in_user: IUser | null;
    internationalization: TInternationalization;
    history: History;
    token: IToken;
    network_status: NETWORK_STATUS;
    onUserLoggedIn: (user: IUser) => void;
    match: any;
    library: ILibrary_schema;
}

interface IState {
    book: IBook | undefined;

}

class ReaderAudioComponent extends BaseComponent<IProps, IState> {
    private book_id: string = '';

    state = {
        book: undefined,

    };

    private _personService = new PersonService();

    private book_page_length = 2500;
    private book_active_page = 372;

    constructor(props: IProps) {
        super(props);

        this._personService.setToken(this.props.token);
        this.book_id = this.props.match.params.bookId;
    }

    componentDidMount() {
        this.updateUserCurrentBook_client();
        this.setBook_byId(this.book_id);
        this.updateUserCurrentBook_server();
        // this.initSwiper();
    }

    updateUserCurrentBook_client() {
        let logged_in_user = { ...this.props.logged_in_user! };
        if (!logged_in_user) return;
        const book = this.getBookFromLibrary(this.book_id);
        logged_in_user.person.current_book = book;
        this.props.onUserLoggedIn(logged_in_user);

        this.setState({ ...this.state, book: this.getBookFromLibrary(this.book_id) });
    }

    getBookFromLibrary(book_id: string): IBook {
        const lib = this.props.library.data.find(lib => lib.book.id === book_id);
        return (lib! || {}).book;
    }

    setBook_byId(book_id: string) {
        this.setState({ ...this.state, book: this.getBookFromLibrary(book_id) });
    }

    async updateUserCurrentBook_server() {
        if (!this.book_id) return;
        if (this.props.network_status === NETWORK_STATUS.OFFLINE) return;

        await this._personService.update(
            { current_book_id: this.book_id },
            this.props.logged_in_user!.person.id
        ).catch(e => {
            // this.handleError({ error: e.response });
        });
    }

    audio_header_render() {
        return (
            <div className="audio-header">
                <div className="row">
                    <div className="col-12">
                        <div className="icon-wrapper">
                            <i className="fa fa-arrow-left-app text-dark p-2 cursor-pointer go-back"
                                onClick={() => this.goBack()}
                            ></i>

                            <h5 className="book-title mb-0 text-center">{this.getBookTitle()}</h5>
                            {/* <i className="fa fa-bars text-dark p-2 cursor-pointer"
                onClick={() => this.showSidebar()}
              ></i> */}


                        </div>
                    </div>
                </div>
            </div>
        )
    }

    getBookTitle(): string {
        const book: IBook | undefined = this.state.book;
        if (!book) return '';
        return book!.title;
    }

    audio_body_render() {
        return (
            <>
                <div className="audio-body my-3--">
                    {/* <h5 className="book-title mt-3 text-center">{this.getBookTitle()}</h5> */}

                </div>
            </>
        )
    }

    audio_footer_render() {
        return (
            <>
                <div className="audio-footer">

                </div>
            </>
        )
    }

    goBack() {
        if (this.props.history.length > 1) { this.props.history.goBack(); }
        else { this.props.history.push(`/dashboard`); }
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-12 px-0">
                        <div className="reader-audio-wrapper mt-3-- mb-5--">
                            {this.audio_header_render()}
                            {this.audio_body_render()}
                            {this.audio_footer_render()}
                        </div>
                    </div>
                </div>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        );
    }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
    };
};

const state2props = (state: redux_state) => {
    return {
        logged_in_user: state.logged_in_user,
        internationalization: state.internationalization,
        token: state.token,
        network_status: state.network_status,
        library: state.library,
    };
};

export const ReaderAudio = connect(state2props, dispatch2props)(ReaderAudioComponent);
