const express = require('express');
const router = express.Router();

import { PuestosRepository } from '../repository/puesto.repository';
import { isObjectEmpty } from '../utils/isEmpty';

const puestoRepository = new PuestosRepository();

router.get('/', (req, res) => {
  let query = req.query;
  puestoRepository.getAll(query).then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let puesto = req.body;
  if (isObjectEmpty(puesto)) {
    return res.status(400).send({ message: 'No es posible almacenar puestos vacios' });
  }
  puestoRepository.save(puesto).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let puesto = req.body;
  if (isObjectEmpty(puesto)) {
    return res.status(400).send({ message: 'No es posible actualizar puestos vacios' });
  }
  puestoRepository.update(id, puesto).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;