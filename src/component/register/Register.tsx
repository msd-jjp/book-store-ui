import React from 'react';

class Register extends React.Component {
    props: any;
    gotoLogin() {
        this.props.history.push('/login');
    }
    render() {
        return (
            <>
                <div>mobile --> submit</div>

                <div>code --> submit</div>

                <div>register -_> submit</div>

                <div className="btn btn-info" onClick={() => this.gotoLogin()}>gto login</div>
            </>
        )
    }
}

export default Register;