import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutAccountHeader } from './header/Header';
import { LayoutAccountFooter } from './footer/Footer';

export const RouteLayoutAccount = ({ component: Component, ...rest }: { [key: string]: any }) => {
    return (
        <Route {...rest} render={matchProps => (
            <LayoutAccountComponent>
                <Component {...matchProps} />
            </LayoutAccountComponent>
        )} />
    )
};

class LayoutAccountComponent extends React.Component<any> {
    render() {
        return (
            <>
                <div className="layout-account-wrapper">
                    <LayoutAccountHeader />
                    <main className="main mx-3">
                        <div className="row">
                            <div className="col-md-4 offset-md-4">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
                    <LayoutAccountFooter />
                </div>
            </>
        )
    }
}

export default LayoutAccountComponent;
