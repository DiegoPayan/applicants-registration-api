import { getManager } from 'typeorm';
import { Puesto } from '../entity/puesto.entity';
import { Response } from '../dto/response.dto';
import * as message from '../const/puesto.const';

export class PuestosRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let puesto = await getManager().getRepository(Puesto).find();
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
    let resultadoPuesto = await getManager().getRepository(Puesto).update({ id }, puesto);
    if (resultadoPuesto) {
      response.data = resultadoPuesto;
      response.message = message.SUCCESS_UPDATE_PUESTO;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_PUESTO;
    }
    return response;
  }

}