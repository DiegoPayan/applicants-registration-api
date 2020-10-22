const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');
const redis = require('redis')

import { UsuariosRepository } from '../repository/usuarios.repository';
import { genToken } from '../utils/genToken';

const usuariosRepository = new UsuariosRepository();
const redisService = redis.createClient(6379)

redisService.on('error', (err) => {
    console.log("Error " + err)
});

router.post('/', (req, res) => {
    let clave = req.body.clave;
    usuariosRepository.getByClave(clave).then((response) => {
        if (response.status == 200) {
            let decoded = jwtDecode(response.data);
            redisService.set(`tkn-${decoded.usuario.id}`, response.data.toString())
        }
        res.status(response.status).send(response);
    });
});

router.post('/refresh', (req, res) => {
    let oldToken = req.body.token;
    let decoded = jwtDecode(oldToken);
    if (decoded.usuario && decoded.usuario.id) {
        redisService.get(`tkn-${decoded.usuario.id}`, (error, valor) => {
            if (valor && valor === oldToken) {
                const token = genToken({
                    usuario: decoded.usuario
                });
                redisService.set(`tkn-${decoded.usuario.id}`, token.data.toString())
                res.status(200).send({ token: token });
                return
            }
            res.status(403).send("Token invalido");
        });
    } else {
        res.status(403).send("Token invalido");
    }
});

module.exports = router;