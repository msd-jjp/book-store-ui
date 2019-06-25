import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutAccountHeader } from './header/Header';

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
                <div className="layout-wrapper">
                    <LayoutAccountHeader />
                    <main className="main mx-3">
                        {this.props.children}
                    </main>
                </div>
            </>
        )
    }
}

export default LayoutAccountComponent;
