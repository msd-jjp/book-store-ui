import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { Localization } from "../../../config/localization/localization";
import { Modal } from "react-bootstrap";
import { Utility } from "../../../asset/script/utility";

type TStatus_base = 'successful' | 'payment-canceled' | 'unknown' | 'payment-amount-invalid';
type TStatus = TStatus_base | string; // Localization.msg.back
interface IProps {
    internationalization: TInternationalization;
    show: boolean;
    onHide: () => any;
    status: TStatus | undefined;
    existing_credit: number;
}

interface IState {
}

class PaymentResultComponent extends BaseComponent<IProps, IState> {
    // state = {};
    private paymentStatus = this.props.status;

    // componentWillReceiveProps(nextProps: IProps) {
    //     // debugger;
    //     if (this.props.show) return;
    //     if (this.props.status !== nextProps.status) {
    //         debugger;
    //         // this.setState({
    //         //     ...this.state
    //         // });
    //     }
    // }

    async closeModal() {
        // let keptVal = undefined;
        // let keptValIsValid = false;
        this.props.onHide();
        // if (this.props.defaultValue || this.props.defaultValue === 0) return;
        // if (this.props.defaultValue || this.props.defaultValue === 0) {
        //     // keptVal = this.props.defaultValue;
        //     keptVal = this.getPaymentDefault_value(this.props.defaultValue);
        //     keptValIsValid = this.getPaymentDefault_isValid(this.props.defaultValue);
        // }
        // await CmpUtility.waitOnMe(300);
        // this.setState({ ...this.state, payment: { value: keptVal, isValid: keptValIsValid } });
        /* this.setState({ ...this.state, payment: { value: undefined, isValid: false } }, () => {
          this.props.onHide();
        }); */
    }

    getPaymentStatusRender() {
        const st = this.props.status;
        if (!st) return;
        const list = ['successful', 'payment-canceled', 'unknown', 'payment-amount-invalid'];
        if (list.includes(st)) {
            return Localization.payment_status_obj[st as TStatus_base];
        } else {
            const msg = Localization.msg.back[st];
            if (msg) {
                return msg;
            } else {
                console.error('paymentStatus NOT in list or msg.back: ', st);
                return Localization.payment_status_obj.unknown;
            }
        }
    }

    getPaymentStatusClassName(): string {
        const st = this.props.status;
        if (!st) return '';
        if (st === 'successful') return 'text-success';
        if (st === 'payment-canceled') return 'text-warning';
        return 'text-danger';
    }

    modal_render() {
        return (
            <>
                <Modal show={this.props.show} onHide={() => this.closeModal()} centered backdrop='static' >
                    <Modal.Header className="border-bottom-0 pb-0-- justify-content-around">
                        <div className="modal-title h6 text-success-- text-center">
                            {/* <i className="fa fa-plus mr-2"></i> */}
                            {Localization.payment_result}
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row text-center">
                            <div className="col-12">
                                <div className={'h5 ' + this.getPaymentStatusClassName()}>
                                    {this.getPaymentStatusRender()}
                                </div>
                                <div className="mt-3">
                                    <span className="text-muted">{Localization.existing_credit}:</span>&nbsp;
                                    {Utility.prettifyNumber(this.props.existing_credit)}
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal()}>
                            {Localization.close}
                        </button>
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
    };
};

export const PaymentResult = connect(state2props, dispatch2props)(PaymentResultComponent);
