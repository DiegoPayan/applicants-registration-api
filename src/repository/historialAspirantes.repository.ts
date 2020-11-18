import { getManager } from 'typeorm';
import { HistorialAspirantes } from '../entity/historialAspirantes.entity';
import { Response } from '../dto/response.dto';
import * as message from '../const/historialAspirantes.const';
import { Usuarios } from '../entity/usuarios.entity';
import { HistorialAspirantesJoin } from '../entity/historialAspirantesJoin.entity';

export class HistorialAspirantesRepository {

  async getAll(): Promise<Response> {
    let response = new Response();
    let resultadoHistorial = await getManager().getRepository(HistorialAspirantesJoin).find({ relations: ['usuarios', 'aspirantes'], order: { id: 'DESC' } });
    resultadoHistorial.map((elem) => {
      Object.keys(elem.usuarios).forEach((itm) => {
        if (itm != "nombre" && itm != "apellidoPaterno" && itm != "apellidoMaterno") delete elem.usuarios[itm];
      });
      Object.keys(elem.aspirantes).forEach((itm) => {
        if (itm != "nombre" && itm != "apellidoPaterno" && itm != "apellidoMaterno") delete elem.aspirantes[itm];
      });
    });
    if (resultadoHistorial) {
      response.data = resultadoHistorial;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_GET_ALL;
    }
    return response;
  }

  async buildInsert(request, changes): Promise<any> {
    let historialAspirantes;
    let { data } = changes;
    let inserts = [];
    data.forEach(async element => {
      if (!element.hasOwnProperty('idAspirante')) {
        historialAspirantes = new HistorialAspirantes();
        let dato = Object.keys(element)[0];
        historialAspirantes.idUsuario = request.decoded.usuario.id;
        historialAspirantes.tipo = request.method;
        historialAspirantes.idAspirante = data[0].idAspirante;
        historialAspirantes.dato = dato;
        historialAspirantes.antes = element[dato][0];
        historialAspirantes.despues = element[dato][1];
        inserts = [...inserts, historialAspirantes];
      }
    });
    await this.save(inserts);
    return;
  }

  async save(historialAspirantes: HistorialAspirantes[]): Promise<Response> {
    let response = new Response();
    let resultadoHistorial;

    historialAspirantes.forEach(async element => {
      resultadoHistorial = await getManager().getRepository(HistorialAspirantes).save(element);
    });

    if (resultadoHistorial) {
      response.message = message.SUCCESS_SAVE_HISTORIAL_ASPIRANTE;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_SAVE_HISTORIAL_ASPIRANTE;
    }

    return response;
  }

}