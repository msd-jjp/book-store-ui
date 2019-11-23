import React from 'react';
import { LoginService } from '../../service/service.login';
import { Input } from '../form/input/Input';
import { redux_state } from '../../redux/app_state';
import { Dispatch } from 'redux';
import { IUser } from '../../model/model.user';
import { action_user_logged_in } from '../../redux/action/user';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Localization } from '../../config/localization/localization';
import { NavLink } from 'react-router-dom';
import { BtnLoader } from '../form/btn-loader/BtnLoader';
import { BaseComponent } from '../_base/BaseComponent';
import { TInternationalization } from '../../config/setup';
import { IToken } from '../../model/model.token';
import { action_set_token } from '../../redux/action/token';
import { History } from 'history';
import { action_set_authentication } from '../../redux/action/authentication';
import { Utility } from '../../asset/script/utility';

type inputType = 'username' | 'password';

interface IState {
    username: {
        value: string | undefined;
        isValid: boolean;
    };
    password: {
        value: string | undefined;
        isValid: boolean;
    };
    isFormValid: boolean;
    inputPasswordType: 'text' | 'password';
    btnLoader: boolean;
}
interface IProps {
    onUserLoggedIn: (user: IUser) => void;
    history: History;
    internationalization: TInternationalization;
    onSetToken: (token: IToken) => void;
    // token: IToken;
    onSetAuthentication: (auth: string) => void;
}

class LoginComponent extends BaseComponent<IProps, IState> {
    state: IState = {
        username: { value: undefined, isValid: false },
        password: { value: undefined, isValid: false },
        isFormValid: false,
        inputPasswordType: "password",
        btnLoader: false
    };
    private _loginService = new LoginService();
    inputUsername!: HTMLInputElement | HTMLTextAreaElement;
    showPasswordCheckBoxId = 'input_' + Math.random();

    componentDidMount() {
        // this.inputUsername.focus();
    }

    async onLogin() {
        if (!this.state.isFormValid) { return; }
        this.setState({ ...this.state, btnLoader: true });

        let authObj = {
            username: this.state.username.value!,
            password: this.state.password.value!
        }
        let res_token = await this._loginService.login(authObj).catch((error) => {
            this.handleError({ error: error.response, toastOptions: { toastId: 'login_error' } });
            this.setState({ ...this.state, btnLoader: false });
        });

        let res_user;

        if (res_token) {
            this.props.onSetAuthentication(Utility.get_encode_auth(authObj));
            this.props.onSetToken(res_token.data);
            // this._loginService.setToken(res_token.data);

            res_user = await this._loginService.profile().catch((error) => {
                this.handleError({ error: error.response, toastOptions: { toastId: 'login_error' } });
            });
        }

        this.setState({ ...this.state, btnLoader: false });

        if (res_user) {
            this.props.onUserLoggedIn(res_user.data);
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
    handle_keyUp(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            if (!this.state.isFormValid || this.state.btnLoader) return;
            this.onLogin();
        }
    }

    render() {
        return (
            <>
                <h2 className="title mt-4 mb-3">{Localization.sign_in}</h2>
                <h3 className="desc">{Localization.sign_in_bookstore_account}</h3>
                <div className="forgot-password text-right mb-3">
                    <NavLink activeClassName="active__" to="/forgot-password">
                        {Localization.forgot_password}
                    </NavLink>
                </div>
                <div className="account-form">
                    <div className="input-wrapper">
                        <Input
                            defaultValue={this.state.username.value}
                            onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'username') }}
                            required
                            elRef={input => { this.inputUsername = input; }}
                            placeholder={Localization.username}
                            onKeyUp={(e) => this.handle_keyUp(e)}
                        />
                        <div className="separator"></div>
                        <Input
                            defaultValue={this.state.password.value}
                            onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                            required
                            type={this.state.inputPasswordType}
                            placeholder={Localization.password}
                            onKeyUp={(e) => this.handle_keyUp(e)}
                        />
                    </div>

                    <div className="form-group">
                        <input type="checkbox" className="app-checkbox"
                            id={this.showPasswordCheckBoxId}
                            onChange={() => this.toggleShowPassword()}
                        />
                        <label htmlFor={this.showPasswordCheckBoxId}></label>
                        <label htmlFor={this.showPasswordCheckBoxId}>
                            <h6 className="ml-2">{Localization.Show_password}</h6>
                        </label>
                    </div>

                    <div className="form-group">
                        <BtnLoader
                            btnClassName="btn btn-warning btn-block btn-account"
                            loading={this.state.btnLoader}
                            onClick={() => this.onLogin()}
                            disabled={!this.state.isFormValid}
                        >
                            {Localization.sign_in}
                        </BtnLoader>
                    </div>
                </div>
                <section>
                    <p>
                        {Localization.formatString(
                            Localization.login_agree_msg.a,
                            <span>{Localization.login_agree_msg.b}</span>,
                            <span>{Localization.login_agree_msg.c}</span>
                        )}
                    </p>
                    <p>
                        {Localization.new_to_Bookstore} &nbsp;
                        <NavLink to="/register">
                            {Localization.need_free_bookstore_account}
                        </NavLink>
                    </p>
                </section>

                <ToastContainer {...this.getNotifyContainerConfig()} />
            </>
        )
    }
}

//#region redux
const state2props = (state: redux_state) => {
    return {
        internationalization: state.internationalization,
        // token: state.token
    }
}

const dispatch2props = (dispatch: Dispatch) => {
    return {
        onUserLoggedIn: (user: IUser) => dispatch(action_user_logged_in(user)),
        onSetToken: (token: IToken) => dispatch(action_set_token(token)),
        onSetAuthentication: (auth: string) => dispatch(action_set_authentication(auth))
    }
}

export const Login = connect(state2props, dispatch2props)(LoginComponent);
//#endregion