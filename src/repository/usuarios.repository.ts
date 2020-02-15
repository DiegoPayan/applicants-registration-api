import { getManager } from 'typeorm';
import { Usuarios } from '../entity/usuarios.entity';
import { Response } from '../dto/response.dto';
import { secret_key } from '../config/jwt';
import * as message from '../const/usuarios.const';

const jwt = require('jsonwebtoken');

export class UsuariosRepository {

    async getAll(): Promise<Response> {
        let response = new Response();
        let usuarios = await getManager().getRepository(Usuarios).find();
        if (usuarios.length > 0) {
            response.data = usuarios;
            response.status = 200;
        } else {
            response.status = 400;
            response.message = message.NO_USUARIOS;
        }
        return response;
    }

    async getByClave(clave): Promise<Response> {
        let result = await getManager().getRepository(Usuarios).findOne({ clave: clave, estatus: 'ACTIVO' });
        let response = new Response();
        if (result) {
            let cleanResult = Object.assign(result, {});
            delete cleanResult.clave;
            const payload = {
                usuario: cleanResult
            };
            const token = jwt.sign(payload, secret_key.key, {
                expiresIn: 3600
            });
            response.data = token;
            response.status = 200;
            response.message = message.CREDENCIALES_VALIDAS
        } else {
            response.status = 400;
            response.message = message.CREDENCIALES_INVALIDAS;
        }
        return response;

    }

}