import React from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { Dispatch } from "redux";
import { redux_state } from "../../../redux/app_state";
import { TInternationalization } from "../../../config/setup";
import { BaseComponent } from "../../_base/BaseComponent";
import { Localization } from "../../../config/localization/localization";
import { Modal } from "react-bootstrap";
import { BtnLoader } from "../../form/btn-loader/BtnLoader";
import { NETWORK_STATUS } from "../../../enum/NetworkStatus";

interface IProps {
    internationalization: TInternationalization;
    show: boolean;
    onHide: () => any;
    onConfirm: () => any;
    network_status: NETWORK_STATUS;
    msg?: string;
    msgFunc?: () => any;
    btnLoader?: boolean;
    confirmBtn_className?: string;
    confirmBtn_text?: string | (() => JSX.Element);
}

interface IState {
}

class ConfirmNotifyComponent extends BaseComponent<IProps, IState> {
    static defaultProps = { btnLoader: false, };

    closeModal() { this.props.onHide(); }

    modal_render() {
        return (
            <>
                <Modal show={this.props.show} onHide={() => this.closeModal()} centered >
                    <Modal.Body>
                        <div className="row">
                            <div className="col-12">
                                {
                                    this.props.msgFunc ?
                                        this.props.msgFunc() :
                                        this.props.msg
                                }
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="pt-0 border-top-0">
                        <button className="btn btn-light-- btn-sm text-uppercase min-w-70px" onClick={() => this.closeModal()}>
                            {Localization.close}
                        </button>
                        <BtnLoader
                            btnClassName={"btn text-primary btn-sm text-uppercase min-w-70px " + this.props.confirmBtn_className}
                            loading={this.props.btnLoader!}
                            onClick={() => this.props.onConfirm()}
                        >
                            {
                                this.props.confirmBtn_text ?
                                    (typeof this.props.confirmBtn_text === 'string' ?
                                        this.props.confirmBtn_text : this.props.confirmBtn_text())
                                    :
                                    Localization.confirm
                            }
                        </BtnLoader>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    render() { return (<>{this.modal_render()}</>); }
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

export const ConfirmNotify = connect(state2props, dispatch2props)(ConfirmNotifyComponent);
