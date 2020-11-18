const express = require('express');
const router = express.Router();

import { RamaRepository } from '../repository/rama.repository';
import { isObjectEmpty } from '../utils/isEmpty';

const ramaRepository = new RamaRepository();

router.get('/', (req, res) => {
  let query = req.query;
  ramaRepository.getAll(query).then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let rama = req.body;
  if (isObjectEmpty(rama)) {
    return res.status(400).send({ message: 'No es posible almacenar ramas vacias' });
  }
  ramaRepository.save(rama).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let rama = req.body;
  if (isObjectEmpty(rama)) {
    return res.status(400).send({ message: 'No es posible actualizar ramas vacias' });
  }
  ramaRepository.update(id, rama).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;