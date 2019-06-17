import React from 'react';
import Number from '../form/number/Number';
import { Route } from 'react-router-dom'
import { AppState } from '../../service/app-state';

class User extends React.Component<any> {
    state = { numberVal: '99sss' };
    componentWillMount() {
        if (!AppState.isLogedIn) {
            this.props.history.push('/login');
        }
    }
    changeTo(val: any) {
        this.setState({ numberVal: val });
    }

    onNumberChanged(val: any) {
        this.setState({ numberVal: val });
    }

    startInterval() {
        let items = [1, 2, 3, 'ssss85', 'scac', '9j', 8, '5sa1c5a', 'csacasc00', '959cs9acas6c1as6c1sac1asc1as9c1ac9'];
        setInterval(() => {
            this.setState({ numberVal: items[Math.round(Math.random() * 10)] });
        }, 1000)
    }

    render() {
        return (
            <>

                <button onClick={() => this.changeTo(35)}>change to 35</button>
                <button onClick={() => this.changeTo('aa')}>change to aa</button>

                <button onClick={this.startInterval.bind(this)}>startInterval</button>
                <br />

                {this.state.numberVal}
                <Number value={this.state.numberVal} onChange={this.onNumberChanged.bind(this)} />

                <Route render={({ history }) => (
                    <button
                        type='button'
                        onClick={() => { history.push('/user/create') }}
                    >
                        goto user create ->
                    </button>
                )} />
            </>
        )
    }
}

export default User;