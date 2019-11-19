import React from 'react';
import { Localization } from '../../../config/localization/localization';

interface InputProps {
    defaultValue?: any;
    onChange?: (value: any, isValid: boolean) => void;
    elRef?: (elName: HTMLInputElement | HTMLTextAreaElement) => void;
    pattern?: RegExp;
    patternName?: 'password' | 'number' | 'email';
    patternError?: string;
    label?: string;
    required?: boolean;
    validationFunc?: (value: any) => boolean;
    placeholder?: string;
    type?: 'text' | 'password';
    is_textarea?: boolean;
    textarea_rows?: number;
    readOnly?: boolean;
    disabled?: boolean;
    hideError?: boolean;
    hideErrorMsg?: boolean;
    className?: string;
    onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
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
    inputRef!: HTMLInputElement | HTMLTextAreaElement;


    setValidate(value: any) {
        this.setState({ ...this.state, invalid: !this.handleValidate(value) });
    }
    componentDidMount() {
        this.setValidate(this.props.defaultValue);
    }
    componentWillReceiveProps(props: InputProps) {
        if (
            (this.handleValidate(props.defaultValue) !== !this.state.invalid)
            &&
            (!this.isEmpty(this.props.defaultValue) || !this.isEmpty(props.defaultValue))
        ) {
            this.setValidate(props.defaultValue);
            this.props.onChange && this.props.onChange(props.defaultValue, this.handleValidate(props.defaultValue));
        }
    }
    isEmpty(val: any): boolean {
        if (val || val === 0) { return false }
        return true;
    }
    handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const e_target_value = event.target.value;
        this.setValidate(e_target_value);
        this.props.onChange && this.props.onChange(e_target_value, this.handleValidate(e_target_value));
    }
    onBlur() {
        this.setState({ ...this.state, touched: true });
    }
    handleValidate(val: any): boolean {
        if (this.props.required && !val) {
            return false;
        } else if (this.props.pattern && val) {
            if (!this.props.validationFunc) {
                return this.props.pattern.test(val);
            } else {
                return this.props.pattern.test(val) && this.props.validationFunc(val);
            }
        } else if (this.props.validationFunc) {
            return this.props.validationFunc(val);
        }
        return true;
    }
    invalidFeedback() {
        let invalidMsg = Localization.invalid_value;
        // if (this.props.required && !this.props.defaultValue) {
        if (this.props.required && (this.inputRef && !this.inputRef.value)) {
            invalidMsg = Localization.required_field; // this field is required
        } else if (this.props.patternError) {
            invalidMsg = this.props.patternError;
        }

        if (!this.state.invalid || this.props.hideErrorMsg) { return; }

        return (
            <div className="invalid-feedback">
                {invalidMsg}
            </div>
        )
    }
    setRef(el: HTMLInputElement | HTMLTextAreaElement | null) {
        if (el) {
            this.inputRef = el;
            this.props.elRef && this.props.elRef(el);
        }
    }
    render() {
        return (
            <div className={
                "app-input form-group "
                + (this.props.readOnly ? 'input-readonly' : '')
                + ' '
                + (this.props.className ? this.props.className : '')
            }>
                {
                    this.props.label &&
                    <label htmlFor={this.id}>
                        {this.props.label}
                        {
                            this.props.required ?
                                <span className="text-danger">*</span>
                                : ''
                        }
                    </label>
                }
                {
                    !this.props.is_textarea
                        ?
                        <input
                            id={this.id}
                            type={this.props.type}
                            className={
                                `form-control ${
                                (this.state.invalid && this.state.touched && !this.props.hideError)
                                    ?
                                    'is-invalid' : ''
                                }`
                            }
                            // value={this.props.defaultValue || ''}
                            value={(this.props.defaultValue || this.props.defaultValue === 0) ? this.props.defaultValue : ''}
                            // defaultValue={this.props.defaultValue}
                            onChange={e => this.handleChange(e)}
                            // ref={this.props.elRef}
                            ref={inputEl => this.setRef(inputEl)}
                            onBlur={() => this.onBlur()}
                            placeholder={this.props.placeholder}
                            readOnly={this.props.readOnly}
                            disabled={this.props.disabled}
                            onKeyUp={(e) => this.props.onKeyUp && this.props.onKeyUp(e)}
                        />
                        :
                        <textarea
                            id={this.id}
                            className={
                                `form-control ${
                                (this.state.invalid && this.state.touched && !this.props.hideError)
                                    ?
                                    'is-invalid' : ''
                                }`
                            }
                            rows={this.props.textarea_rows || 4}

                            // defaultValue={this.props.defaultValue}
                            // value={this.props.defaultValue || ''}
                            value={(this.props.defaultValue || this.props.defaultValue === 0) ? this.props.defaultValue : ''}
                            onChange={e => this.handleChange(e)}
                            ref={inputEl => this.setRef(inputEl)}
                            onBlur={() => this.onBlur()}
                            placeholder={this.props.placeholder}

                            readOnly={this.props.readOnly}
                            disabled={this.props.disabled}
                        ></textarea>
                }

                {this.invalidFeedback()}
            </div>
        )
    }
}

export { Input };