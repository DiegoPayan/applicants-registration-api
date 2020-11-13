import { getManager, getConnection } from 'typeorm';
import { Configuracion } from '../entity/configuracion.entity';
import { Response } from '../dto/response.dto';

import * as message from '../const/configuracion.const';

export class ConfiguracionRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let consultaConfiguracion = await getManager().getRepository(Configuracion).find();
    if (consultaConfiguracion) {
      response.data = consultaConfiguracion;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_GET_ALL;
    }
    return response;
  }

  async create(configuracion: Configuracion[]): Promise<Response> {
    let response = new Response();
    await getManager().query('TRUNCATE TABLE configuracion_firmas');
    await getManager().query('ALTER TABLE configuracion_firmas AUTO_INCREMENT = 1');
    if (configuracion.length > 0) {
      configuracion.forEach(async element => {
        await getManager().getRepository(Configuracion).save(element);
      });
    }
    let consultaConfiguracion = await getManager().getRepository(Configuracion).find();
    if (consultaConfiguracion) {
      response.message = message.SUCCESS_SAVE;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE;
    }
    return response;
  }

}