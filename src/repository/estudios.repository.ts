import { getManager } from 'typeorm';
import { Estudios } from '../entity/estudios.entity';
import { Response } from '../dto/response.dto';
import * as message from '../const/estudios.const';

export class EstudiosRepository {

  async getAll(query): Promise<Response> {
    let response = new Response();
    let estudios = await getManager().getRepository(Estudios).find({ where: query });
    if (estudios) {
      response.data = estudios;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_ESTUDIOS;
    }
    return response;
  }

  async save(estudios: Estudios): Promise<Response> {
    let response = new Response();
    let resultadoEstudio = await getManager().getRepository(Estudios).save(estudios);
    if (resultadoEstudio) {
      response.data = resultadoEstudio;
      response.message = message.SUCCESS_SAVE_ESTUDIOS;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_ESTUDIOS;
    }
    return response;
  }

  async update(id: number, estudios: Estudios): Promise<Response> {
    let response = new Response();
    let resultadoEstudio = await getManager().getRepository(Estudios).update({ id }, estudios);
    if (resultadoEstudio) {
      response.data = resultadoEstudio;
      response.message = message.SUCCESS_UPDATE_ESTUDIOS;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_ESTUDIOS;
    }
    return response;
  }

}