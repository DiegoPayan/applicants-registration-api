const jwt = require('jsonwebtoken');
import { secret_key } from '../config/jwt';
import { Response } from '../dto/response.dto';

export const genToken = (payload) => {
  let response = new Response();
  const token = jwt.sign(payload, secret_key.key, {
    expiresIn: 3600
  });
  response.data = token;
  response.status = 200;
  return response;
};