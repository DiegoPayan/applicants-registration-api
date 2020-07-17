import { getManager } from 'typeorm';
import { Zona } from '../entity/zona.entity';
import { Response } from '../dto/response.dto';
import * as message from '../const/puesto.const';

export class ZonasRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let zona = await getManager().getRepository(Zona).find();
    if (zona) {
      response.data = zona;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_PUESTO;
    }
    return response;
  }

  async save(zona: Zona): Promise<Response> {
    let response = new Response();
    let resultadoZona = await getManager().getRepository(Zona).save(zona);
    if (resultadoZona) {
      response.data = resultadoZona;
      response.message = message.SUCCESS_SAVE_PUESTO;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_PUESTO;
    }
    return response;
  }

  async update(id: number, zona: Zona): Promise<Response> {
    let response = new Response();
    let resultadoZona = await getManager().getRepository(Zona).update({ id }, zona);
    if (resultadoZona) {
      response.data = resultadoZona;
      response.message = message.SUCCESS_UPDATE_PUESTO;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_PUESTO;
    }
    return response;
  }

}