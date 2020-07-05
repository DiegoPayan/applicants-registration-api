import { getManager } from 'typeorm';
import { Aspirantes } from '../entity/aspirantes.entity';
import { AspirantesJoin } from '../entity/aspirantesJoin.entity';
import { Puntaje } from '../entity/puntaje.entity';
import { Response } from '../dto/response.dto';

import * as message from '../const/aspirantes.const';

export class AspirantesRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let aspirantes = await getManager().getRepository(AspirantesJoin).find({ relations: ["estudios", "rama", "puesto", "zona"] });
    if (aspirantes) {
      response.data = aspirantes;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_ASPIRANTES;
    }
    return response;
  }

  async getById(idAspirante): Promise<Response> {
    let response = new Response();
    let aspirante = await getManager().getRepository(AspirantesJoin).findOne({ id: idAspirante }, { relations: ["estudios", "rama", "puesto", "zona"] });
    if (aspirante) {
      let puntaje = await getManager().getRepository(Puntaje).findOne({ idAspirante });
      if (puntaje) {
        response.data = { aspirante, puntaje };
        response.status = 200;
      } else {
        response.status = 400;
        response.message = message.NO_PUNTAJE_ASPIRANTE;
      }
    } else {
      response.status = 400;
        response.message = message.NO_ASPIRANTE_POR_ID;
    }
    return response;
  }

  async getOrdenedList(): Promise<Response> {
    let response = new Response();
    let aspirantes = await getManager().getRepository(AspirantesJoin).find({ relations: ["estudios", "rama", "puesto", "zona"] });
    //await getManager().getRepository(AspirantesJoin).createQueryBuilder("aspirante").take(20).skip(40).addOrderBy("aspirante.folio", "DESC");
    console.log(aspirantes);

    return response;
  }

  async save(aspirante: Aspirantes, puntaje: Puntaje): Promise<Response> {
    let response = new Response();
    let resultadoAspirante = await getManager().getRepository(Aspirantes).save(aspirante);
    if (resultadoAspirante) {
      puntaje.idAspirante = resultadoAspirante.id;
      let resultadoPuntaje = getManager().getRepository(Puntaje).save(puntaje);
      if (resultadoPuntaje) {
        response.data = resultadoAspirante;
        response.data = message.SUCCESS_SAVE_ASPIRANTE;
        response.status = 200;
      }
    } else {
      response.status = 400;
      response.message = message.ERROR_GUARDAR_ASPIRANTE;
    }
    return response;
  }

}