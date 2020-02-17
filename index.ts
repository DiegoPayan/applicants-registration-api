import { createConnection } from 'typeorm';
import * as protectedRoute from './src/config/jwt-auth';

const express = require("express");
const bodyParser = require('body-parser');

createConnection().then(connection => { }).catch(error => console.log(error));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('refreshToken', []);

app.get('/', function (req, res) { res.send('Hola Mundo') });
app.use('/aspirantes', protectedRoute, require('./src/controller/aspirantes.controller'));
app.use('/usuarios', protectedRoute, require('./src/controller/usuarios.controller'));
app.use('/auth', require('./src/controller/auth.controller'));

let listener = app.listen(5000, () => {
    console.log(`Servidor iniciado en ${listener.address().port}`);
});