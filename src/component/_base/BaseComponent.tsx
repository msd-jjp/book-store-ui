import React from 'react';

interface ErrorObj {

}

export class BaseComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {

    handleError(errorObj: ErrorObj): string | void {

    }
}