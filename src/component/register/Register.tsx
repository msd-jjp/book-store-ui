import React from 'react';
import { Input } from '../form/input/Input';
import { RegisterService } from '../../service/service.register';
import { Setup, TInternationalization } from '../../config/setup';
import { BaseComponent } from '../_base/BaseComponent';
import { ToastContainer, toast } from 'react-toastify';
import { redux_state } from '../../redux/app_state';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { IUser } from '../../model/model.user';
import { action_user_logged_in } from '../../redux/action/user';
import { AppRegex } from '../../config/regex';
import { NavLink } from 'react-router-dom';
import { BtnLoader } from '../form/btn-loader/BtnLoader';
import { Localization } from '../../config/localization/localization';

import { History } from 'history';
import { FixNumber } from '../form/fix-number/FixNumber';

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
    btnLoader: boolean;
    sendAgain_counter: number;
    btnSendAgain_loader: boolean;
    sendAgain_interval: any;
}
type TInputType = 'username' | 'password' | 'name' | 'code' | 'mobile' | 'confirmPassword';
type TInputElType = 'inputElUsername' | 'inputElPassword' |
    'inputElName' | 'inputElCode' | 'inputElMobile' | 'inputElConfirmPassword';

interface IProps {
    onUserLoggedIn?: (user: IUser) => void;
    history: History;
    internationalization: TInternationalization;
}

