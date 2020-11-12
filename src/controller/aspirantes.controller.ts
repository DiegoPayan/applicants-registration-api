const express = require('express');
const router = express.Router();

import { AspirantesRepository } from '../repository/aspirantes.repository';
import { HistorialAspirantesRepository } from '../repository/historialAspirantes.repository';
import { isObjectEmpty } from '../utils/isEmpty';

const aspirantesRepository = new AspirantesRepository();
const historialAspirantesRepository = new HistorialAspirantesRepository();

router.get('/', (req, res) => {
  aspirantesRepository.getAll().then((response) => {
    res.status(response.status).send(response);
  });
});

router.get('/:idAspirante', (req, res) => {
  let idAspirante = req.params.idAspirante;
  aspirantesRepository.getById(idAspirante).then((response) => {
    res.status(response.status).send(response);
  });
});

router.get('/lista/ordenada', (req, res) => {
  let tipoLista = req.query.tipoLista;
  let subcomision = req.query.subcomision;
  aspirantesRepository.getOrdenedList(tipoLista, subcomision).then((response) => {
    res.send(response);
  });
});

router.get('/lista/ordenada/descarga', (req, res) => {
  let tipoLista = req.query.tipoLista;
  let subcomision = req.query.subcomision;
  aspirantesRepository.downloadExcel(tipoLista, subcomision).then((workbook) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    workbook.xlsx.write(res).then(function () {
      res.end();
    });
  });
});

router.get('/nuevo/folio', (req, res) => {
  aspirantesRepository.getFolio().then((response) => {
    res.send(response);
  });
});

router.post('/', (req, res) => {
  let aspirante = req.body.aspirante;
  let puntaje = req.body.puntaje;
  if (!isObjectEmpty(aspirante)) {
    aspirantesRepository.save(aspirante, puntaje).then((response) => {
      res.send(response);
    });
  } else {
    res.send('No se han recibido datos');
  }
});

router.put('/:idAspirante', (req, res) => {
  let aspirante = req.body.aspirante;
  let puntaje = req.body.puntaje;
  let id = req.params.idAspirante;
  if (!isObjectEmpty(aspirante)) {
    aspirantesRepository.update(id, aspirante, puntaje).then((response) => {
      historialAspirantesRepository.buildInsert(req, response);
      res.send(response);
    });
  } else {
    res.send('No se han recibido datos');
  }
});

module.exports = router;