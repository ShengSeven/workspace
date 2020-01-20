import React, { Component } from 'react';
import {BrowserRouter as Router ,Route} from 'react-router-dom'

import {routes} from './router/router'

class Home extends Component {
    render() { 
        return ( 
            <Router>
                {
                    routes.map((router,index)=>{
                        return <Route key={router+index} path={router.path} exact component = {router.component} />
                    })
                }
            </Router>
         );
    }
}
 
export default Home;