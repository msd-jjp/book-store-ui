import React from "react";
import { LoginService } from "../../service/service.login";
import { Input } from "../form/input/Input";
import { redux_state } from "../../redux/app_state";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Localization } from "../../config/localization/localization";
import { NavLink } from "react-router-dom";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { BaseComponent } from "../_base/BaseComponent";
import { TInternationalization, Setup } from "../../config/setup";

import { History } from "history";
import { AppRegex } from "../../config/regex";
import { FixNumber } from "../form/fix-number/FixNumber";

type TInputType = 'password' | 'code' | 'mobile' | 'confirmPassword';
enum FORGOT_PASSWORD_STEP {
  submit_mobile = "submit_mobile",
  submit_newPassword = "new_password",
}

interface IState {
  forgotPasswordStep: FORGOT_PASSWORD_STEP;
  code: {
    value: string | undefined;
    isValid: boolean;
  };
  mobile: {
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
}
interface IProps {
  history: History;
  internationalization: TInternationalization;
}

class ForgotPasswordComponent extends BaseComponent<IProps, IState> {
  state: IState = {
    forgotPasswordStep: FORGOT_PASSWORD_STEP.submit_mobile,
    code: { value: undefined, isValid: false },
    mobile: { value: undefined, isValid: false },
    password: { value: undefined, isValid: false },
    confirmPassword: { value: undefined, isValid: false },
    isFormValid: false,
    btnLoader: false
  };
  private _loginService = new LoginService();

  componentDidMount() {
    // this.inputUsername.focus();
  }

  async onSubmitMobile() {
    if (!this.state.isFormValid) {
      return;
    }
    this.setState({ ...this.state, btnLoader: true });

    let res = await this._loginService.forgotPassword({ cell_no: this.state.mobile.value! }).catch(error => {
      // debugger;
      this.handleError({ error: error.response, toastOptions: { toastId: 'onSubmitMobile_error' } });
      this.setState({ ...this.state, btnLoader: false });
    });

    if (res) {
      this.setState({
        ...this.state, btnLoader: false,
        forgotPasswordStep: FORGOT_PASSWORD_STEP.submit_newPassword, isFormValid: false,
      });
    }
  }
  handle_keyUp_onSubmitMobile(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      if (!this.state.isFormValid || this.state.btnLoader) return;
      this.onSubmitMobile();
    }
  }

