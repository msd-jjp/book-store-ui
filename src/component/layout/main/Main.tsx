import React from 'react';
import { Route } from 'react-router-dom';
import {LayoutMainHeader} from './header/Header';

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
                <div className="container-fluid">
                    <LayoutMainHeader />
                    {this.props.children}
                </div>
            </>
        )
    }
}

export default LayoutMainComponent; 