import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../redux/app_state";
import { TInternationalization } from "../../config/setup";
import { BaseComponent } from "../_base/BaseComponent";
import { Localization } from "../../config/localization/localization";
import { NETWORK_STATUS } from "../../enum/NetworkStatus";
import { AccountService } from "../../service/service.account";
import { Modal } from "react-bootstrap";
import { BtnLoader } from "../form/btn-loader/BtnLoader";
import { Utility } from "../../asset/script/utility";
import { Input } from "../form/input/Input";
import { AppRegex } from "../../config/regex";
import { CmpUtility } from "../_base/CmpUtility";

interface IProps {
  internationalization: TInternationalization;
  network_status: NETWORK_STATUS;

  existing_credit: number;
  show: boolean;
  onHide: () => any;
  defaultValue?: number;
}

interface IState {
  payment_loader: boolean;
  payment: {
    value: string | undefined;
    isValid: boolean;
  };
}

class IncreaseCreditComponent extends BaseComponent<IProps, IState> {
  state = {
    payment_loader: false,
    payment: {
      // value: undefined,
      // isValid: false
      value: this.getPaymentDefault_value(this.props.defaultValue),
      isValid: this.getPaymentDefault_isValid(this.props.defaultValue)
    },
  };

  private _accountService = new AccountService();

  componentWillReceiveProps(nextProps: IProps) {
    // debugger;
    if (this.props.show) return;
    if (this.props.defaultValue !== nextProps.defaultValue) {
      // debugger;
      this.setState({
        ...this.state, payment: {
          value: this.getPaymentDefault_value(nextProps.defaultValue),
          isValid: this.getPaymentDefault_isValid(nextProps.defaultValue)
        }
      });
    }
  }

  private getPaymentDefault_value(value: number | undefined): string | undefined {
    if (!value && value !== 0) return;
    if (this.input_validation(value)) {
      return value.toString();
    } else {
      return '1000';
    }
  }
  private getPaymentDefault_isValid(value: number | undefined): boolean {
    return this.input_validation(this.getPaymentDefault_value(value));
    // if (!this.props.defaultValue && this.props.defaultValue !== 0) return false;
    // return this.input_validation(this.props.defaultValue);
  }

  async gotoBankPage(value: string) {
    // debugger;
    this.setState({ payment_loader: true });
    let res = await this._accountService.userPayment_send(parseFloat(value), window.location.href).catch(error => {
      this.handleError({ error: error.response, toastOptions: { toastId: 'gotoBankPage_error' } });
    });
    this.setState({ payment_loader: false });

    if (res) {
      // debugger;
      const divEl = document.createElement("div");
      divEl.innerHTML = res.data;
      const form = divEl.querySelector('form');
      const formId = form ? form.id : '';
      if (formId) {
        document.body.appendChild(divEl);
        document.forms[formId as any].submit();

      } else {
        console.error('***********************************************************************');
        console.error('no form with id found in response**************************************');
        console.error('***********************************************************************');
        this.handleError({ error: {}, toastOptions: { toastId: 'gotoBankPage_error' } });
      }


      /* var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(res.data, 'text/html');
      document.appendChild(htmlDoc); */

      /* const doc = document.createElement("div");
               (doc as any).innerHTML = res.data;
      document.body.appendChild(doc);//res.data.body.innerHTML */
      // document.body.appendChild((res.data as any).body.innerHTML);//
    }
  }

  handle_inputChange(value: any, isValid: boolean) {
    this.setState({ ...this.state, payment: { value, isValid } });
  }

  input_validation(val: any): boolean {
    if (!val || val < 1000) {
      return false;
    }
    return true;
  }

  async closeModal() {
    let keptVal = undefined;
    let keptValIsValid = false;
    this.props.onHide();
    // if (this.props.defaultValue || this.props.defaultValue === 0) return;
    if (this.props.defaultValue || this.props.defaultValue === 0) {
      // keptVal = this.props.defaultValue;
      keptVal = this.getPaymentDefault_value(this.props.defaultValue);
      keptValIsValid = this.getPaymentDefault_isValid(this.props.defaultValue);
    }
    await CmpUtility.waitOnMe(300);
    this.setState({ ...this.state, payment: { value: keptVal, isValid: keptValIsValid } });
    /* this.setState({ ...this.state, payment: { value: undefined, isValid: false } }, () => {
      this.props.onHide();
    }); */
  }

  modal_render() {
    return (
      <>
        <Modal show={this.props.show} onHide={() => this.closeModal()} centered backdrop='static' >
          <Modal.Header className="border-bottom-0 pb-0">
            <div className="modal-title h6 text-success"><i className="fa fa-plus mr-2"></i>{Localization.increase_credit}</div>
            <small>{Localization.existing_credit}: {Utility.prettifyNumber(this.props.existing_credit)}</small>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-12">
                <Input
                  defaultValue={this.state.payment.value}
                  onChange={(val, isValid) => { this.handle_inputChange(val, isValid) }}
                  required
                  patternError={Localization.formatString(Localization.min_increase_amount_rial_is, 1000) as string}
                  className="input-bordered-bottom input-border-success"
                  pattern={AppRegex.integer}
                  validationFunc={(val) => this.input_validation(val)}
                  placeholder={Localization.increase_amount_rial}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="pt-0 border-top-0 justify-content-between">
            <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal()}>
              {Localization.cancel}
            </button>

            <BtnLoader
              btnClassName="btn text-success btn-sm text-uppercase min-w-70px"
              loading={this.state.payment_loader}
              onClick={() => this.gotoBankPage(this.state.payment.value!)}
              disabled={
                this.props.network_status === NETWORK_STATUS.OFFLINE ||
                !this.state.payment.isValid
              }
            >
              {Localization.payment}
              {
                this.props.network_status === NETWORK_STATUS.OFFLINE
                  ? <i className="fa fa-wifi text-danger"></i> : ''
              }
            </BtnLoader>
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  render() {
    return (
      <>
        {this.modal_render()}
      </>
    );
  }
}

const dispatch2props: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) => {
  return {
  };
};

const state2props = (state: redux_state) => {
  return {
    internationalization: state.internationalization,
    network_status: state.network_status,
  };
};

export const IncreaseCredit = connect(state2props, dispatch2props)(IncreaseCreditComponent);
