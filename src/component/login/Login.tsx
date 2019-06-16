import React from 'react';
import loginService from '../../service/login-service';
import Input from '../form/input/Input';


type inputType = 'username' | 'password';
export interface loginState {
    username: string | undefined;
    password: string | undefined;
}

class Login extends React.Component {
    state: loginState = {
        username: undefined,
        password: undefined
    };
    private _loginService = new loginService();
    inputUsername!: HTMLInputElement;

    componentDidMount() {
    }

    onLogin() {
        if (!this.state.username || !this.state.password) { return; }
        this._loginService.login(this.state)
            .then(function (response) {
                debugger;
            })
            .catch(function (error) {
                debugger;
            });
    }
    handleInputChange(val: any, inputType: inputType) {
        debugger;
        this.setState({ ...this.state, [inputType]: val });
    }

    render() {
        return (
            <>
                <div className="row">
                    <div className="col-md-4 offset-md-4">
                        <Input
                            value={this.state.username}
                            onChange={val => { this.handleInputChange(val, 'username') }}
                            label="username"
                            pattern={/^.{6,}$/}
                            patternError={'min length 6 character.'}
                            // elRef={input => { this.inputUsername = input; }}
                        />
                        <Input
                            value={this.state.password}
                            onChange={val => { this.handleInputChange(val, 'password') }}
                            label="password"
                            required={true}
                        />

                        <div className="form-group">
                            <button className="btn btn-info" onClick={() => this.onLogin()}>login</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default Login;