import React from 'react';
import { Localization } from '../../../../config/localization/localization';

export class LayoutMainNotFound extends React.PureComponent { // React.Component
    onGifLoaded(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        e.currentTarget.style.zIndex = '0'
    }
    render() {
        return (
            <>
                <div className="layout-main-not-found mt-3">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="text-danger">{Localization.page_not_found}</h1>
                            {/* <img src="/static/media/img/icon/empty-shopping-cart.svg"
                                className="w-200px"
                                alt={Localization.page_not_found}
                                loading="lazy"
                            /> */}
                            <figure>
                                <img className="img-base"
                                    src="/static/media/img/icon/404-page.png"
                                    alt={Localization.page_not_found}
                                    title={Localization.page_not_found}
                                    loading="lazy" />
                                <img className="img-gif"
                                    src="/static/media/img/icon/404-page.gif"
                                    alt={Localization.page_not_found}
                                    title={Localization.page_not_found}
                                    loading="lazy" onLoad={(e) => this.onGifLoaded(e)} />
                            </figure>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

// export default NotFound;