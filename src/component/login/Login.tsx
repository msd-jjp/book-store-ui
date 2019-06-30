import React from 'react';
import { LoginService } from '../../service/service.login';
import { Input } from '../form/input/Input';
import { redux_state } from '../../redux/app_state';
import { Dispatch } from 'redux';
import { IUser } from '../../model/model.user';
import { action_user_logged_in } from '../../redux/action/user';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Localization } from '../../config/localization/localization';
import { NavLink } from 'react-router-dom';
import { BtnLoader } from '../form/btn-loader/BtnLoader';

type inputType = 'username' | 'password';

interface LoginState {
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
    onUserLoggedIn?: (user: IUser) => void;
    history: any;
}

class LoginComponent extends React.Component<IProps, LoginState> {
    state: LoginState = {
        username: { value: undefined, isValid: false },
        password: { value: undefined, isValid: false },
        isFormValid: false,
        inputPasswordType: "password",
        btnLoader: false
    };
    private _loginService = new LoginService();
    inputUsername!: HTMLInputElement;
    showPasswordCheckBoxId = 'input_' + Math.random();

    componentDidMount() {
        // this.inputUsername.focus();
    }

    async onLogin() {
        if (!this.state.isFormValid) { return; }
        this.setState({ ...this.state, btnLoader: true });

        let tokenObj/* : string | void */ = await this._loginService.login({
            username: this.state.username.value!,
            password: this.state.password.value!
        }).catch((error) => {
            debugger;
            this.errorNotify();
            this.setState({ ...this.state, btnLoader: false });
        });

        // let user: any; // IUser | void;
        let response: any;
        if (tokenObj) {
            response = await this._loginService.profile(tokenObj.data.id).catch((error) => {
                debugger;
                this.errorNotify();
                // this.setState({ ...this.state, btnLoader: false });
            });
        }
        this.setState({ ...this.state, btnLoader: false });

        if (response) {
            this.props.onUserLoggedIn && this.props.onUserLoggedIn(response.data);
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
        return toast.error(Localization.msg.ui.msg2, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }

    render() {
        // const handleInputChange = this.handleInputChange.bind(this);
        /* let aaa: any = Localization.formatString(Localization.validation.minLength, {
            value: '6'
        }) */
        return (
            <>
                <h2 className="title mt-4 mb-3">{Localization.sign_in}</h2>
                <h3 className="desc">{Localization.sign_in_bookstore_account}</h3>
                <div className="forgot-password text-right mb-3">
                    <NavLink activeClassName="active__" to="/login">
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
                        />
                        <div className="separator"></div>
                        <Input
                            defaultValue={this.state.password.value}
                            onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                            required
                            type={this.state.inputPasswordType}
                            placeholder={Localization.password}
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
                            btnClassName="btn btn-warning btn-block"
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