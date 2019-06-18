import React from 'react';
import { Route } from 'react-router-dom';
import {LayoutMain_Header} from './header/Header';

export const RouteLayout = ({ component: Component, ...rest }: { [key: string]: any }) => {
    console.log("RouteLayout");
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
                    <LayoutMain_Header />
                    {this.props.children}
                </div>
            </>
        )
    }
}

export default LayoutMainComponent; 