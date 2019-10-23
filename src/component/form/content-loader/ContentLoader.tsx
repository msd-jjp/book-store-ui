import React from 'react';

interface IProps {
    show?: boolean;
    gutterClassName?: 'gutter-15' | 'gutter-0' | 'gutter-n1r';
    colorClassName?: 'system';
}

export class ContentLoader extends React.PureComponent<IProps> {
    private loader_dots = [1, 2, 3, 4, 5, 6, 7, 8];
    private checkVisibility(): boolean {
        if (this.props.show === undefined) return true;
        return this.props.show;
    }
    render() {
        return (
            <>
                <div className={
                    `lds-roller-wrapper ${this.props.gutterClassName} lds-roller-${this.props.colorClassName} `
                    + (this.checkVisibility() ? '' : 'd-none')
                }>
                    <div className="lds-roller">
                        {this.loader_dots.map(dot => <div key={dot}></div>)}
                    </div>
                </div>
            </>
        )
    }
}
