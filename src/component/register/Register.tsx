import React from 'react';
import Input from '../form/input/Input';
import { RegisterService } from '../../service/service.register';

enum REGISTER_STEP {
    submit_mobile = 'submit_mobile',
    validate_mobile = 'validate_mobile',
    register = 'register'
}
interface IState {
    registerStep: REGISTER_STEP;
    mobile: {
        value: string | undefined;
        isValid: boolean;
    };
    code: {
        value: string | undefined;
        isValid: boolean;
    };
    name: {
        value: string | undefined;
        isValid: boolean;
    };
    username: {
        value: string | undefined;
        isValid: boolean;
    };
    password: {
        value: string | undefined;
        isValid: boolean;
    };
    confirmPassword: {
        value: string | undefined;
        isValid: boolean;
    };
    isFormValid: boolean;
}
type TInputType = 'username' | 'password' | 'name' | 'code' | 'mobile' | 'confirmPassword';
type TInputElType = 'inputElUsername' | 'inputElPassword' |
    'inputElName' | 'inputElCode' | 'inputElMobile' | 'inputElConfirmPassword';

class Register extends React.Component<any, IState> {
    props: any;
    state: IState = {
        registerStep: REGISTER_STEP.submit_mobile,
        mobile: {
            value: undefined,
            isValid: false,
        },
        code: {
            value: undefined,
            isValid: false,
        },
        name: {
            value: undefined,
            isValid: false,
        },
        username: {
            value: undefined,
            isValid: false,
        },
        password: {
            value: undefined,
            isValid: false,
        },
        confirmPassword: {
            value: undefined,
            isValid: false,
        },
        isFormValid: false
    };
    inputElUsername!: HTMLInputElement;
    inputElPassword!: HTMLInputElement;
    inputElName!: HTMLInputElement;
    inputElCode!: HTMLInputElement;
    inputElMobile!: HTMLInputElement;
    inputElConfirmPassword!: HTMLInputElement;
    private _registerService = new RegisterService();
    signup_token!: string;

    componentDidMount() {
        this.focusOnInput('inputElMobile');
    }

    gotoLogin() {
        this.props.history.push('/login');
    }
    handleInputChange(val: any, isValid: boolean, inputType: TInputType) {
        const isFormValid = this.validateForm(isValid, inputType);
        this.setState({ ...this.state, [inputType]: { value: val, isValid }, isFormValid });
    }
    validateForm(currentInput_isValid: boolean, inputType: TInputType): boolean {
        if (this.state.registerStep === REGISTER_STEP.submit_mobile) {
            if (inputType !== 'mobile') {
                // check env.dev
                throw new Error('should not happen !!!');
            }
            return currentInput_isValid;
        } else if (this.state.registerStep === REGISTER_STEP.validate_mobile) {
            if (inputType !== 'code') {
                // check env.dev
                throw new Error('should not happen !!!');
            }
            return currentInput_isValid;
        } else if (this.state.registerStep === REGISTER_STEP.register) {
            const registerStep_inputList: TInputType[] = ['confirmPassword', 'name', 'password', 'username'];
            const registerStep_inputList_exceptThisInput = registerStep_inputList.filter(inp => inp !== inputType);

            let regFormValidate = currentInput_isValid;
            registerStep_inputList_exceptThisInput.forEach(inp => {
                let inpObj: /* { value: string | undefined, isValid: boolean } */any = this.state[inp];
                regFormValidate = inpObj.isValid && regFormValidate;
            })
            return regFormValidate;
        } else {
            // todo check env.dev
            throw new Error('should not happen !!!');
        }
    }

    focusOnInput(inputEl: TInputElType): void {
        this[inputEl].focus();
    }

