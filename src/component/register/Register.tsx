import React from 'react';
import Input from '../form/input/Input';

enum REGISTER_STEP {
    submit_mobile = 'submit_mobile',
    validate_mobile = 'validate_mobile',
    register = 'register'
}
interface IState {
    registerStep: REGISTER_STEP; //'submit_mobile' | 'validate_mobile' | 'register';
    mobile: {
        value: string | undefined;
        isValid: boolean;
    };
    code: number | undefined;

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

class Register extends React.Component<any, IState> {
    props: any;
    state: IState = {
        registerStep: REGISTER_STEP.submit_mobile,
        mobile: {
            value: undefined,
            isValid: false,
        },
        code: undefined,
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
    inputMobile!: HTMLInputElement;

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
    submit_mobile_render() {
        if (this.state.registerStep === REGISTER_STEP.submit_mobile) {
            return (
                <>
                    <Input
                        defaultValue={this.state.username.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'mobile') }}
                        label="mobile"
                        pattern={/^.{6,}$/}
                        patternError={'mobile format is not valid.'}
                        elRef={input => { this.inputMobile = input; }}
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
    onSubmit_mobile() {
        this.setState({ ...this.state, registerStep: REGISTER_STEP.validate_mobile });
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
                            && <div>validate mobile</div>
                        }


                        <div>mobile --> submit</div>
                        <div>code --> submit</div>
                        <div>register -_> submit</div>
                        <small className="text-info cursor-pointer" onClick={() => this.gotoLogin()}>login</small>
                    </div>
                </div>
            </>
        )
    }
}

export default Register;