import React from 'react';
import { withRouter, Route } from 'react-router-dom'

const Button = withRouter(({ history }) => (
    <button
        type='button'
        onClick={() => { history.push('/user') }}
    >
        Click Me!
    </button>
))

const Button2 = () => (
    <Route render={({ history }) => (
        <button
            type='button'
            onClick={() => { history.push('/user') }}
        >
            Click Me! 222
      </button>
    )} />
)

class Role extends React.Component {
    props: any;
    gotoUser() {
        this.props.history.push('/user');
    }

    Button3() {
        return (
            <Route render={({ history }) => (
                <button
                    type='button'
                    onClick={() => { history.push('/user') }}
                >
                    Click Me! 33
              </button>
            )} />
        )
    }

    render() {
        return (
            <>
                roleeee
                <div className="btn btn-primary" onClick={this.gotoUser.bind(this)}>goto user</div>
                <Button />
                <Button2 />
                <this.Button3 />
            </>
        );
    }
}

export default Role;
// export default withRouter(Role);