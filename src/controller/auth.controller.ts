const express = require('express');
const router = express.Router();

import { UsuariosRepository } from '../repository/usuarios.repository';

const usuariosRepository = new UsuariosRepository();

router.post('/', (req, res) => {
    let clave = req.body.clave;
    usuariosRepository.getByClave(clave).then((response) => {
        res.status(response.status).send(response);
    });
});

module.exports = router;