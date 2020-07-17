const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');

import { UsuariosRepository } from '../repository/usuarios.repository';
import { genToken } from '../utils/genToken';

const usuariosRepository = new UsuariosRepository();

router.post('/', (req, res) => {
    let clave = req.body.clave;
    let refreshToken = req.app.get('refreshToken');
    usuariosRepository.getByClave(clave).then((response) => {
        refreshToken.push(response.data);
        req.app.set('refreshToken', refreshToken);
        res.status(response.status).send(response);
    });
});

router.post('/refresh', (req, res) => {
    let refreshToken = req.app.get('refreshToken');
    let oldToken = req.body.token;
    let response;
    if (refreshToken.includes(oldToken)) {
        let decoded = jwtDecode(oldToken);
        response = genToken(decoded.usuario);
    }
    res.status(response && response.status ? response.status : 403).send(response);
});

module.exports = router;