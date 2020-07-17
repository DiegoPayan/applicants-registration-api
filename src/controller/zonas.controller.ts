const express = require('express');
const router = express.Router();

import { ZonasRepository } from '../repository/zonas.repository';

const zonaRepository = new ZonasRepository();

router.get('/', (req, res) => {
  zonaRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let estudio = req.body;
  zonaRepository.save(estudio).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let estudio = req.body;
  zonaRepository.update(id, estudio).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;