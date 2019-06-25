import React from 'react';
import { LoginService } from '../../service/service.login';
import { Input } from '../form/input/Input';
import { redux_state } from '../../redux/app_state';
import { Dispatch } from 'redux';
import { IUser } from '../../model/model.user';
import { action_user_logged_in } from '../../redux/action/user';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Localization } from '../../config/localization';
import { NavLink } from 'react-router-dom';

type inputType = 'username' | 'password';
// type TInputPasswordType = 'text' | 'password';
interface LoginState { // todo remove user pass from state  ? set state rebuild dom
    username: {
        value: string | undefined;
        isValid: boolean;
    };
    password: {
        value: string | undefined;
        isValid: boolean;
    };
    isFormValid: boolean;
    inputPasswordType: 'text' | 'password'; // string;//TInputPasswordType;
}
interface IProps {
    onUserLoggedIn?: (user: IUser) => void;
    history: any;
}

class LoginComponent extends React.Component<IProps, LoginState> {
    state: LoginState = {
        username: { value: undefined, isValid: false },
        password: { value: undefined, isValid: false },
        isFormValid: false,
        inputPasswordType: "password"
    };
    private _loginService = new LoginService();
    inputUsername!: HTMLInputElement;
    // isFormValid: boolean = false;
    showPasswordCheckBoxId = 'input_' + Math.random();
    // inputPasswordType: 'text' | 'password' = 'password';

    componentDidMount() {
        this.inputUsername.focus();
    }

    async onLogin() {
        // if (!this.state.username || !this.state.password) { return; }
        if (!this.state.isFormValid) { return; }
        let tokenObj/* : string | void */ = await this._loginService.login({
            username: this.state.username.value!,
            password: this.state.password.value!
        }).catch((error) => {
            debugger;
            // todo: notify here
            this.errorNotify();
        });
        // debugger;
        // token = '1111';

        let user: any; // IUser | void;
        if (tokenObj) {
            user = await this._loginService.profile(tokenObj.data.id/* , {
                username: this.state.username.value!,
                password: this.state.password.value!
            } */).catch((error) => {
                debugger;
                //notifu
                this.errorNotify();
            });
        }

        /* user = {
            name: 'hamid',
            username: 'hamid',
            password: '123456',
            id: '1'
        }; */

        if (user) {
            this.props.onUserLoggedIn && this.props.onUserLoggedIn(user);
            this.props.history.push('/dashboard');
        }
    }
    handleInputChange(val: any, isValid: boolean, inputType: inputType) {
        let otherInputType: inputType = 'username';
        if (inputType === 'username') {
            otherInputType = 'password';
        }
        const isFormValid = this.state[otherInputType].isValid && isValid;
        this.setState({ ...this.state, [inputType]: { value: val, isValid }, isFormValid });
    }
    gotoRegister() {
        this.props.history.push('/register');
    }
    
    toggleShowPassword() {
        if (this.state.inputPasswordType === 'text') {
            this.setState({ ...this.state, inputPasswordType: 'password' });
        } else {
            this.setState({ ...this.state, inputPasswordType: 'text' });
        }
    }

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
        // const handleInputChange = this.handleInputChange.bind(this);
        return (
            <>
                <main className="main mx-3">
                    <h2 className="title mt-4 mb-3">
                        Sign in
                        </h2>
                    <h3 className="desc">
                        Sign in with your bookstore account
                        </h3>
                    <div className="forgot-password text-right mb-3">
                        {/* <a href="javascript:;">
                                Forgot password?
                            </a> */}
                        <NavLink activeClassName="active__" to="/login">
                            Forgot password?
                            </NavLink>
                    </div>
                    <div className="login-form">
                        <div className="input-wrapper">
                            <Input
                                defaultValue={this.state.username.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'username') }}
                                // label="username"
                                // pattern={/^.{6,}$/}
                                required
                                patternError={'min length 6 character.'}
                                elRef={input => { this.inputUsername = input; }}
                                placeholder="username"
                            />
                            <div className="separator"></div>
                            <Input
                                defaultValue={this.state.password.value}
                                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                                // label="password"
                                required
                                type={this.state.inputPasswordType}
                                placeholder="password"
                            />
                        </div>

                        <div className="form-group">
                            <input type="checkbox" className="app-checkbox"
                                id={this.showPasswordCheckBoxId}
                                onChange={() => this.toggleShowPassword()}
                            />
                            <label htmlFor={this.showPasswordCheckBoxId}></label>
                            <label htmlFor={this.showPasswordCheckBoxId}>
                                <h6 className="pt-1__ ml-2">Show password</h6>
                            </label>
                        </div>

                        <div className="form-group">
                            <button className="btn btn-info__ btn-warning btn-block mr-3___"
                                onClick={() => this.onLogin()}
                                disabled={!this.state.isFormValid}
                            >{Localization.sign_in}</button>

                            {/* <small className="text-info cursor-pointer"
                                    onClick={() => this.gotoRegister()}>{Localization.register}</small> */}
                        </div>
                    </div>
                    <section>
                        <p>
                            By tapping "Sign in" you agree to the
                                <span>Bookstore Content</span> <span>and Software Terms of Use</span>
                        </p>
                        <p>
                            New to Bookstore? Bookstore is a Jame-jam product.&nbsp;
                                <NavLink to="/register">
                                You'll need a free Jame-jam account to sign in.
                                </NavLink>

                        </p>
                    </section>
                </main>

                <ToastContainer />
            </>
        )
    }
}

//#region redux
const state2props = (state: redux_state) => {
    return {}
}

const dispatch2props = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user))
    }
}

export const Login = connect(state2props, dispatch2props)(LoginComponent);
//#endregion