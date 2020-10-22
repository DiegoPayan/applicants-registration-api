import { getManager } from 'typeorm';
import { Rama } from '../entity/rama.entity';
import { Aspirantes } from '../entity/aspirantes.entity';
import { Response } from '../dto/response.dto';
import * as message from '../const/rama.const';

export class RamaRepository {

  async getAll(query): Promise<Response> {
    let response = new Response();
    let ramas = await getManager().getRepository(Rama).find({ where: query });
    if (ramas) {
      response.data = ramas;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_RAMA;
    }
    return response;
  }

  async save(ramas: Rama): Promise<Response> {
    let response = new Response();
    let resultadoRama = await getManager().getRepository(Rama).save(ramas);
    if (resultadoRama) {
      response.data = resultadoRama;
      response.message = message.SUCCESS_SAVE_RAMA;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_RAMA;
    }
    return response;
  }

  async update(id: number, rama: Rama): Promise<Response> {
    let response = new Response();
    if (rama.estatus == 'INACTIVO') {
      let resultadoAspirantes = await getManager().getRepository(Aspirantes).count({ idRama : id });
      if (resultadoAspirantes > 0) {
        response.status = 400;
        response.message = message.ERROR_DISABLE_RAMA;
        return response;
      }
    }
    let resultadoRama = await getManager().getRepository(Rama).update({ id }, rama);
    if (resultadoRama) {
      response.data = resultadoRama;
      response.message = message.SUCCESS_UPDATE_RAMA;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_UPDATE_RAMA;
    }
    return response;
  }

}