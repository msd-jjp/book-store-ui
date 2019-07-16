import React from 'react';
import { BaseComponent } from '../_base/BaseComponent';
import { History } from "history";
import { TInternationalization } from '../../config/setup';
import { IToken } from '../../model/model.token';
import { MapDispatchToProps, connect } from 'react-redux';
import { Dispatch } from 'redux';
import { redux_state } from '../../redux/app_state';
import { BookService } from '../../service/service.book';

interface IProps {
    internationalization: TInternationalization;
    history: History;
    token: IToken;
    match: any;
}
interface IState {
    searchType: 'tag' | 'genre' | undefined;
    searchValue: string | undefined;
}

class CategoryComponent extends BaseComponent<IProps, IState>{
    state = {
        searchType: undefined,
        searchValue: undefined,
    };
    private _bookService = new BookService();
    // searchType!: 'tag' | 'genre';
    // searchValue!: string;

    componentDidMount() {
        this._bookService.setToken(this.props.token);
        // this.searchType = this.props.match.params.searchType;
        // this.searchValue = this.props.match.params.searchValue;
        this.setState({
            ...this.state,
            searchType: this.props.match.params.searchType,
            searchValue: this.props.match.params.searchValue,
        });
    }
    render() {
        return (
            <>
                <div className="category-wrapper">
                    <div className="category-barnd text-center py-2">
                        <div className="brand-name ">
                            {this.state.searchValue}
                        </div>
                        <span className="page-count">from 1 to 20</span>
                    </div>
                    <div className="cards-wrapper mt-3">
                        {[1, 1, 1, 1, 1, 1, 1, 1].map((book, bookIndex) => (

                            <div className="card-pattern tablet-hide kc-four-columns" key={bookIndex}>
                                <div className="kc-rank-card-section-one">
                                    <div className="kc-rank-card-rank-section">
                                        <div className="kc-rank-card-rank">
                                            {bookIndex + 1}
                                        </div>
                                    </div>
                                    <div className="kc-book-title-img-section">
                                        <div className="kc-book-title-img">
                                            <a className="kc-cover-link app-specific-display not_app"
                                                href="/dp/B078GD3DRG/ref=chrt_bk_rd_fc_1_ci_lp">
                                                <img src="/static/media/img/icon/default-book.png" alt="book" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="kc-rank-card-metadata">
                                    <div className="metadata-card" style={{ width: '100%' }}>
                                        <div className="kc-wol">42 weeks on the list</div>
                                        <div className="kc-rank-card-title">
                                            Where the Crawdads Sing
                    </div>
                                        <div className="kc-rank-card-author" title="Delia Owens">
                                            by Delia Owens
                    </div>
                                        <div className="kc-rank-card-publisher" title="G.P. Putnam's Sons">
                                            PUBLISHER: G.P. Putnam's Sons
                    </div>
                                        <div className="kc-rank-card-agent" title="Russell Galen">
                                            AGENT: Russell Galen
                    </div>
                                        <div className="kc-rank-card-badge">
                                        </div>
                                    </div>
                                </div>
                                <div className="kc-rank-card-bar top-rated">
                                    <div className="kc-data-story-content">
                                        <div className="kc-data-story-mini-content">
                                            <div className="kc-mini-data-story-heading-container">
                                                <div className="data-story-mini-icon data-story-icon-primary"
                                                    style={
                                                        {
                                                            background: "url('https://d1qk1dikeufk31.cloudfront.net/images/data-stories/mini/icon-top-rated.svg')",
                                                            backgroundSize: "40px 40px"
                                                        }
                                                    }>
                                                </div>
                                                <span className="kc-rank-card-bar-heading">CUSTOMER REVIEWS</span>
                                            </div>
                                            <div className="star-rating">
                                                <div className="stars small-stars">
                                                    <i className="fa fa-star full-star"></i>
                                                    <i className="fa fa-star full-star"></i>
                                                    <i className="fa fa-star full-star"></i>
                                                    <i className="fa fa-star full-star"></i>
                                                    <i className="fa fa-star full-star"></i>
                                                </div>
                                                <div className="numeric-star-data">
                                                    <small>4.8 / 16,667 REVIEWS</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ))}

                    </div>
                </div>
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

export const Category = connect(state2props, dispatch2props)(CategoryComponent);
