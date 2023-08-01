const express = require('express');
const path = require('path');
const route = express.Router();
const bodyParser = require('body-parser');
const { User, Crypto } = require('../model');

const user = new User();
const crypto = new Crypto();

route.get('^/$|/JTCypto', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../view/index.html'));
});
// Users Routes
route.post('/login', bodyParser.json(), (req, res) => {
    user.login(req, res);
});
route.post('/register', bodyParser.json(), (req, res) => {
    user.createUser(req, res);
});
route.get('/users', (req, res) => {
    user.fetchUsers(req, res);
});
route.get('/users/:id', (req, res) => {
    user.fetchUser(req, res);
});
route.put('/users/:id', bodyParser.json(), (req, res) => {
    user.updateUser(req, res);
});
route.delete('/users/:id', (req, res) => {
    user.deleteUser(req, res);
});
// Crypto Routes===================================
route.post('/jtcrypto', bodyParser.json(), (req, res) => {
    crypto.addCrypto(req, res);
});
route.get('/jtcrypto', (req, res) => {
    crypto.fetchCryptos(req, res);
});
route.get('/jtcrypto/:id', (req, res) => {
    crypto.fetchCrypto(req, res);
});
route.put('/jtcrypto/:id', bodyParser.json(), (req, res) => {
    crypto.updateCrypto(req, res);
});
route.delete('/jtcrypto/:id', (req, res) => {
    crypto.deleteCrypto(req, res);
});
module.exports = route;