import { getManager } from 'typeorm';
import { Aspirantes } from '../entity/aspirantes.entity';
import { Response } from '../dto/response.dto';

import * as message from '../const/aspirantes.const';

export class AspirantesRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let aspirantes = await getManager().getRepository(Aspirantes).find({ relations: ["estudios", "rama", "puesto", "zona", "puntaje"] });
    if (aspirantes) {
      response.data = aspirantes;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_ASPIRANTES;
    }

    return response;
  }

}