const express = require('express');
const router = express.Router();

import { ConfiguracionRepository } from '../repository/configuracion.repository';

const configuracionRepository = new ConfiguracionRepository();

router.get('/', (req, res) => {
  configuracionRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let body = req.body;
  configuracionRepository.create(body).then((response) => {
    res.status(response.status).send(response);
  });
});


module.exports = router;