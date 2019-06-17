import React from 'react';
import loginService from '../../service/login-service';
import Input from '../form/input/Input';
import { AppState } from '../../service/app-state';

type inputType = 'username' | 'password';
export interface LoginState { // todo remove user pass from state  ? set state rebuild dom
    username: string | undefined;
    password: string | undefined;
}

class Login extends React.Component<any, LoginState> {
    state = {
        username: undefined,
        password: undefined,
    };
    private _loginService = new loginService();
    inputUsername!: HTMLInputElement;
    isFormValid: boolean = false;

    componentDidMount() {
        this.inputUsername.focus();
    }

    async onLogin() {
        if (!this.state.username || !this.state.password) { return; }
        let response = await this._loginService.login({
            username: this.state.username!,
            password: this.state.password!
        }).catch((error) => {
            debugger;
        });
        debugger;
        AppState.isLogedIn = true;
    }
    handleInputChange(val: any, inputType: inputType) {
        this.setState({ ...this.state, [inputType]: val });
    }
    gotoRegister() {
        this.props.history.push('/register');
    }
    handleFormValidate(): void {
        if (true) {
            this.isFormValid = true;
        }
    }

    render() {
        const handleInputChange = this.handleInputChange.bind(this);
        return (
            <>
                <div className="row">
                    <div className="col-md-4 offset-md-4">
                        <Input
                            defaultValue={this.state.username}
                            onChange={val => { handleInputChange(val, 'username') }}
                            label="username"
                            pattern={/^.{6,}$/}
                            patternError={'min length 6 character.'}
                            elRef={input => { this.inputUsername = input; }}
                        />
                        <Input
                            defaultValue={this.state.password}
                            onChange={val => { handleInputChange(val, 'password') }}
                            label="password"
                            required={true}
                        />

                        <div className="form-group">
                            <button className="btn btn-info mr-3" onClick={() => this.onLogin()}>login</button>
                            <a className="text-info cursor-pointer" onClick={() => this.gotoRegister()}>register</a>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default Login;