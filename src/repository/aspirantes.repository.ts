import { getManager, Like } from 'typeorm';
import { Aspirantes } from '../entity/aspirantes.entity';
import { AspirantesJoin } from '../entity/aspirantesJoin.entity';
import { Puntaje } from '../entity/puntaje.entity';
import { Rama } from '../entity/rama.entity';
import { Zona } from '../entity/zona.entity';
import { Puesto } from '../entity/puesto.entity';
import { Configuracion } from '../entity/configuracion.entity';
import { Response } from '../dto/response.dto';

import { isObjectEmpty } from '../utils/isEmpty';
import { compararFolios } from '../utils/compararFolio';

import { Workbook, Worksheet } from 'exceljs';

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
    let aspirante = await getManager().getRepository(AspirantesJoin).findOne({ id: idAspirante }, { relations: ["estudios", "rama", "puesto", "zona", "puntaje"] });
    if (aspirante) {
      response.data = aspirante;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.NO_ASPIRANTE_POR_ID;
    }
    return response;
  }

  //tipoLista = puntuacion, cronologico
  //subcomision = DELEGACION, HOSPITAL REGIONAL
  async createList(tipoLista, subcomision): Promise<any> {
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
          let aspirantes = { sindicato: [], instituto: [] };

          for (let listado of listados) {
            let resultadoAspirantes = await getManager().getRepository(AspirantesJoin).find({ where: { idZona, idRama, idPuesto, listado, subcomision }, relations: ['puntaje', 'estudios'] });
            if (listado == 'SINDICATO') {
              aspirantes.sindicato = [...aspirantes.sindicato, ...resultadoAspirantes];
            } else if (listado == 'INSTITUTO') {
              aspirantes.instituto = [...aspirantes.instituto, ...resultadoAspirantes];
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

    for (let i = 0; i < datosAspirantes.length; i++) {
      if (tipoLista == 'cronologico') {
        datosAspirantes[i].aspirantes.instituto.sort((aspirante1, aspirante2) => {
          if (aspirante1.fecha < aspirante2.fecha) return -1;
          if (aspirante1.fecha > aspirante2.fecha) return 1;

          if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
          if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

          if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
          if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
        });

        datosAspirantes[i].aspirantes.sindicato.sort((aspirante1, aspirante2) => {
          if (aspirante1.fecha < aspirante2.fecha) return -1;
          if (aspirante1.fecha > aspirante2.fecha) return 1;

          if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
          if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

          if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
          if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
        });
      } else if (tipoLista == 'puntuacion') {
        datosAspirantes[i].aspirantes.instituto.sort((aspirante1, aspirante2) => {
          if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
          if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

          if (aspirante1.fecha < aspirante2.fecha) return -1;
          if (aspirante1.fecha > aspirante2.fecha) return 1;

          if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
          if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
        });

        datosAspirantes[i].aspirantes.sindicato.sort((aspirante1, aspirante2) => {
          if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
          if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

          if (aspirante1.fecha < aspirante2.fecha) return -1;
          if (aspirante1.fecha > aspirante2.fecha) return 1;

          if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
          if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
        });
      }
    }

    return datosAspirantes;
  }

  async getOrdenedList(tipoLista, subcomision): Promise<Response> {
    let response = new Response;
    let list = await this.createList(tipoLista, subcomision);
    response.data = list;
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
    let resultadoPuntaje = getManager().getRepository(Puntaje).save(puntaje);
    if (resultadoPuntaje) {
      aspirante.idPuntaje = (await resultadoPuntaje).id;
      let resultadoAspirante = await getManager().getRepository(Aspirantes).save(aspirante);
      if (resultadoAspirante) {
        response.data = resultadoAspirante;
        response.message = message.SUCCESS_SAVE_ASPIRANTE;
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
    let preConsultaAspirante = await getManager().getRepository(Aspirantes).findOne({ id });
    let resultadoAspirante = await getManager().getRepository(Aspirantes).update({ id }, aspirante);
    let postConsultaAspirante = await getManager().getRepository(Aspirantes).findOne({ id });
    let modificaciones = [];
    await Object.entries(preConsultaAspirante).forEach(([key, value]) => {
      if (postConsultaAspirante[key].toString() != value.toString()) {
        modificaciones.push({ [key]: [value, postConsultaAspirante[key]] });
      }
    });
    modificaciones.unshift({ idAspirante: id });
    if (resultadoAspirante) {
      response.data = modificaciones;
      response.message = message.SUCCESS_UPDATE_ASPIRANTE;
      response.status = 200;
    } else {
      response.status = 400;
      response.message = message.ERROR_UPDATE_ASPIRANTE;
    }

    return response;
  }

  async downloadExcel(tipoLista, subcomision): Promise<any> {
    let list = await this.createList(tipoLista, subcomision);
    if (subcomision == 'HOSPITAL REGIONAL') subcomision = 'HR';

    var workbook = new Workbook();
    let worksheet = workbook.addWorksheet(`FORMATO ${tipoLista.toUpperCase()} ${subcomision.toUpperCase()}`, {
      pageSetup: { paperSize: 5, orientation: 'landscape', scale: 88 },
      headerFooter: { firstHeader: "Hello Exceljs", firstFooter: "Hello World" },
      views: [{ state: 'normal', style: 'pageBreakPreview', zoomScale: 98, zoomScaleNormal: 98 }]
    });

    if (tipoLista == 'puntuación') {
      worksheet.pageSetup.margins = {
        left: 0.3, right: 0.3,
        top: 0.3, bottom: 0.6,
        header: 0.3, footer: 0.3
      };
    } else {
      worksheet.pageSetup.margins = {
        left: 0.71, right: 0.52,
        top: 0.18, bottom: 0.68,
        header: 0.15, footer: 0.3
      };
    }

    if (tipoLista == 'puntuacion') {
      worksheet = this.reportColumnSizePuntuacion(worksheet);
    } else {
      worksheet = this.reportColumnSizeCronologico(worksheet);
    }

    let consultaConfiguracion = await getManager().getRepository(Configuracion).find();
    consultaConfiguracion.sort((a,b) => {
      if(a.orden < b.orden) return -1;
      if(a.orden > b.orden) return 1;
    });

    worksheet = this.genExcelContent(tipoLista, workbook, list, worksheet, subcomision, 0, consultaConfiguracion);

    return workbook;
  }

  headerIndex = 0;
  bodyIndex = 0;
  genExcelContent(tipoLista, workbook, list, worksheet, subcomision, page, consultaConfiguracion): any {
    let headerPage;
    if (tipoLista == 'puntuacion') {
      headerPage = page * 48;
      worksheet = this.reportHeaderRowSizePuntuacion(worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.reportHeaderPuntuacion(workbook, worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.pageHeaderDataPuntuacion(worksheet, headerPage, subcomision, list[this.headerIndex]);
      worksheet = this.reportBodyRowSizePuntuacion(worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.reportFooterPuntuacion(workbook, worksheet, headerPage, list[this.headerIndex], consultaConfiguracion);
      worksheet = this.reportBodyDataPuntuacion(tipoLista, workbook, list, worksheet, headerPage, subcomision, page, list[this.headerIndex], consultaConfiguracion);
    } else {
      headerPage = page * 49
      worksheet = this.reportHeaderRowSizeCronologico(worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.reportHeaderCronologico(workbook, worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.pageHeaderDataCronologico(worksheet, headerPage, subcomision, list[this.headerIndex]);
      worksheet = this.reportBodyRowSizeCronologico(worksheet, headerPage, list[this.headerIndex]);
      worksheet = this.reportFooterCronologico(workbook, worksheet, headerPage, list[this.headerIndex], consultaConfiguracion);
      worksheet = this.reportBodyDataCronologico(tipoLista, workbook, list, worksheet, headerPage, subcomision, page, list[this.headerIndex], consultaConfiguracion);
    }
    return worksheet;
  }

  reportColumnSizePuntuacion(worksheet): any {
    const columnA = worksheet.getColumn('A'); columnA.width = 3.29;
    const columnB = worksheet.getColumn('B'); columnB.width = 29.14;
    const columnC = worksheet.getColumn('C'); columnC.width = 13.3;
    const columnD = worksheet.getColumn('D'); columnD.width = 2.81;
    const columnE = worksheet.getColumn('E'); columnE.width = 2.81;
    const columnF = worksheet.getColumn('F'); columnF.width = 2.81;
    const columnG = worksheet.getColumn('G'); columnG.width = 2.81;
    const columnH = worksheet.getColumn('H'); columnH.width = 4.3;
    const columnI = worksheet.getColumn('I'); columnI.width = 10.57;
    const columnJ = worksheet.getColumn('J'); columnJ.width = 11.86;
    const columnK = worksheet.getColumn('K'); columnK.width = 4.71;
    const columnL = worksheet.getColumn('L'); columnL.width = 3.14;
    const columnM = worksheet.getColumn('M'); columnM.width = 29.14;
    const columnN = worksheet.getColumn('N'); columnN.width = 13.3;
    const columnO = worksheet.getColumn('O'); columnO.width = 2.81;
    const columnP = worksheet.getColumn('P'); columnP.width = 2.81;
    const columnQ = worksheet.getColumn('Q'); columnQ.width = 2.81;
    const columnR = worksheet.getColumn('R'); columnR.width = 2.81;
    const columnS = worksheet.getColumn('S'); columnS.width = 4.3;
    const columnT = worksheet.getColumn('T'); columnT.width = 10.60;
    const columnU = worksheet.getColumn('U'); columnU.width = 11.90;

    return worksheet;
  }

  reportHeaderRowSizePuntuacion(worksheet, headerPage, list): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio])) {
      const row1 = worksheet.getRow(headerPage + 1); row1.height = 51;
      const row2 = worksheet.getRow(headerPage + 2); row2.height = 21;
      const row3 = worksheet.getRow(headerPage + 3); row3.height = 10.5;
      const row4 = worksheet.getRow(headerPage + 4); row4.height = 32.5;
      const row5 = worksheet.getRow(headerPage + 5); row5.height = 14.25;
      const row6 = worksheet.getRow(headerPage + 6); row6.height = 15;
    }

    return worksheet;
  }

  reportHeaderPuntuacion(workbook, worksheet, headerPage, list): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio])) {

      worksheet.pageSetup.printArea = `A1:U${headerPage + 48}`;

      const issste = workbook.addImage({
        filename: './src/img/issste-logo.png',
        extension: 'png',
      });

      const sntissste = workbook.addImage({
        filename: './src/img/sntissste-logo.png',
        extension: 'png',
      });

      worksheet.mergeCells(`A${headerPage + 1}:U${headerPage + 1}`);
      worksheet.getCell(`A${headerPage + 1}`).style = { font: { size: 12, bold: true, name: 'Montserrat' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 1}`).value = 'COMISIÓN NACIONAL MIXTA DE BOLSA DE TRABAJO';

      worksheet.mergeCells(`A${headerPage + 2}:U${headerPage + 2}`);
      worksheet.getCell(`A${headerPage + 2}`).style = { font: { size: 12, bold: true, name: 'Montserrat' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 2}`).value = 'REGISTRO DE CANDIDATOS TIPO PUNTUACIÓN';

      worksheet.mergeCells(`A${headerPage + 3}:U${headerPage + 3}`);
      worksheet.getCell(`A${headerPage + 3}`).border = {
        bottom: { style: 'medium', color: { argb: '000000' } },
      };

      worksheet.addImage(issste, `A${headerPage + 1}:B${headerPage + 3}`);

      worksheet.addImage(sntissste, `S${headerPage + 1}:U${headerPage + 3}`);
    }
    return worksheet;
  }

  pageHeaderDataPuntuacion(worksheet, headerPage, subcomision, element): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (element && (element.aspirantes.instituto[inicio] || element.aspirantes.sindicato[inicio])) {
      worksheet.mergeCells(`A${headerPage + 4}: C${headerPage + 4} `);
      worksheet.getCell(`A${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`A${headerPage + 4} `).value = 'SUBCOMISIÓN MIXTA DE BOLSA DE TRABAJO EN:';

      worksheet.mergeCells(`D${headerPage + 4}: H${headerPage + 4} `);
      worksheet.getCell(`D${headerPage + 4} `).style = { font: { size: 8, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`D${headerPage + 4} `).value = subcomision == 'DELEGACION' ? 'DELEGACIÓN ESTATAL SINALOA' : 'SINALOA';
      worksheet.getCell(`D${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
      worksheet.getCell(`E${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`I${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`I${headerPage + 4} `).value = 'REGIÓN:';

      worksheet.getCell(`J${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 4} `).value = element.zona;
      worksheet.getCell(`J${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.mergeCells(`K${headerPage + 4}: L${headerPage + 4} `);
      worksheet.getCell(`K${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`K${headerPage + 4} `).value = 'RAMA:';

      worksheet.getCell(`M${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`M${headerPage + 4} `).value = element.rama;
      worksheet.getCell(`M${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`N${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`N${headerPage + 4} `).value = 'PUESTO:';

      worksheet.mergeCells(`O${headerPage + 4}: U${headerPage + 4} `);
      worksheet.getCell(`O${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`O${headerPage + 4} `).value = element.puesto;
      worksheet.getCell(`O${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
      worksheet.getCell(`P${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`B${headerPage + 5} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'left' } };
      worksheet.getCell(`B${headerPage + 5} `).value = 'REFERENDO: ENERO 2020';

      worksheet.mergeCells(`A${headerPage + 6}: J${headerPage + 6} `);
      worksheet.getCell(`A${headerPage + 6} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 6} `).value = 'LISTADO INSTITUTO';

      worksheet.mergeCells(`L${headerPage + 6}: U${headerPage + 6} `);
      worksheet.getCell(`L${headerPage + 6} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`L${headerPage + 6} `).value = 'LISTADO SINDICATO';
    }
    return worksheet;
  }

  reportBodyRowSizePuntuacion(worksheet, headerPage, listByIndex): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (listByIndex && (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio])) {
      const row1 = worksheet.getRow(headerPage + 7); row1.height = 21.75;

      let row = [];
      for (let i = headerPage; i < headerPage + 30; i++) {
        row[i] = worksheet.getRow(8 + i); row[i].height = 10.6;
      }

      const row2 = worksheet.getRow(headerPage + 38); row2.height = 11.25;
      const row3 = worksheet.getRow(headerPage + 39); row3.height = 13.5;
      const row4 = worksheet.getRow(headerPage + 40); row4.height = 28.50;
      const row5 = worksheet.getRow(headerPage + 41); row5.height = 15;
      const row6 = worksheet.getRow(headerPage + 42); row6.height = 9.75;
      const row7 = worksheet.getRow(headerPage + 43); row7.height = 15;
      const row8 = worksheet.getRow(headerPage + 44); row8.height = 14.25;
      const row9 = worksheet.getRow(headerPage + 45); row9.height = 15;
      const row10 = worksheet.getRow(headerPage + 46); row10.height = 15;
      const row11 = worksheet.getRow(headerPage + 47); row11.height = 9.75;
      const row12 = worksheet.getRow(headerPage + 48); row12.height = 15;
    }
    return worksheet;
  }

  reportBodyDataPuntuacion(tipoLista, workbook, list, worksheet, headerPage, subcomision, page, listByIndex, consultaConfiguracion): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (listByIndex && (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio])) {

      worksheet.getCell(`A${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`A${headerPage + 7} `).value = 'No.';

      worksheet.getCell(`B${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`B${headerPage + 7} `).value = 'NOMBRE';

      worksheet.getCell(`C${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`C${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`C${headerPage + 7} `).value = 'NIVEL MAXIMO DE ESTUDIOS';

      worksheet.getCell(`D${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`D${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`D${headerPage + 7} `).value = 'E';

      worksheet.getCell(`E${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`E${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`E${headerPage + 7} `).value = 'P';

      worksheet.getCell(`F${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`F${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`F${headerPage + 7} `).value = 'TS';

      worksheet.getCell(`G${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`G${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`G${headerPage + 7} `).value = 'TR';

      worksheet.getCell(`H${headerPage + 7} `).style = { font: { size: 5, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`H${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`H${headerPage + 7} `).value = 'TOTAL';

      worksheet.getCell(`I${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`I${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`I${headerPage + 7} `).value = 'NOMICACIÓN';

      worksheet.getCell(`J${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`J${headerPage + 7} `).value = 'MOTIVO BAJA';

      //
      worksheet.getCell(`L${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`L${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`L${headerPage + 7} `).value = 'No.';

      worksheet.getCell(`M${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`M${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`M${headerPage + 7} `).value = 'NOMBRE';

      worksheet.getCell(`N${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`N${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`N${headerPage + 7} `).value = 'NIVEL MAXIMO DE ESTUDIOS';

      worksheet.getCell(`O${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`O${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`O${headerPage + 7} `).value = 'E';

      worksheet.getCell(`P${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`P${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`P${headerPage + 7} `).value = 'P';

      worksheet.getCell(`Q${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`Q${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`Q${headerPage + 7} `).value = 'TS';

      worksheet.getCell(`R${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`R${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`R${headerPage + 7} `).value = 'TR';

      worksheet.getCell(`S${headerPage + 7} `).style = { font: { size: 5, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`S${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`S${headerPage + 7} `).value = 'TOTAL';

      worksheet.getCell(`T${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`T${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`T${headerPage + 7} `).value = 'NOMICACIÓN';

      worksheet.getCell(`U${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`U${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`U${headerPage + 7} `).value = 'MOTIVO BAJA';

      for (let i = 0; i < 30; i++) {
        worksheet.getCell(`A${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`A${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`B${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`B${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`C${headerPage + (8 + i)} `).style = { font: { size: 6.5, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`C${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`D${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`D${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`E${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`E${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`F${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`F${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`G${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`G${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`H${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`H${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`I${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`I${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`J${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`J${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`A${headerPage + (8 + i)} `).value = inicio + i + 1;

        if (listByIndex.aspirantes.instituto[inicio + i]) {
          worksheet.getCell(`B${headerPage + (8 + i)} `).value = `${listByIndex.aspirantes.instituto[inicio + i].nombre} ${listByIndex.aspirantes.instituto[inicio + i].apellidoPaterno} ${listByIndex.aspirantes.instituto[inicio + i].apellidoMaterno} `;
          worksheet.getCell(`C${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].estudios.nombre;
          worksheet.getCell(`D${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].puntaje.escolaridad;
          worksheet.getCell(`E${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].puntaje.parentesco;
          worksheet.getCell(`F${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].puntaje.tiempoServicio;
          worksheet.getCell(`G${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].puntaje.tiempoRegistro;
          worksheet.getCell(`H${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].puntaje.total;
          worksheet.getCell(`I${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].nominacion;
          worksheet.getCell(`J${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].motivo_baja;
        }

      }

      for (let i = 0; i < 30; i++) {
        worksheet.getCell(`L${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`L${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`M${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`M${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`N${headerPage + (8 + i)} `).style = { font: { size: 6.5, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`N${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`O${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`O${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`P${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`P${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`Q${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`Q${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`R${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`R${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`S${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`S${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`T${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`T${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`U${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`U${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`L${headerPage + (8 + i)} `).value = inicio + i + 1;

        if (listByIndex.aspirantes.sindicato[inicio + i]) {
          worksheet.getCell(`M${headerPage + (8 + i)} `).value = `${listByIndex.aspirantes.sindicato[inicio + i].nombre} ${listByIndex.aspirantes.sindicato[inicio + i].apellidoPaterno} ${listByIndex.aspirantes.sindicato[inicio + i].apellidoMaterno} `;
          worksheet.getCell(`N${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].estudios.nombre;
          worksheet.getCell(`O${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].puntaje.escolaridad;
          worksheet.getCell(`P${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].puntaje.parentesco;
          worksheet.getCell(`Q${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].puntaje.tiempoServicio;
          worksheet.getCell(`R${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].puntaje.tiempoRegistro;
          worksheet.getCell(`S${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].puntaje.total;
          worksheet.getCell(`T${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].nominacion;
          worksheet.getCell(`U${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].motivo_baja;
        }

      }

    }

    let newPage = page;
    if (listByIndex) {
      if (this.bodyIndex < Math.floor(listByIndex.aspirantes.instituto.length / 30) || this.bodyIndex < Math.floor(listByIndex.aspirantes.sindicato.length / 30)) {
        this.bodyIndex++;
      } else {
        this.bodyIndex = 0;
        this.headerIndex++;
      }

      if (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio]) {
        newPage = newPage + 1;
      }
      this.genExcelContent(tipoLista, workbook, list, worksheet, subcomision, newPage, consultaConfiguracion);
    }

    return worksheet;
  }

  reportFooterPuntuacion(workbook, worksheet, headerPage, list, consultaConfiguracion): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio]) && consultaConfiguracion) {

      worksheet.mergeCells(`A${headerPage + 38}: M${headerPage + 38} `);
      worksheet.getCell(`A${headerPage + 38} `).style = { font: { size: 6, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'left' } };
      worksheet.getCell(`A${headerPage + 38} `).value = 'E = ESCOLARIDAD                         P = PARENTESCO                         TS = TIEMPO DE SERVICIO EN BOLSA DE TRABAJO                         TR = TIEMPO DE REGISTRO EN BOLSA DE TRABAJO';

      worksheet.mergeCells(`B${headerPage + 39}: F${headerPage + 39} `);
      worksheet.getCell(`B${headerPage + 39} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 39} `).value = 'INSTITUTO';

      worksheet.mergeCells(`J${headerPage + 39}: M${headerPage + 39} `);
      worksheet.getCell(`J${headerPage + 39} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 39} `).value = 'INTEGRANTES DE LA SUBCOMISIÓN';

      worksheet.mergeCells(`N${headerPage + 39}: U${headerPage + 39} `);
      worksheet.getCell(`N${headerPage + 39} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`N${headerPage + 39} `).value = 'SINDICATO';

      // Firmas
      worksheet.mergeCells(`B${headerPage + 41}: F${headerPage + 41} `);
      worksheet.getCell(`B${headerPage + 41}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`N${headerPage + 41}: U${headerPage + 41} `);
      worksheet.getCell(`N${headerPage + 41}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`B${headerPage + 42}: F${headerPage + 42} `);
      worksheet.getCell(`B${headerPage + 42} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 42} `).value = consultaConfiguracion[0] && consultaConfiguracion[0].nombre ? consultaConfiguracion[0].nombre : '';

      worksheet.mergeCells(`N${headerPage + 42}: U${headerPage + 42} `);
      worksheet.getCell(`N${headerPage + 42} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`N${headerPage + 42} `).value = consultaConfiguracion[3] && consultaConfiguracion[3].nombre ? consultaConfiguracion[3].nombre : '';

      worksheet.mergeCells(`B${headerPage + 43}: F${headerPage + 43} `);
      worksheet.getCell(`B${headerPage + 43} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 43} `).value = consultaConfiguracion[0] && consultaConfiguracion[0].puesto ? consultaConfiguracion[0].puesto : '';

      worksheet.mergeCells(`N${headerPage + 43}: U${headerPage + 43} `);
      worksheet.getCell(`N${headerPage + 43} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`N${headerPage + 43} `).value = consultaConfiguracion[3] && consultaConfiguracion[3].puesto ? consultaConfiguracion[3].puesto : '';

      worksheet.mergeCells(`B${headerPage + 46}: F${headerPage + 46} `);
      worksheet.getCell(`B${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`I${headerPage + 46}: M${headerPage + 46} `);
      worksheet.getCell(`I${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`N${headerPage + 46}: U${headerPage + 46} `);
      worksheet.getCell(`N${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`B${headerPage + 47}: F${headerPage + 47} `);
      worksheet.getCell(`B${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 47} `).value = consultaConfiguracion[1] && consultaConfiguracion[1].nombre ? consultaConfiguracion[1].nombre : '';

      worksheet.mergeCells(`I${headerPage + 47}: M${headerPage + 47} `);
      worksheet.getCell(`I${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`I${headerPage + 47} `).value = consultaConfiguracion[2] && consultaConfiguracion[2].nombre ? consultaConfiguracion[2].nombre : '';

      worksheet.mergeCells(`N${headerPage + 47}: U${headerPage + 47} `);
      worksheet.getCell(`N${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`N${headerPage + 47} `).value = consultaConfiguracion[4] && consultaConfiguracion[4].nombre ? consultaConfiguracion[4].nombre : '';

      worksheet.mergeCells(`B${headerPage + 48}: F${headerPage + 48} `);
      worksheet.getCell(`B${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 48} `).value = consultaConfiguracion[1] && consultaConfiguracion[1].puesto ? consultaConfiguracion[1].puesto : '';

      worksheet.mergeCells(`I${headerPage + 48}: M${headerPage + 48} `);
      worksheet.getCell(`I${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`I${headerPage + 48} `).value = consultaConfiguracion[2] && consultaConfiguracion[2].puesto ? consultaConfiguracion[2].puesto : '';

      worksheet.mergeCells(`N${headerPage + 48}: U${headerPage + 48} `);
      worksheet.getCell(`N${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`N${headerPage + 48} `).value = consultaConfiguracion[4] && consultaConfiguracion[4].puesto ? consultaConfiguracion[4].puesto : '';
    }
    return worksheet;
  }

  reportColumnSizeCronologico(worksheet): any {
    const columnA = worksheet.getColumn('A'); columnA.width = 3.29;
    const columnB = worksheet.getColumn('B'); columnB.width = 35.43;
    const columnC = worksheet.getColumn('C'); columnC.width = 12.14;
    const columnD = worksheet.getColumn('D'); columnD.width = 11;
    const columnE = worksheet.getColumn('E'); columnE.width = 11;
    const columnF = worksheet.getColumn('F'); columnF.width = 12.14;
    const columnG = worksheet.getColumn('G'); columnG.width = 4.71;
    const columnH = worksheet.getColumn('H'); columnH.width = 3.14;
    const columnI = worksheet.getColumn('I'); columnI.width = 35.43;
    const columnJ = worksheet.getColumn('J'); columnJ.width = 12.14;
    const columnK = worksheet.getColumn('K'); columnK.width = 11;
    const columnL = worksheet.getColumn('L'); columnL.width = 11;
    const columnM = worksheet.getColumn('M'); columnM.width = 11;

    return worksheet;
  }

  reportHeaderRowSizeCronologico(worksheet, headerPage, list): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio])) {
      const row1 = worksheet.getRow(headerPage + 1); row1.height = 51;
      const row2 = worksheet.getRow(headerPage + 2); row2.height = 21;
      const row3 = worksheet.getRow(headerPage + 3); row3.height = 10.5;
      const row4 = worksheet.getRow(headerPage + 4); row4.height = 32.5;
      const row5 = worksheet.getRow(headerPage + 5); row5.height = 14.25;
      const row6 = worksheet.getRow(headerPage + 6); row6.height = 15;
    }

    return worksheet;
  }

  reportHeaderCronologico(workbook, worksheet, headerPage, list): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio])) {

      worksheet.pageSetup.printArea = `A1:M${headerPage + 49}`;

      const issste = workbook.addImage({
        filename: './src/img/issste-logo.png',
        extension: 'png',
      });

      const sntissste = workbook.addImage({
        filename: './src/img/sntissste-logo.png',
        extension: 'png',
      });

      worksheet.mergeCells(`A${headerPage + 1}:M${headerPage + 1}`);
      worksheet.getCell(`A${headerPage + 1}`).style = { font: { size: 12, bold: true, name: 'Montserrat' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 1}`).value = 'COMISIÓN NACIONAL MIXTA DE BOLSA DE TRABAJO';

      worksheet.mergeCells(`A${headerPage + 2}:M${headerPage + 2}`);
      worksheet.getCell(`A${headerPage + 2}`).style = { font: { size: 12, bold: true, name: 'Montserrat' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 2}`).value = 'REGISTRO DE CANDIDATOS TIPO CRONOLÓGICO';

      worksheet.mergeCells(`A${headerPage + 3}:M${headerPage + 3}`);
      worksheet.getCell(`A${headerPage + 3}`).border = {
        bottom: { style: 'medium', color: { argb: '000000' } },
      };

      worksheet.addImage(issste, `A${headerPage + 1}:B${headerPage + 3}`);

      worksheet.addImage(sntissste, `K${headerPage + 1}:M${headerPage + 3}`);
    }
    return worksheet;
  }

  pageHeaderDataCronologico(worksheet, headerPage, subcomision, element): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (element && (element.aspirantes.instituto[inicio] || element.aspirantes.sindicato[inicio])) {
      worksheet.mergeCells(`A${headerPage + 4}: B${headerPage + 4} `);
      worksheet.getCell(`A${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`A${headerPage + 4} `).value = 'SUBCOMISIÓN MIXTA DE BOLSA DE TRABAJO EN:';

      worksheet.mergeCells(`C${headerPage + 4}: D${headerPage + 4} `);
      worksheet.getCell(`C${headerPage + 4} `).style = { font: { size: 8, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`C${headerPage + 4} `).value = subcomision == 'DELEGACION' ? 'DELEGACIÓN ESTATAL SINALOA' : 'SINALOA';
      worksheet.getCell(`C${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
      worksheet.getCell(`D${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`E${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`E${headerPage + 4} `).value = 'REGIÓN:';

      worksheet.getCell(`F${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`F${headerPage + 4} `).value = element.zona;
      worksheet.getCell(`F${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.mergeCells(`G${headerPage + 4}: H${headerPage + 4} `);
      worksheet.getCell(`G${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`G${headerPage + 4} `).value = 'RAMA:';

      worksheet.getCell(`I${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`I${headerPage + 4} `).value = element.rama;
      worksheet.getCell(`I${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`J${headerPage + 4} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
      worksheet.getCell(`J${headerPage + 4} `).value = 'PUESTO:';

      worksheet.mergeCells(`K${headerPage + 4}: M${headerPage + 4} `);
      worksheet.getCell(`K${headerPage + 4} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`K${headerPage + 4} `).value = element.puesto;
      worksheet.getCell(`K${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
      worksheet.getCell(`L${headerPage + 4} `).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

      worksheet.getCell(`B${headerPage + 5} `).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'left' } };
      worksheet.getCell(`B${headerPage + 5} `).value = 'REFERENDO: ENERO 2020';

      worksheet.mergeCells(`A${headerPage + 6}: F${headerPage + 6} `);
      worksheet.getCell(`A${headerPage + 6} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 6} `).value = 'LISTADO INSTITUTO';

      worksheet.mergeCells(`H${headerPage + 6}: M${headerPage + 6} `);
      worksheet.getCell(`H${headerPage + 6} `).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`H${headerPage + 6} `).value = 'LISTADO SINDICATO';
    }
    return worksheet;
  }

  reportBodyRowSizeCronologico(worksheet, headerPage, listByIndex): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (listByIndex && (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio])) {
      const row1 = worksheet.getRow(headerPage + 7); row1.height = 21.75;

      let row = [];
      for (let i = headerPage; i < headerPage + 30; i++) {
        row[i] = worksheet.getRow(8 + i); row[i].height = 10.5;
      }

      const row2 = worksheet.getRow(headerPage + 38); row2.height = 13.5;
      const row3 = worksheet.getRow(headerPage + 39); row3.height = 15.75;
      const row4 = worksheet.getRow(headerPage + 40); row4.height = 14.3;
      const row5 = worksheet.getRow(headerPage + 41); row5.height = 14.3;
      const row6 = worksheet.getRow(headerPage + 42); row6.height = 14.3;
      const row7 = worksheet.getRow(headerPage + 43); row7.height = 14.3;
      const row8 = worksheet.getRow(headerPage + 44); row8.height = 14.3;
      const row9 = worksheet.getRow(headerPage + 45); row9.height = 14.3;
      const row10 = worksheet.getRow(headerPage + 46); row10.height = 14.3;
      const row11 = worksheet.getRow(headerPage + 47); row11.height = 14.3;
      const row12 = worksheet.getRow(headerPage + 48); row12.height = 14.3;
      const row13 = worksheet.getRow(headerPage + 49); row13.height = 14.3;
    }
    return worksheet;
  }

  reportBodyDataCronologico(tipoLista, workbook, list, worksheet, headerPage, subcomision, page, listByIndex, consultaConfiguracion): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (listByIndex && (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio])) {

      worksheet.getCell(`A${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`A${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`A${headerPage + 7} `).value = 'No.';

      worksheet.getCell(`B${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`B${headerPage + 7} `).value = 'NOMBRE';

      worksheet.getCell(`C${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`C${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`C${headerPage + 7} `).value = 'NIVEL MAXIMO DE ESTUDIOS';

      worksheet.getCell(`D${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`D${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`D${headerPage + 7} `).value = 'FECHA DE REGISTRO';

      worksheet.getCell(`E${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`E${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`E${headerPage + 7} `).value = 'NOMINACIÓN';

      worksheet.getCell(`F${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`F${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`F${headerPage + 7} `).value = 'MOTIVO BAJA';

      //
      worksheet.getCell(`H${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`H${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`H${headerPage + 7} `).value = 'No.';

      worksheet.getCell(`I${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`I${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`I${headerPage + 7} `).value = 'NOMBRE';

      worksheet.getCell(`J${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
      worksheet.getCell(`J${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`J${headerPage + 7} `).value = 'NIVEL MAXIMO DE ESTUDIOS';

      worksheet.getCell(`K${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`K${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`K${headerPage + 7} `).value = 'FECHA DE REGISTRO';

      worksheet.getCell(`L${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`L${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`L${headerPage + 7} `).value = 'NOMINACIÓN';

      worksheet.getCell(`M${headerPage + 7} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`M${headerPage + 7} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
      worksheet.getCell(`M${headerPage + 7} `).value = 'MOTIVO BAJA';

      for (let i = 0; i < 30; i++) {
        worksheet.getCell(`A${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`A${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`B${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`B${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`C${headerPage + (8 + i)} `).style = { font: { size: 6.5, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`C${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`D${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`D${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`E${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`E${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`F${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`F${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`A${headerPage + (8 + i)} `).value = inicio + i + 1;

        if (listByIndex.aspirantes.instituto[inicio + i]) {
          worksheet.getCell(`B${headerPage + (8 + i)} `).value = `${listByIndex.aspirantes.instituto[inicio + i].nombre} ${listByIndex.aspirantes.instituto[inicio + i].apellidoPaterno} ${listByIndex.aspirantes.instituto[inicio + i].apellidoMaterno} `;
          worksheet.getCell(`C${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].estudios.nombre;
          worksheet.getCell(`D${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].fecha;
          worksheet.getCell(`E${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].nominacion;
          worksheet.getCell(`F${headerPage + (8 + i)} `).value = listByIndex.aspirantes.instituto[inicio + i].motivo_baja;
        }

      }

      for (let i = 0; i < 30; i++) {
        worksheet.getCell(`H${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`H${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`I${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`I${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`J${headerPage + (8 + i)} `).style = { font: { size: 6.5, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
        worksheet.getCell(`J${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`K${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`K${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`L${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`L${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`M${headerPage + (8 + i)} `).style = { font: { size: 7, name: 'Montserrat' }, alignment: { vertical: 'middle', horizontal: 'center' } };
        worksheet.getCell(`M${headerPage + (8 + i)} `).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };

        worksheet.getCell(`H${headerPage + (8 + i)} `).value = inicio + i + 1;

        if (listByIndex.aspirantes.sindicato[inicio + i]) {
          worksheet.getCell(`I${headerPage + (8 + i)} `).value = `${listByIndex.aspirantes.sindicato[inicio + i].nombre} ${listByIndex.aspirantes.sindicato[inicio + i].apellidoPaterno} ${listByIndex.aspirantes.sindicato[inicio + i].apellidoMaterno} `;
          worksheet.getCell(`J${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].estudios.nombre;
          worksheet.getCell(`K${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].fecha;
          worksheet.getCell(`L${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].nominacion;
          worksheet.getCell(`M${headerPage + (8 + i)} `).value = listByIndex.aspirantes.sindicato[inicio + i].motivo_baja;
        }

      }

    }

    let newPage = page;
    if (listByIndex) {
      if (this.bodyIndex < Math.floor(listByIndex.aspirantes.instituto.length / 30) || this.bodyIndex < Math.floor(listByIndex.aspirantes.sindicato.length / 30)) {
        this.bodyIndex++;
      } else {
        this.bodyIndex = 0;
        this.headerIndex++;
      }

      if (listByIndex.aspirantes.instituto[inicio] || listByIndex.aspirantes.sindicato[inicio]) {
        newPage = newPage + 1;
      }
      this.genExcelContent(tipoLista, workbook, list, worksheet, subcomision, newPage, consultaConfiguracion);
    }

    return worksheet;
  }

  reportFooterCronologico(workbook, worksheet, headerPage, list, consultaConfiguracion): any {
    let inicio = this.bodyIndex == 0 ? 0 : this.bodyIndex * 30;
    if (list && (list.aspirantes.instituto[inicio] || list.aspirantes.sindicato[inicio]) && consultaConfiguracion) {

      worksheet.mergeCells(`B${headerPage + 39}: C${headerPage + 39} `);
      worksheet.getCell(`B${headerPage + 39} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 39} `).value = 'REPRESENTANTE POR AUTORIDAD';

      worksheet.mergeCells(`J${headerPage + 39}: M${headerPage + 39} `);
      worksheet.getCell(`J${headerPage + 39} `).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 39} `).value = 'REPRESENTANTES POR SINDICATO';

      // Firmas
      worksheet.mergeCells(`B${headerPage + 41}: C${headerPage + 41} `);
      worksheet.getCell(`B${headerPage + 41}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`J${headerPage + 41}: M${headerPage + 41} `);
      worksheet.getCell(`J${headerPage + 41}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`B${headerPage + 42}: C${headerPage + 42} `);
      worksheet.getCell(`B${headerPage + 42} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 42} `).value = consultaConfiguracion[0] && consultaConfiguracion[0].nombre ? consultaConfiguracion[0].nombre : '';

      worksheet.mergeCells(`J${headerPage + 42}: M${headerPage + 42} `);
      worksheet.getCell(`J${headerPage + 42} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 42} `).value = consultaConfiguracion[3] && consultaConfiguracion[3].nombre ? consultaConfiguracion[3].nombre : '';

      worksheet.mergeCells(`B${headerPage + 43}: C${headerPage + 43} `);
      worksheet.getCell(`B${headerPage + 43} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 43} `).value = consultaConfiguracion[0].puesto || '';

      worksheet.mergeCells(`J${headerPage + 43}: M${headerPage + 43} `);
      worksheet.getCell(`J${headerPage + 43} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 43} `).value = consultaConfiguracion[3].puesto || '';

      worksheet.mergeCells(`B${headerPage + 46}: C${headerPage + 46} `);
      worksheet.getCell(`B${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`D${headerPage + 46}: I${headerPage + 46} `);
      worksheet.getCell(`D${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`J${headerPage + 46}: M${headerPage + 46} `);
      worksheet.getCell(`J${headerPage + 46}`).border = { bottom: { style: 'thin' } };

      worksheet.mergeCells(`B${headerPage + 47}: C${headerPage + 47} `);
      worksheet.getCell(`B${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 47} `).value = consultaConfiguracion[1].nombre || '';

      worksheet.mergeCells(`D${headerPage + 47}: I${headerPage + 47} `);
      worksheet.getCell(`D${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`D${headerPage + 47} `).value = consultaConfiguracion[2].nombre || '';

      worksheet.mergeCells(`J${headerPage + 47}: M${headerPage + 47} `);
      worksheet.getCell(`J${headerPage + 47} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 47} `).value = consultaConfiguracion[4].nombre || '';

      worksheet.mergeCells(`B${headerPage + 48}: C${headerPage + 48} `);
      worksheet.getCell(`B${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`B${headerPage + 48} `).value = consultaConfiguracion[1].puesto || '';

      worksheet.mergeCells(`D${headerPage + 48}: I${headerPage + 48} `);
      worksheet.getCell(`D${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`D${headerPage + 48} `).value = consultaConfiguracion[2].puesto || '';

      worksheet.mergeCells(`J${headerPage + 48}: M${headerPage + 48} `);
      worksheet.getCell(`J${headerPage + 48} `).style = { font: { size: 6, name: 'Calibri' }, alignment: { vertical: 'top', horizontal: 'center' } };
      worksheet.getCell(`J${headerPage + 48} `).value = consultaConfiguracion[4].puesto || '';
    }
    return worksheet;
  }

}
