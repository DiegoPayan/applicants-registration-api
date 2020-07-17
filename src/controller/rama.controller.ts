const express = require('express');
const router = express.Router();

import { RamaRepository } from '../repository/rama.repository';

const ramaRepository = new RamaRepository();

router.get('/', (req, res) => {
  let query = req.query;
  ramaRepository.getAll(query).then((response) => {
    res.status(response.status).send(response);
  });
});

router.post('/', (req, res) => {
  let rama = req.body;
  ramaRepository.save(rama).then((response) => {
    res.status(response.status).send(response);
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let rama = req.body;
  ramaRepository.update(id, rama).then((response) => {
    res.status(response.status).send(response);
  });
})

module.exports = router;