export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user', 'superUser'],
    routes: [
      // dashboard
      { path: '/', redirect: '/homepage' },
      {
        path: '/homepage',
        name: 'homepage',
        icon: 'home',
        component: './System/System',
      },
      {
        path: '/userguide',
        name: 'userguide',
        icon: 'book',
        component: './UserGuide/UserGuide',
      },
      {
        authority: ['admin'],
        path: '/user_manage',
        name: 'user_manage',
        icon: 'usergroup-add',
        component: './ManageUsers/ManageUsers',
      },
      {
        path: '/map_view',
        name: 'map_view',
        icon: 'audit',
        component: './NodeManage/MapView',
      },
      {
        path: '/node',
        name: 'node',
        icon: 'dashboard',
        routes: [
          {
            path: '/node/order',
            name: 'node_order',
            component: './Nodes/OrderNode',
          },
          {
            path: '/node/my_order',
            name: 'my_order',
            component: './Nodes/MyOrder',
          },
        ],
      },
      {
        path: '/node_manage',
        name: 'node_manage',
        icon: 'environment',
        authority: ['admin', 'superUser'],
        routes: [
          {
            path: '/node_manage/list_view',
            name: 'list_view',
            component: './NodeManage/NodeManage',
          },
          {
            path: '/node_manage/gateway',
            name: 'gateway',
            component: './NodeManage/GateWay',
          },
        ],
      },
      {
        path: '/loraserver',
        name: 'loraserver',
        icon: 'cloud',
        component: './LoRaServer/LoRaServer',
      },
      {
        path: '/about',
        name: 'about',
        icon: 'info-circle',
        component: './AboutUs/AboutUs',
      },
      {
        component: '404',
      },
    ],
  },
];