    submit_mobile_render() {
        if (this.state.registerStep === REGISTER_STEP.submit_mobile) {
            return (
                <>
                    <Input
                        defaultValue={this.state.mobile.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'mobile') }}
                        label="mobile"
                        pattern={/^.{6,}$/}
                        patternError={'mobile format is not valid.'}
                        elRef={input => { this.inputElMobile = input; }}
                    />

                    <div className="form-group">
                        <button className="btn btn-info mr-3"
                            onClick={() => this.onSubmit_mobile()}
                            disabled={!this.state.isFormValid}
                        >submit your mobile</button>
                    </div>
                </>
            )
        }
    }
    async onSubmit_mobile() {
        if (!this.state.isFormValid) { return; }
        let { data: { message: smsCode } } = await this._registerService.sendCode({ cell_no: this.state.mobile.value! });
        alert(smsCode);
        this.setState(
            {
                ...this.state,
                registerStep: REGISTER_STEP.validate_mobile,
                isFormValid: false
            },
            () => this.focusOnInput('inputElCode')
        );
    }
    server_getCode() {
        // check if counter is 0; 60--> 0
        // send again else wait
    }
    validate_mobile_render() {
        if (this.state.registerStep === REGISTER_STEP.validate_mobile) {
            return (
                <>
                    <div>mobile: {this.state.mobile.value}
                        <small className="text-info"
                            onClick={() => this.from_validate_mobile_to_Submit_mobile()}
                        >edit</small></div>

                    <Input
                        defaultValue={this.state.code.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'code') }}
                        label="code"
                        pattern={/^.{4,}$/}
                        patternError={'code is not valid.'}
                        elRef={input => { this.inputElCode = input; }}
                    />

                    <div className="form-group">
                        <button className="btn btn-info mr-3"
                            onClick={() => this.onValidate_mobile()}
                            disabled={!this.state.isFormValid}
                        >submit code</button>
                    </div>

                    <small><span>send again</span> <span>38</span></small>
                </>
            )
        }
    }
    async onValidate_mobile() {
        if (!this.state.isFormValid) { return; }
        let response = await this._registerService.activateAcount(
            { cell_no: this.state.mobile.value!, activation_code: this.state.code.value! }
        );
        debugger;
        this.signup_token = response.data.signup_token;
        this.setState({ ...this.state, registerStep: REGISTER_STEP.register, isFormValid: false });
    }
    from_validate_mobile_to_Submit_mobile() {
        this.setState(
            {
                ...this.state,
                registerStep: REGISTER_STEP.submit_mobile,
                isFormValid: true, // note: we go back to last step and isFormValid is true there.
                code: { value: undefined, isValid: false }
            },
            () => this.focusOnInput('inputElMobile')
        );
    }

    register_render() {
        if (this.state.registerStep === REGISTER_STEP.register) {
            return (
                <>
                    <Input
                        defaultValue={this.state.name.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'name') }}
                        label="name"
                        required
                        elRef={input => { this.inputElName = input; }}
                    />
                    <Input
                        defaultValue={this.state.username.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'username') }}
                        label="username"
                        required
                        elRef={input => { this.inputElUsername = input; }}
                    />
                    <Input
                        defaultValue={this.state.password.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                        label="password"
                        required
                        elRef={input => { this.inputElPassword = input; }}
                    />
                    <Input
                        defaultValue={this.state.confirmPassword.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'confirmPassword') }}
                        label="confirm password"
                        required
                        elRef={input => { this.inputElConfirmPassword = input; }}
                    />

                    <div className="form-group">
                        <button className="btn btn-info mr-3"
                            onClick={() => this.onRegister()}
                            disabled={!this.state.isFormValid}
                        >register</button>
                    </div>
                </>
            )
        }
    }
    onRegister() {
        debugger;
    }


    render() {
        return (
            <>
                <div className="row">
                    <div className="col-md-4 offset-md-4">
                        {
                            this.state.registerStep === REGISTER_STEP.submit_mobile
                            && this.submit_mobile_render()
                        }
                        {
                            this.state.registerStep === REGISTER_STEP.validate_mobile
                            && this.validate_mobile_render()
                        }
                        {
                            this.state.registerStep === REGISTER_STEP.register
                            && this.register_render()
                        }

                        <br /><br />
                        <small className="text-info cursor-pointer" onClick={() => this.gotoLogin()}>login</small>
                    </div>
                </div>
            </>
        )
    }
}

export default Register;