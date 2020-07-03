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

  async getOrdenedList(): Promise<Response> {
    let response = new Response();
    let aspirantes = await getManager().getRepository(AspirantesJoin).find({ relations: ["estudios", "rama", "puesto", "zona"] });
    //await getManager().getRepository(AspirantesJoin).createQueryBuilder("aspirante").take(1).addOrderBy("aspirante.folio", "DESC");
    console.log(aspirantes);

    return response;
  }

  async guardarAspirante(aspirante: Aspirantes, puntaje: Puntaje): Promise<Response> {
    let response = new Response();
    /*let queryAspirante = await getManager().getRepository(Aspirantes).createQueryBuilder("aspirante").take(1).addOrderBy("aspirante.folio", "DESC").getOne();
    let nuevoFolio;
    if (queryAspirante) {
      let ultimoFolio = queryAspirante.folio.split('/');
      nuevoFolio = `${ultimoFolio[0]}/${parseInt(ultimoFolio[1]) + 1}`;
    }
    aspirante.folio = nuevoFolio;*/
    let resultadoAspirante = await getManager().getRepository(Aspirantes).save(aspirante);
    if (resultadoAspirante) {
      puntaje.idAspirante = resultadoAspirante.id;
      let resultadoPuntaje = getManager().getRepository(Puntaje).save(puntaje);
      if (resultadoPuntaje) {
        response.data = resultadoAspirante;
        response.status = 200;
      }
    } else {
      response.status = 400;
      response.message = message.NO_ASPIRANTES;
    }
    return response;
  }

}