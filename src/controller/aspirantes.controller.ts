const express = require('express');
const router = express.Router();

import { AspirantesRepository } from '../repository/aspirantes.repository';

const aspirantesRepository = new AspirantesRepository();

router.get('/', (req, res) => {
  aspirantesRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
});

router.get('/lista', (req, res) => {
  aspirantesRepository.getOrdenedList().then((response) => {
    res.send(response);
  });
});

module.exports = router;