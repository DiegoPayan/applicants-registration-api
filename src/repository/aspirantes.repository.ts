import { getManager, Like } from 'typeorm';
import { Aspirantes } from '../entity/aspirantes.entity';
import { AspirantesJoin } from '../entity/aspirantesJoin.entity';
import { Puntaje } from '../entity/puntaje.entity';
import { Rama } from '../entity/rama.entity';
import { Zona } from '../entity/zona.entity';
import { Puesto } from '../entity/puesto.entity';
import { Response } from '../dto/response.dto';

import { isObjectEmpty } from '../utils/isEmpty';

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
    let zonasAspirantes = await getManager().getRepository(Aspirantes).createQueryBuilder("aspirante").select("aspirante.idZona").groupBy("aspirante.idZona").getRawMany();
    let ramasAspirantes = await getManager().getRepository(Aspirantes).createQueryBuilder("aspirante").select("aspirante.idRama").groupBy("aspirante.idRama").getRawMany();
    let puestosAspirantes = await getManager().getRepository(Aspirantes).createQueryBuilder("aspirante").select("aspirante.idPuesto").groupBy("aspirante.idPuesto").getRawMany();

    let zonas = await getManager().getRepository(Zona).find();
    let ramas = await getManager().getRepository(Rama).find();
    let puestos = await getManager().getRepository(Puesto).find();
    let listados = ['SINDICATO', 'INSTITUTO'];

    let datosAspirantes = [];

    for (let zona of zonasAspirantes) {
      let idZona = zona.aspirante_idZona;
      let datosZona = zonas.filter((zona) => zona.id == idZona)[0];

      for (let rama of ramasAspirantes) {
        let idRama = rama.aspirante_idRama;
        let datosRama = ramas.filter((rama) => rama.id == idRama)[0];

        for (let puesto of puestosAspirantes) {
          let idPuesto = puesto.aspirante_idPuesto;
          let datosPuesto = puestos.filter((puesto) => puesto.id == idPuesto)[0];
          let aspirantes = { sindicato: {}, instituto: {} };

          for (let listado of listados) {
            let resultadoAspirantes = await getManager().getRepository(Aspirantes).find({ where: { idZona, idRama, idPuesto, listado } });
            if (listado == 'SINDICATO') {
              aspirantes.sindicato = { ...aspirantes.sindicato, ...resultadoAspirantes };
            } else if (listado == 'INSTITUTO') {
              aspirantes.instituto = { ...aspirantes.instituto, ...resultadoAspirantes };
            }
          }

          datosAspirantes.push(
            {
              zona: datosZona.nombre,
              rama: datosRama.nombre,
              puesto: datosPuesto.nombre,
              aspirantes: aspirantes
            }
          );

        }
      }
    }

    datosAspirantes = datosAspirantes.filter((aspirante) => !isObjectEmpty(aspirante.aspirantes.sindicato) || !isObjectEmpty(aspirante.aspirantes.instituto));

    response.data = datosAspirantes;
    return response;
  }

  async getFolio(): Promise<String> {
    let year = new Date().getFullYear();
    let nuevoFolio;
    let aspirante = await getManager().query(`SELECT * FROM servicio.aspirantes where folio like '${year}%' order by CAST(SUBSTR(folio FROM 6 FOR 100) as unsigned) desc limit 1`);
    if (aspirante.length > 0) {
      let folio = aspirante[0].folio;
      let serie = folio.split('/');
      let nuevaSerie = parseInt(serie[1]) + 1;
      nuevoFolio = `${serie[0]}/${nuevaSerie}`;
    } else {
      nuevoFolio = `${year}/01`;
    }
    return nuevoFolio;
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

  async update(id: Number, aspirante: Aspirantes): Promise<Response> {
    let response = new Response();

    let resultadoAspirante = await getManager().getRepository(Aspirantes).update({ id }, aspirante);
    if (resultadoAspirante) {
      response.data = resultadoAspirante;
      response.message = message.SUCCESS_SAVE_ASPIRANTE;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_GUARDAR_ASPIRANTE;
    }

    return response;
  }

}