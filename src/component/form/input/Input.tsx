import React from 'react';

interface InputProps {
    // value?: any;
    defaultValue?: any;
    onChange: (value: any, isValid: boolean) => void;
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
    inputRef!: HTMLInputElement;


    setValidate(value: any) {
        this.setState({ ...this.state, invalid: !this.handleValidate(value) });
    }
    componentDidMount() {
        this.setValidate(this.props.defaultValue);
    }
    componentWillReceiveProps(props: InputProps) {
        // this.setValidate(props.value);
    }
    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setValidate(event.target.value);
        this.props.onChange(event.target.value, this.handleValidate(event.target.value)); // pass "this.handleValidate(event.target.value)"
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
        // if (this.props.required && !this.props.defaultValue) {
        if (this.props.required && (this.inputRef && !this.inputRef.value)) {
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
    setRef(el: HTMLInputElement | null) {
        if (el) {
            this.inputRef = el;
            this.props.elRef && this.props.elRef(el);
        }
    }
    render() {
        return (
            <div className="form-group">
                <label htmlFor={this.id}>{this.props.label}</label>
                <input
                    id={this.id}
                    type={this.props.type}
                    className={`form-control ${this.state.invalid && this.state.touched ? 'is-invalid' : ''}`}
                    // value={this.props.value}
                    defaultValue={this.props.defaultValue}
                    onChange={e => this.handleChange(e)}
                    // ref={this.props.elRef}
                    ref={inputEl => this.setRef(inputEl)}
                    onBlur={() => this.onBlur()}
                />
                {this.invalidFeedback()}
            </div>
        )
    }
}

export default Input;