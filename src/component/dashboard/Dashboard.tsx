import React from 'react';
import Server from '../../service/Server'
import BookManage from '../book/bookManage/BookManage';

class Dashboard extends React.Component {
    server: Server;

    constructor(props: any) {
        super(props);
        this.server = new Server();
    }

    render() {
        return (
            <>
                <BookManage  >
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-danger">test childrrr</div>
                        </div>
                    </div>
                </BookManage>
            </>
        )
    }
}

export default Dashboard;