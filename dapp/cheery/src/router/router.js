
import Login from '../component/login/login'
import Home from '../component/home/index'

export const routes = [
    // {
    //     path: "",
    //     component: Home,
    // },
    {
        path: "/smartex",
        component: Home,
    },
    {
        path: "/smartex/login",
        component: Login,
    }
]
