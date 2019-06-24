import React from 'react';
import { Input } from '../form/input/Input';
import { RegisterService } from '../../service/service.register';
import { Setup } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { ToastContainer, toast } from 'react-toastify';
import { redux_state } from '../../redux/app_state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IUser } from '../../model/model.user';
import { action_user_logged_in } from '../../redux/action/user';
import { AppRegex } from '../../config/regex';
// import LaddaButton, { XL, SLIDE_UP } from 'react-ladda';

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

interface IProps {
    onUserLoggedIn?: (user: IUser) => void;
    history: any;
}

class RegisterComponent extends BaseComponent<IProps, IState>/* React.Component<any, IState> */ {
    // props: IProps;
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
    // inputElConfirmPassword_wrapper!: Input | null;
    private _registerService = new RegisterService();
    signup_token!: string;

    componentDidMount() {
        document.title = 'register';
        this.focusOnInput('inputElMobile');
    }

    componentWillUnmount() {
        document.title = Setup.documentTitle;
    }

    gotoLogin() {
        this.props.history.push('/login');
    }
    handleInputChange(val: any, isValid: boolean, inputType: TInputType) {
        const isFormValid = this.validateForm(val, isValid, inputType);
        this.setState({ ...this.state, [inputType]: { value: val, isValid }, isFormValid });

        /* if (inputType === "password") {
            debugger;
            // this.inputElConfirmPassword.value = ''
            this.inputElConfirmPassword_wrapper && 
            this.inputElConfirmPassword_wrapper.setValidate(this.state.confirmPassword.value);
            this.inputElConfirmPassword_wrapper &&
            this.inputElConfirmPassword_wrapper.props.onChange(
                this.state.confirmPassword.value,
                this.inputElConfirmPassword_wrapper.handleValidate(this.state.confirmPassword.value)
            );
        } */
    }
    validateForm(val: any, currentInput_isValid: boolean, inputType: TInputType): boolean {
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
            });

            if (inputType === 'password') {
                regFormValidate = (this.state.confirmPassword.value === val) && regFormValidate;
            } else if (inputType === 'confirmPassword') {
                regFormValidate = (this.state.password.value === val) && regFormValidate;
            }
            // regFormValidate = (this.state.confirmPassword.value === this.state.password.value) && regFormValidate;

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
                        // pattern={/^.{6,}$/}
                        pattern={AppRegex.mobile}
                        patternError={'mobile format is not valid.'}
                        required
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
        let res = await this._registerService.sendCode({ cell_no: this.state.mobile.value! })
            .catch(e => {
                debugger;
                this.errorNotify();
            });

        // res = { data: { message: 5599 } }; // todo: delete me
        if (!res) return;

        let smsCode = res.data.message;
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
        // check if counter is 0; 60 --> 0
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
                        key={'register_code'}
                        defaultValue={this.state.code.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'code') }}
                        label="code"
                        // pattern={/^.{4,4}$/}
                        // pattern={/^.{4,4}\d+$/}
                        pattern={AppRegex.smsCode}
                        patternError={'code is not valid.'}
                        required
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
        ).catch(e => {
            debugger;
            this.errorNotify();
        });
        debugger;
        // response = { data: { signup_token: 'qqqqqqqqqq' } };
        if (!response) return;

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

    confirmPassword_validation(val: any): boolean {
        if (val === this.state.password.value) {
            return true
        }
        return false;
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
                        type="password"
                    />
                    <Input
                        defaultValue={this.state.confirmPassword.value}
                        onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'confirmPassword') }}
                        label="confirm password"
                        required
                        elRef={input => { this.inputElConfirmPassword = input; }}
                        type="password"
                        validationFunc={(val) => this.confirmPassword_validation(val)}
                        patternError="confirm not match password"
                    // ref={rrr => { this.inputElConfirmPassword_wrapper = rrr }}
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
    async onRegister() {
        debugger;
        let res = await this._registerService.signUp({
            // "user": {
            "password": this.state.password.value!,
            "username": this.state.username.value!,
            // },
            // "persone": {
            "address": '',
            "email": '',
            "last_name": '',
            "name": this.state.name.value!,
            "phone": '',
            // },
            "cell_no": this.state.mobile.value!,
            "signup_token": this.signup_token,
        }).catch((e: any) => {
            debugger;
            this.errorNotify();
        });

        /* res = {
            user: {
                name: this.state.name.value,
                username: this.state.username.value,
                password: this.state.password.value
            }
        } */
        // todo: delete me

        if (!res) return;
        debugger;

        //todo: 
        // if extra apiCall need: do it (propbably signUp return token --> save it and get user(profile) & then continue..)
        // set user in redux state
        // navigate to main
        let user = res.user;
        if (user) {
            this.props.onUserLoggedIn && this.props.onUserLoggedIn(user);
            this.props.history.push('/dashboard');
        }
    }

    // notify = () => toast("Wow so easy !");
    errorNotify() {
        // return toast("Wow so easy !");
        return toast.error('error occurred!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-md-4 offset-md-4">

                        {(() => {
                            switch (this.state.registerStep) {
                                case REGISTER_STEP.submit_mobile:
                                    return this.submit_mobile_render();
                                case REGISTER_STEP.validate_mobile:
                                    return this.validate_mobile_render();
                                case REGISTER_STEP.register:
                                    return this.register_render();
                                default:
                                    return undefined;
                            }
                        })()}

                        <small className="text-info cursor-pointer" onClick={() => this.gotoLogin()}>login</small>



                        {/* <button onClick={this.notify}>Notify !</button> */}
                        <ToastContainer />

                        {/* <LaddaButton
                            loading={true}
                            onClick={this}
                            data-color="#eee"
                            data-size={XL}
                            data-style={SLIDE_UP}
                            data-spinner-size={30}
                            data-spinner-color="#ddd"
                            data-spinner-lines={12}
                        >
                            Click Here!
                        </LaddaButton> */}

                        {/* <div className="btn btn-info">
                            <i className="fa fa-spinner fa-spin"></i>
                            <span>clock to loaf d</span>
                        </div> */}
                    </div>
                </div>
            </>
        )
    }
}

const state2props = (state: redux_state) => {
    return {}
}

const dispatch2props = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user))
    }
}

export const Register = connect(state2props, dispatch2props)(RegisterComponent);