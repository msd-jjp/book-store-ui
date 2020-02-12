import React from 'react';
import { Localization } from '../../../../../config/localization/localization';
import { CmpUtility } from '../../../../_base/CmpUtility';

export class LayoutMainNotFound extends React.PureComponent { // React.Component
    componentDidMount() {
        CmpUtility.gotoTop();
        document.title = Localization.page_not_found;
    }
    componentWillUnmount() {
        document.title = Localization.app_title;
    }
    onGifLoaded(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        e.currentTarget.style.zIndex = '0'
    }
    render() {
        return (
            <>
                <div className="layout-main-not-found mt-3 mb-5">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className="text-muted">{Localization.page_not_found}</h1>
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