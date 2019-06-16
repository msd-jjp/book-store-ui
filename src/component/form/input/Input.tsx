import React from 'react';

interface InputProps {
    value?: any;
    onChange: (value: any) => void;
    elRef?: (elName: HTMLInputElement) => void;
    pattern?: RegExp;
    patternName?: 'password' | 'number' | 'email';
    patternError?: string;
    type?: 'text' | 'password';
    label?: string;
    required?: boolean;
}
interface InputState {
    invalid?: boolean;
    touched?: boolean;
}

class Input extends React.Component<InputProps, InputState> {
    state = {
        invalid: false,
        touched: false
    };
    static defaultProps = {
        type: 'text'
    };
    id = 'input_' + Math.random();


    setValidate(value: any) {
        this.setState({ ...this.state, invalid: !this.handleValidate(value) });
    }
    componentDidMount() {
        this.setValidate(this.props.value);
    }
    componentWillReceiveProps(props: InputProps) {
        // this.setValidate(props.value);
    }
    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setValidate(event.target.value);
        this.props.onChange(event.target.value);
    }
    onBlur() {
        this.setState({ ...this.state, touched: true });
    }
    handleValidate(val: any): boolean {
        if (this.props.required && !val) {
            return false;
        } else if (this.props.pattern) {
            return this.props.pattern.test(val);
        }
        return true;
    }
    invalidFeedback() {
        let invalidMsg = 'invalid value';
        if (this.props.required && !this.props.value) {
            invalidMsg = 'this field is required';
        } else if (this.props.patternError) {
            invalidMsg = this.props.patternError;
        }
        return (
            <div className="invalid-feedback">
                {invalidMsg}
            </div>
        )
    }
    render() {
        return (
            <div className="form-group">
                <label htmlFor={this.id}>{this.props.label}</label>
                <input
                    id={this.id}
                    type={this.props.type}
                    className={`form-control ${this.state.invalid && this.state.touched ? 'is-invalid' : ''}`}
                    value={this.props.value}
                    onChange={e => this.handleChange(e)}
                    ref={this.props.elRef}
                    onBlur={() => this.onBlur()}
                />
                {this.invalidFeedback()}
            </div>
        )
    }
}

export default Input;