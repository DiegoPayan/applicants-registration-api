const express = require('express');
const router = express.Router();

import { AspirantesRepository } from '../repository/aspirantes.repository';
import { isObjectEmpty } from '../utils/isEmpty';

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

router.post('/', (req, res) => {
  let aspirante = req.body.aspirante;
  let puntaje = req.body.puntaje;
  if (!isObjectEmpty(aspirante)) {
    aspirantesRepository.guardarAspirante(aspirante, puntaje).then((response) => {
      res.send(response);
    });
  } else {
    res.send('No se han recibido datos');
  }
});

module.exports = router;