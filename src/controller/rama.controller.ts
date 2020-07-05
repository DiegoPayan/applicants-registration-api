const express = require('express');
const router = express.Router();

import { RamaRepository } from '../repository/rama.repository';

const ramaRepository = new RamaRepository();

router.get('/', (req, res) => {
  ramaRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let estudio = req.body;
  ramaRepository.save(estudio).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let estudio = req.body;
  ramaRepository.update(id, estudio).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;