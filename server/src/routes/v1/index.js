const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const guildRoute = require('./guild.route');
const inviteRoute = require('./guildInvite.route');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/guilds',
        route: guildRoute,
    },
    {
        path: '/invites',
        route: inviteRoute,
    }
];


defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;