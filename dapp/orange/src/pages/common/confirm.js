import React, { Component } from 'react';
import { Spin,Icon  } from 'antd'
import "antd/dist/antd.css"
import './confirm.css'

class Confirm extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        const antIcon = <Icon type="loading" style={{ fontSize: 100 ,color:'#fff'}} spin />;
        const {show} = this.props;
        return ( 
            show ? (
                <div className="dark-div">
                    <div className="dark"></div>
                    <div className="dark-icon">
                        <div>确认</div>
                    </div>

                </div>
            ):null

        );
    }
}
 
export default Confirm;