const express = require('express');
const router = express.Router();

import { UsuariosRepository } from '../repository/usuarios.repository';

const usuariosRepository = new UsuariosRepository();

router.get('/', (req, res) => {
    usuariosRepository.getAll().then((response) => {
        res.send(response);  
    });
});

module.exports = router;