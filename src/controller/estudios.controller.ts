const express = require('express');
const router = express.Router();

import { EstudiosRepository } from '../repository/estudios.repository';
import { isObjectEmpty } from '../utils/isEmpty';

const estudiosRepository = new EstudiosRepository();

router.get('/', (req, res) => {
  let query = req.query;
  estudiosRepository.getAll(query).then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let estudio = req.body;
  if (isObjectEmpty(estudio)) {
    return res.status(400).send({ message: 'No es posible almacenar niveles de estudio vacios' });
  }
  estudiosRepository.save(estudio).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let estudio = req.body;
  if (isObjectEmpty(estudio)) {
    return res.status(400).send({ message: 'No es posible actualizar niveles de estudio vacios' });
  }
  estudiosRepository.update(id, estudio).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;