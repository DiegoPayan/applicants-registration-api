const express = require('express');
const router = express.Router();

import { PuestosRepository } from '../repository/puesto.repository';

const puestoRepository = new PuestosRepository();

router.get('/', (req, res) => {
  let query = req.query;
  puestoRepository.getAll(query).then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let estudio = req.body;
  puestoRepository.save(estudio).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let estudio = req.body;
  puestoRepository.update(id, estudio).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;