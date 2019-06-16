import React from 'react';

class BookManage extends React.Component {
    componentDidMount() {
        debugger;
        // let vfd = this.props;
    }

    componentDidUpdate() {
        debugger;
    }

    render() {
        return <div>
            <div>book manage</div>
            {this.props.children}
        </div>
    }
}

export default BookManage;