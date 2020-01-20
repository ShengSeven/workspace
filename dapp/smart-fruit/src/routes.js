import Login from './pages/login/Login';
import UserInfo from './pages/user';
import Index from './pages/index';

export const routes = [
    {
        path: "/smartFruit",
        component: Index,
    },
    {
        path: "/smartFruit/login",
        component: Login,
    },
    {
        path: "/smartFruit/user-info",
        component: UserInfo,
    },

]