  async onSubmitNewPassword() {
    if (!this.state.isFormValid) {
      return;
    }
    this.setState({ ...this.state, btnLoader: true });

    let resetPasswordData = {
      cell_no: this.state.mobile.value!,
      password: this.state.password.value!,
      code: this.state.code.value!,
    };

    let res = await this._loginService.resetPassword(resetPasswordData).catch(error => {
      // debugger;
      this.handleError({ error: error.response, toastOptions: { toastId: 'onSubmitNewPassword_error' } });
      this.setState({ ...this.state, btnLoader: false });
    });

    this.setState({ ...this.state, btnLoader: false });

    if (!res) return;
    this.signUpNotify();

    /* if (res) {
      this.setState({
        ...this.state, btnLoader: false,
        forgotPasswordStep: FORGOT_PASSWORD_STEP.submit_newPassword, isFormValid: false,
      });
    } */
  }
  handle_keyUp_onSubmitNewPassword(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      if (!this.state.isFormValid || this.state.btnLoader) return;
      this.onSubmitNewPassword();
    }
  }
  signUpNotify() {
    return toast.success(
      Localization.msg.ui.msg4,
      this.getNotifyConfig({
        autoClose: Setup.notify.timeout.success,
        onClose: this.onSignUpNotifyClosed.bind(this)
      })
    );
  }
  onSignUpNotifyClosed() {
    this.props.history.push('/login');
  }
  handleInputChange(val: any, isValid: boolean, inputType: TInputType) {
    const isFormValid = this.validateForm(val, isValid, inputType);
    this.setState({ ...this.state, [inputType]: { value: val, isValid }, isFormValid });
  }
  validateForm(val: any, currentInput_isValid: boolean, inputType: TInputType): boolean {
    if (this.state.forgotPasswordStep === FORGOT_PASSWORD_STEP.submit_mobile) {
      if (inputType !== 'mobile') {
        // check env.dev
        throw new Error('should not happen !!!');
      }
      return currentInput_isValid;

    } else if (this.state.forgotPasswordStep === FORGOT_PASSWORD_STEP.submit_newPassword) {
      const step_inputList: TInputType[] = ['confirmPassword', 'code', 'password'];
      const step_inputList_exceptThisInput = step_inputList.filter(inp => inp !== inputType);

      let FP_FormValidate = currentInput_isValid;
      step_inputList_exceptThisInput.forEach(inp => {
        let inpObj: /* { value: string | undefined, isValid: boolean } */any = this.state[inp];
        FP_FormValidate = inpObj.isValid && FP_FormValidate;
      });

      if (inputType === 'password') {
        FP_FormValidate = (this.state.confirmPassword.value === val) && FP_FormValidate;
      } else if (inputType === 'confirmPassword') {
        FP_FormValidate = (this.state.password.value === val) && FP_FormValidate;
      }

      return FP_FormValidate;
    } else {
      // todo check env.dev
      throw new Error('should not happen !!!');
    }
  }
  gotoLogin() {
    this.props.history.push("/login");
  }

  confirmPassword_validation(val: any): boolean {
    if (val === this.state.password.value) {
      return true
    }
    return false;
  }

  submit_mobile_render() {
    if (this.state.forgotPasswordStep === FORGOT_PASSWORD_STEP.submit_mobile) {
      return (
        <>
          <h3 className="desc mt-4 mb-3">
            {Localization.register_your_mobile_number}
          </h3>
          <div className="account-form">
            <div className="input-wrapper__">
              <FixNumber
                defaultValue={this.state.mobile.value}
                onChange={(val, isValid) => {
                  this.handleInputChange(val, isValid, "mobile");
                }}
                pattern={AppRegex.mobile}
                patternError={Localization.validation.mobileFormat}
                required
                placeholder={Localization.mobile}
                onKeyUp={(e) => this.handle_keyUp_onSubmitMobile(e)}
              />
            </div>

            <div className="form-group">
              <BtnLoader
                btnClassName="btn btn-warning btn-block btn-account"
                loading={this.state.btnLoader}
                onClick={() => this.onSubmitMobile()}
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

  submit_newPassword_render() {
    if (this.state.forgotPasswordStep === FORGOT_PASSWORD_STEP.submit_newPassword) {
      return (
        <>
          <div className="mt-4 mb-3 text-muted">
            {Localization.mobile}: {this.state.mobile.value}
            <small
              className="text-info"
              onClick={() => this.from_new_password_to_Submit_mobile()}
            >
              <i className="fa fa-edit"></i>
            </small>
          </div>
          <h3 className="desc mt-4__ mb-3">
            {Localization.reset_password}
          </h3>
          <div className="account-form">
            <div className="input-wrapper">
              <FixNumber
                key={'forgot-password_code'}
                defaultValue={this.state.code.value}
                onChange={(val, isValid) => {
                  this.handleInputChange(val, isValid, "code");
                }}
                required
                placeholder={Localization.verification_code}
                onKeyUp={(e) => this.handle_keyUp_onSubmitNewPassword(e)}
              />
              <div className="separator" />
              <Input
                defaultValue={this.state.password.value}
                onChange={(val, isValid) => {
                  this.handleInputChange(val, isValid, "password");
                }}
                required
                type="password"
                placeholder={Localization.password}
                onKeyUp={(e) => this.handle_keyUp_onSubmitNewPassword(e)}
              />
              <div className="separator" />
              <Input
                defaultValue={this.state.confirmPassword.value}
                onChange={(val, isValid) => { this.handleInputChange(val, isValid, 'confirmPassword') }}
                placeholder={Localization.confirm_password}
                required
                type="password"
                validationFunc={(val) => this.confirmPassword_validation(val)}
                patternError={Localization.validation.confirmPassword}
                onKeyUp={(e) => this.handle_keyUp_onSubmitNewPassword(e)}
              />
            </div>

            <div className="form-group">
              <BtnLoader
                btnClassName="btn btn-warning btn-block btn-account"
                loading={this.state.btnLoader}
                onClick={() => this.onSubmitNewPassword()}
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
  from_new_password_to_Submit_mobile() {
    this.setState(
      {
        ...this.state,
        forgotPasswordStep: FORGOT_PASSWORD_STEP.submit_mobile,
        isFormValid: true, // note: we go back to last step and isFormValid is true there.
        code: { value: undefined, isValid: false },
        password: { value: undefined, isValid: false },
        confirmPassword: { value: undefined, isValid: false }
      }
    );
  }
  render() {
    return (
      <>
        {(() => {
          switch (this.state.forgotPasswordStep) {
            case FORGOT_PASSWORD_STEP.submit_mobile:
              return this.submit_mobile_render();
            case FORGOT_PASSWORD_STEP.submit_newPassword:
              return this.submit_newPassword_render();
            default:
              return undefined;
          }
        })()}

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
