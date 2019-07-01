import React from 'react';
import { Route } from 'react-router-dom';
import { LayoutMainHeader } from './header/Header';
import { LayoutMainFooter } from './footer/Footer';

export const RouteLayoutMain = ({ component: Component, ...rest }: { [key: string]: any }) => {
    // console.log("RouteLayout");
    //todo: logic for validate user 

    return (
        <Route {...rest} render={matchProps => (
            <LayoutMainComponent>
                <Component {...matchProps} />
            </LayoutMainComponent>
        )} />
    )
};

class LayoutMainComponent extends React.Component<any> {
    render() {
        return (
            <>
                {/* <div className="container-fluid">
                    <LayoutMainHeader />
                    {this.props.children}
                </div> */}
                <div className="layout-main-wrapper">
                    <LayoutMainHeader />
                    <main className="main mx-3">
                        <div className="row">
                            <div className="col-md-4 offset-md-4">
                                {this.props.children}
                            </div>
                        </div>
                    </main>
                    <LayoutMainFooter />
                </div>
            </>
        )
    }
}

export default LayoutMainComponent; 