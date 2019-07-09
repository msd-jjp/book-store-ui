import React from "react";
import { LoginService } from "../../service/service.login";
import { Input } from "../form/input/Input";
import { redux_state } from "../../redux/app_state";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Localization } from "../../config/localization/localization";
import { NavLink } from "react-router-dom";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization } from "../../config/setup";

import { History } from "history";
import { AppRegex } from "../../config/regex";

type inputType = "username" | "mobile";
enum FORGOT_PASSWORD_STEP {
  submit_usernameOrmobile = "submit_usernameOrmobile",
  validate_mobile = "validate_mobile",
  register = "register"
}

interface IState {
  //   forgotPasswordStep: FORGOT_PASSWORD_STEP;
  username: {
    value: string | undefined;
    isValid: boolean;
  };
  mobile: {
    value: string | undefined;
    isValid: boolean;
  };
  isFormValid: boolean;
  btnLoader: boolean;
}
interface IProps {
  history: History;
  internationalization: TInternationalization;
}

class ForgotPasswordComponent extends BaseComponent<IProps, IState> {
  state: IState = {
    username: { value: undefined, isValid: false },
    mobile: { value: undefined, isValid: false },
    isFormValid: false,
    btnLoader: false
  };
  private _loginService = new LoginService();
  inputUsername!: HTMLInputElement;

  componentDidMount() {
    // this.inputUsername.focus();
  }

  async onSubmitUsernameOrMobile() {
    if (!this.state.isFormValid) {
      return;
    }
    if (!this.state.username.value && !this.state.mobile.value) {
      this.handleError({
        error: { data: { msg: "username_cellno_required" } }
      });
      return;
    }
    this.setState({ ...this.state, btnLoader: true });

    let forgotPassword_data;
    if (this.state.username.value) {
      forgotPassword_data = {
        username: this.state.username.value!
      };
    } else {
      forgotPassword_data = {
        cell_no: this.state.mobile.value!
      };
    }
    let res = await this._loginService
      .forgotPassword(forgotPassword_data)
      .catch(error => {
        debugger;
        this.handleError({ error: error.response });
        this.setState({ ...this.state, btnLoader: false });
      });

    this.setState({ ...this.state, btnLoader: false });
  }
  handleInputChange(val: any, isValid: boolean, inputType: inputType) {
    let otherInputType: inputType = "username";
    if (inputType === "username") {
      otherInputType = "mobile";
    }
    const isFormValid = this.state[otherInputType].isValid && isValid;
    this.setState({
      ...this.state,
      [inputType]: { value: val, isValid },
      isFormValid
    });
  }
  gotoLogin() {
    this.props.history.push("/login");
  }

  render() {
    return (
      <>
        <h3 className="desc mt-4 mb-3">
          {Localization.insert_username_or_mobile}
        </h3>
        <div className="account-form">
          <div className="input-wrapper">
            <Input
              defaultValue={this.state.username.value}
              onChange={(val, isValid) => {
                this.handleInputChange(val, isValid, "username");
              }}
              elRef={input => {
                this.inputUsername = input;
              }}
              placeholder={Localization.username}
            />
            <div className="separator" />
            <Input
              defaultValue={this.state.mobile.value}
              onChange={(val, isValid) => {
                this.handleInputChange(val, isValid, "mobile");
              }}
              pattern={AppRegex.mobile}
              patternError={Localization.validation.mobileFormat}
              placeholder={Localization.mobile}
            />
          </div>

          <div className="form-group">
            <BtnLoader
              btnClassName="btn btn-warning btn-block btn-account"
              loading={this.state.btnLoader}
              onClick={() => this.onSubmitUsernameOrMobile()}
              disabled={!this.state.isFormValid}
            >
              {Localization.submit}
            </BtnLoader>
          </div>
        </div>
        <section>
          <p>
            <NavLink to="/login">{Localization.return}</NavLink>
          </p>
        </section>

        <ToastContainer {...this.getNotifyContainerConfig()} />
      </>
    );
  }
}

//#region redux
const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization
  };
};

const dispatch2props = (dispatch: Dispatch) => {
  return {};
};

export const ForgotPassword = connect(
  state2props,
  dispatch2props
)(ForgotPasswordComponent);
//#endregion
