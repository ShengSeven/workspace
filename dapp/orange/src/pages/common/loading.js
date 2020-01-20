import React, { Component } from 'react';
import { Spin,Icon  } from 'antd'
import "antd/dist/antd.css"
import './loading.css'

class Loading extends Component {
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
                        <Spin indicator={antIcon} />,
                    </div>

                </div>
            ):null

        );
    }
}
 
export default Loading;