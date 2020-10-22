import { getManager } from 'typeorm';
import { Puesto } from '../entity/puesto.entity';
import { Response } from '../dto/response.dto';
import { Aspirantes } from '../entity/aspirantes.entity';
import * as message from '../const/puesto.const';

export class PuestosRepository {

  async getAll(query): Promise<Response> {
    let response = new Response();
    let puesto = await getManager().getRepository(Puesto).find({ where: query });
    if (puesto) {
      response.data = puesto;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_PUESTO;
    }
    return response;
  }

  async save(puesto: Puesto): Promise<Response> {
    let response = new Response();
    let resultadoPuesto = await getManager().getRepository(Puesto).save(puesto);
    if (resultadoPuesto) {
      response.data = resultadoPuesto;
      response.message = message.SUCCESS_SAVE_PUESTO;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_PUESTO;
    }
    return response;
  }

  async update(id: number, puesto: Puesto): Promise<Response> {
    let response = new Response();
    if (puesto.estatus == 'INACTIVO') {
      let resultadoAspirantes = await getManager().getRepository(Aspirantes).count({ idPuesto: id });
      if (resultadoAspirantes > 0) {
        response.status = 400;
        response.message = message.ERROR_DISABLE_PUESTO;
        return response;
      }
    }
    let resultadoPuesto = await getManager().getRepository(Puesto).update({ id }, puesto);
    if (resultadoPuesto) {
      response.data = resultadoPuesto;
      response.message = message.SUCCESS_UPDATE_PUESTO;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_UPDATE_PUESTO;
    }
    return response;
  }

}