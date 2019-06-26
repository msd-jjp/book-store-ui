import React from 'react';
interface IProps {
    btnClassName: string;
    loading: boolean;
    btnType: 'button' | 'div';
    // btnText: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => any;
    disabled: boolean;
}
interface IState {

}
class BtnLoader extends React.Component<IProps, IState> {
    static defaultProps/* : IProps */ = {
        btnType: 'button',
        disabled: false
    };
    render() {
        return (
            <>
                <this.props.btnType
                    className={this.props.btnClassName}
                    onClick={this.props.onClick}
                    disabled={this.props.loading || this.props.disabled}
                >
                    {
                        (() => {
                            switch (this.props.loading) {
                                case true:
                                    return (
                                        <i className="fa fa-spinner fa-spin"></i>
                                    )
                                default:
                                    return (
                                        <span>{this.props.children}</span>
                                    )
                            }
                        })()
                    }
                </this.props.btnType>
            </>
        )
    }
}

export { BtnLoader }