class RegisterComponent extends BaseComponent<IProps, IState> {
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
        isFormValid: false,
        btnLoader: false,
        sendAgain_counter: 0,
        btnSendAgain_loader: false,
        sendAgain_interval: undefined
    };
    inputElUsername!: HTMLInputElement | HTMLTextAreaElement;
    inputElPassword!: HTMLInputElement | HTMLTextAreaElement;
    inputElName!: HTMLInputElement | HTMLTextAreaElement;
    inputElCode!: HTMLInputElement | HTMLTextAreaElement;
    inputElMobile!: HTMLInputElement | HTMLTextAreaElement;
    inputElConfirmPassword!: HTMLInputElement | HTMLTextAreaElement;
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
        // this[inputEl].focus();
    }

    submit_mobile_render() {
        if (this.state.registerStep === REGISTER_STEP.submit_mobile) {
            return (
                <>
                    <h3 className="desc mt-4">{Localization.register_your_mobile_number}</h3>
                    <div className="account-form">
                        <div className="input-wrapper__">
                            <FixNumber
                                defaultValue={this.state.mobile.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'mobile') }}
                                pattern={AppRegex.mobile}
                                patternError={Localization.validation.mobileFormat}
                                required
                                elRef={input => { this.inputElMobile = input; }}
                                placeholder={Localization.mobile}
                                onKeyUp={(e) => this.handle_keyUp_onSubmit_mobile(e)}
                            />
                        </div>
                        <div className="form-group">
                            <BtnLoader
                                btnClassName="btn btn-warning btn-block btn-account"
                                loading={this.state.btnLoader}
                                onClick={() => this.onSubmit_mobile()}
                                disabled={!this.state.isFormValid}
                            >
                                {Localization.submit}
                            </BtnLoader>
                        </div>
                    </div>
                </>
            )
        }
    }
    async onSubmit_mobile() {
        if (!this.state.isFormValid) { return; }
        this.setState({ ...this.state, btnLoader: true });
        let res = await this._registerService.sendCode({ cell_no: this.state.mobile.value! })
            .catch(error => {
                this.handleError({ error: error.response, toastOptions: { toastId: 'onSubmit_mobile_error' } });
            });

        if (!res) {
            this.setState({ ...this.state, btnLoader: false });
            return;
        }

        let time = res.data.time;

        this.setState(
            {
                ...this.state,
                btnLoader: false,
                registerStep: REGISTER_STEP.validate_mobile,
                isFormValid: false,
                sendAgain_counter: time
            },
            () => {
                this.focusOnInput('inputElCode');
                this.start_sendAgain_counter();
            }
        );
    }
    handle_keyUp_onSubmit_mobile(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            if (!this.state.isFormValid || this.state.btnLoader) return;
            this.onSubmit_mobile();
        }
    }
    async sendAgain() {
        this.setState({ ...this.state, btnSendAgain_loader: true });
        let res = await this._registerService.sendCode({ cell_no: this.state.mobile.value! })
            .catch(error => {
                this.handleError({ error: error.response, toastOptions: { toastId: 'sendAgain_error' } });
            });

        if (!res) {
            this.setState({ ...this.state, btnSendAgain_loader: false });
            return;
        }

        let time = res.data.time;

        this.setState(
            {
                ...this.state,
                btnSendAgain_loader: false,
                sendAgain_counter: time
            },
            () => {
                this.focusOnInput('inputElCode');
                this.start_sendAgain_counter();
            }
        );
    }

    start_sendAgain_counter() {
        this.state.sendAgain_interval = setInterval(() => {
            if (this.state.sendAgain_counter === 0) {
                clearInterval(this.state.sendAgain_interval);
                return;
            }
            this.setState({ ...this.state, sendAgain_counter: this.state.sendAgain_counter - 1 });
        }, 1000);
    }

    validate_mobile_render() {
        if (this.state.registerStep === REGISTER_STEP.validate_mobile) {
            return (
                <>
                    <div className="mt-4 mb-3 text-muted">
                        {Localization.mobile}: {this.state.mobile.value}
                        <small
                            className="text-info"
                            onClick={() => this.from_validate_mobile_to_Submit_mobile()}
                        >
                            <i className="fa fa-edit"></i>
                        </small>
                    </div>

                    <h3 className="desc mt-4__">{Localization.verification_code_sended_via_sms_submit_here}</h3>

                    <div className="account-form">
                        <div className="input-wrapper__">
                            <FixNumber
                                key={'register_code'}
                                defaultValue={this.state.code.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'code') }}
                                placeholder={Localization.verification_code}
                                pattern={AppRegex.smsCode}
                                patternError={Localization.validation.smsCodeFormat}
                                required
                                elRef={input => { this.inputElCode = input; }}
                                onKeyUp={(e) => this.handle_keyUp_onValidate_mobile(e)}
                            />
                        </div>
                        <div className="form-group">
                            <BtnLoader
                                btnClassName="btn btn-warning btn-block btn-account"
                                loading={this.state.btnLoader}
                                onClick={() => this.onValidate_mobile()}
                                disabled={!this.state.isFormValid}
                            >
                                {Localization.submit}
                            </BtnLoader>
                        </div>
                    </div>

                    <BtnLoader
                        btnClassName="btn btn-link btn-sm p-align-0"
                        loading={this.state.btnSendAgain_loader}
                        onClick={() => this.sendAgain()}
                        disabled={this.state.sendAgain_counter > 0}
                    >
                        {Localization.send_again_activationCode}
                    </BtnLoader>
                    {
                        this.state.sendAgain_counter > 0 &&
                        <small>
                            <span>{Localization.in}</span>&nbsp;
                            <span>{this.state.sendAgain_counter}</span>&nbsp;
                            <span>{Localization.second}</span>
                        </small>
                    }

                </>
            )
        }
    }
    async onValidate_mobile() {
        if (!this.state.isFormValid) { return; }
        this.setState({ ...this.state, btnLoader: true });
        let response = await this._registerService.activateAcount(
            { cell_no: this.state.mobile.value!, activation_code: this.state.code.value! }
        ).catch(error => {
            this.handleError({ error: error.response, toastOptions: { toastId: 'onValidate_mobile_error' } });
        });
        this.setState({ ...this.state, btnLoader: false });
        if (!response) return;

        this.signup_token = response.data.signup_token;
        this.setState({ ...this.state, registerStep: REGISTER_STEP.register, isFormValid: false });
    }
    handle_keyUp_onValidate_mobile(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            if (!this.state.isFormValid || this.state.btnLoader) return;
            this.onValidate_mobile();
        }
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
                    <h3 className="desc mt-4">{Localization.create_an_account}</h3>
                    <div className="account-form">
                        <div className="input-wrapper">
                            <Input
                                defaultValue={this.state.name.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'name') }}
                                placeholder={Localization.name}
                                required
                                elRef={input => { this.inputElName = input; }}
                                onKeyUp={(e) => this.handle_keyUp_onRegister(e)}
                            />
                            <div className="separator"></div>
                            <Input
                                defaultValue={this.state.username.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'username') }}
                                placeholder={Localization.username}
                                required
                                elRef={input => { this.inputElUsername = input; }}
                                onKeyUp={(e) => this.handle_keyUp_onRegister(e)}
                            />
                            <div className="separator"></div>
                            <Input
                                defaultValue={this.state.password.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                                placeholder={Localization.password}
                                required
                                elRef={input => { this.inputElPassword = input; }}
                                type="password"
                                onKeyUp={(e) => this.handle_keyUp_onRegister(e)}
                            />
                            <div className="separator"></div>
                            <Input
                                defaultValue={this.state.confirmPassword.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'confirmPassword') }}
                                placeholder={Localization.confirm_password}
                                required
                                elRef={input => { this.inputElConfirmPassword = input; }}
                                type="password"
                                validationFunc={(val) => this.confirmPassword_validation(val)}
                                patternError={Localization.validation.confirmPassword}
                                onKeyUp={(e) => this.handle_keyUp_onRegister(e)}
                            />
                        </div>

                        <div className="form-group">
                            <BtnLoader
                                btnClassName="btn btn-warning btn-block btn-account"
                                loading={this.state.btnLoader}
                                onClick={() => this.onRegister()}
                                disabled={!this.state.isFormValid}
                            >
                                {Localization.register}
                            </BtnLoader>
                        </div>
                    </div>
                </>
            )
        }
    }
    private _registered = false;
    async onRegister() {
        if (!this.state.isFormValid || this._registered) return;
        this.setState({ ...this.state, btnLoader: true });
        let res = await this._registerService.signUp({
            "password": this.state.password.value!,
            "username": this.state.username.value!,
            "name": this.state.name.value!,
            "cell_no": this.state.mobile.value!,
            "signup_token": this.signup_token,
        }).catch((error: any) => {
            this.handleError({ error: error.response, toastOptions: { toastId: 'onRegister_error' } });
        });
        this.setState({ ...this.state, btnLoader: false });

        if (!res) return;
        
        this._registered = true;
        this.signUpNotify();
    }
    handle_keyUp_onRegister(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            if (!this.state.isFormValid || this.state.btnLoader) return;
            this.onRegister();
        }
    }

    signUpNotify() {
        return toast.success(
            Localization.msg.ui.msg3,
            this.getNotifyConfig({
                autoClose: Setup.notify.timeout.success,
                onClose: this.onSignUpNotifyClosed.bind(this)
            })
        );
    }
    onSignUpNotifyClosed() {
        this.props.history.push('/login');
    }

    render() {
        return (
            <>
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

                <section>
                    <p>
                        {Localization.already_have_bookstore_account}&nbsp;
                        <NavLink to="/login">{Localization.sign_in}</NavLink>
                    </p>
                </section>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization
    }
}

const dispatch2props = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user))
    }
}

export const Register = connect(state2props, dispatch2props)(RegisterComponent);