import React from 'react';

interface numberProps {
    value?: any; // number
    onChange: (value: any) => void;
    elRef?: (elName: HTMLInputElement) => void;
}
interface numberState {
    invalid?: boolean;
}

class Number extends React.Component<numberProps, numberState> {
    state: numberState;
    constructor(props: numberProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

        this.state = {};
    }

    componentDidMount() {
        // debugger;
        this.setState({ ...this.state, invalid: !this.numberValidate(this.props.value) });
    }

    componentWillUpdate() {
        // debugger;
    }
    componentDidUpdate() {
        // debugger;
    }

    componentWillReceiveProps(props: numberProps) {
        // debugger;
        this.setState({ ...this.state, invalid: !this.numberValidate(props.value) });
    }

    numberValidate(val: any): boolean {
        if (val) {
            return !isNaN(val);
        }
        return true;
    }

    handleChange(event: any) {
        this.setState({ ...this.state, invalid: !this.numberValidate(event.target.value) });
        this.props.onChange(event.target.value);
        /* if (this.props.onChange) {
            this.props.onChange && this.props.onChange(event.target.value);

        } else {
            this.props.value = event.target.value;
        } */
    }

    render() {
        return (
            <div className="form-group">
                <input type="text"
                    className={`form-control ${this.state.invalid ? 'is-invalid' : ''}`}
                    value={this.props.value}
                    onChange={this.handleChange}
                    ref={this.props.elRef}
                />
            </div>
        )
    }
}

export default Number;