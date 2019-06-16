import Number from '../form/number/Number';
import React from 'react';

const MyInput = (props: { label: string, elRef: (elName: HTMLInputElement) => void }) => {
    return (
        <div className="form-group">
            <label>{props.label}</label>
            <input type="text" ref={props.elRef} />
        </div>
    )
}

class CreateUser extends React.Component {
    inputName: HTMLInputElement | null | undefined;
    inputAge: HTMLInputElement | null | undefined;
    inputAddress: HTMLInputElement | null | undefined;
    btnSubmit: HTMLButtonElement | null | undefined;
    inputScore: HTMLInputElement | null | undefined;
    state = {
        score: true,
    }

    handleSubmit() {
        debugger;
        // this.inputAge && this.inputAge.focus();
        this.inputAddress && this.inputAddress.focus();
    }
    onScoreChange(val: any) {
        this.setState({ ...this.state, score: val });
    }
    render() {
        return (
            <>
                <div className="form-group">
                    <label>name</label>
                    <input type="text" ref={input => { this.inputName = input; }} />
                </div>
                <div className="form-group">
                    <label>age</label>
                    <input type="text" ref={input => { this.inputAge = input; }} />
                </div>
                <MyInput label="address" elRef={input => { this.inputAddress = input; }} />
                <Number
                    value={this.state.score}
                    elRef={input => { this.inputScore = input; }}
                    // onChange={this.onScoreChange.bind(this)}
                    onChange={val => this.onScoreChange(val)}
                />

                <div className="form-group">
                    <button ref={btn => { this.btnSubmit = btn; }} onClick={this.handleSubmit.bind(this)}>submitt</button>
                </div>
            </>
        )
    }
}

export default CreateUser;