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

type inputType = 'username' | 'password';
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
}
interface IProps {
    onUserLoggedIn?: (user: IUser) => void;
    history: any;
}

class LoginComponent extends React.Component<IProps, LoginState> {
    state = {
        username: { value: undefined, isValid: false },
        password: { value: undefined, isValid: false },
        isFormValid: false
    };
    private _loginService = new LoginService();
    inputUsername!: HTMLInputElement;
    // isFormValid: boolean = false;

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
            user = await this._loginService.profile(tokenObj.id/* , {
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
    /* handleFormValidate(): void {
        if (true) {
            this.isFormValid = true;
        }
    } */

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
                <div className="row">
                    <div className="col-md-4 offset-md-4">
                        <Input
                            defaultValue={this.state.username.value}
                            onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'username') }}
                            label="username"
                            // pattern={/^.{6,}$/}
                            required
                            patternError={'min length 6 character.'}
                            elRef={input => { this.inputUsername = input; }}
                        />
                        <Input
                            defaultValue={this.state.password.value}
                            onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'password') }}
                            label="password"
                            required
                            type="password"
                        />

                        <div className="form-group">
                            <button className="btn btn-info mr-3"
                                onClick={() => this.onLogin()}
                                disabled={!this.state.isFormValid}
                            >{Localization.login}</button>
                            <small className="text-info cursor-pointer" onClick={() => this.gotoRegister()}>{Localization.register}</small>
                        </div>
                    </div>
                </div>

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