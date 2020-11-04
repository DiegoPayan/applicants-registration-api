const express = require('express');
const router = express.Router();

import { HistorialAspirantesRepository } from '../repository/historialAspirantes.repository';

const historialAspirantesRepository = new HistorialAspirantesRepository();

router.get('/', (req, res) => {
  historialAspirantesRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;