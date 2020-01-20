import React, { Component } from 'react';
import './index.css'

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return ( 
            <div className="main">
                <div className="head-div">
                    <div className="main-div">
                        <div className="left-div">你好，<span>12</span></div>
                        <div className="middle-div">0x7bC23f2Bf3A25D206sdfsfdssdfsdfsfdfsdfsdfc</div>
                        <div className="right-div">退出登录</div>
                    </div>
                </div>
                <div className="main-div">
                    <div className="info-div">
                        <div className="info-item">
                            <div className="info-val-div">4.499383938 ETH</div>
                            <div className="info-text-div">
                                <span>余额</span>
                                <i className="info-icon balance-icon"></i>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-val-div">0</div>
                            <div className="info-text-div">
                                <span>推荐</span>
                                <i className="info-icon balance-icon"></i>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-val-div">2</div>
                            <div className="info-text-div">
                                <span>当前等级</span>
                                <i className="info-icon balance-icon"></i>
                            </div>
                        </div>
                    </div>
                    <div className="content-div">
                        <div className="tab-div">
                            <div classNmae="tab-item">面板</div>
                            <div classNmae="tab-item">统计</div>
                            <div classNmae="tab-item">上线</div>
                        </div>
                        <div className="level-div">面板内容</div>
                        <div className="log-div">统计内容</div>
                        <div className="pre-div">上线内容</div>
                    </div>
                </div>
            </div>
         );
    }
}
 
export default Index;