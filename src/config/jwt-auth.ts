const express = require("express");
const jwt = require('jsonwebtoken');

import { Response } from '../dto/response.dto';

import { secret_key } from './jwt';

const protectedRoute = express.Router();

protectedRoute.use((req, res, next) => {
  const token = req.headers['authorization'];
  let response = new Response();
  if (token) {
    jwt.verify(token, secret_key.key, (err, decoded) => {
      if (err) {
        response.status = 401;
        response.message = 'Token inválido';
        return res.status(response.status).json(response);
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    response.status = 403;
    response.message = 'Token no proporcionado';
    res.status(response.status).send(response);
  }
});

module.exports = protectedRoute;