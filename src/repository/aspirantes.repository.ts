import { getManager, Like } from 'typeorm';
import { Aspirantes } from '../entity/aspirantes.entity';
import { AspirantesJoin } from '../entity/aspirantesJoin.entity';
import { Puntaje } from '../entity/puntaje.entity';
import { Rama } from '../entity/rama.entity';
import { Zona } from '../entity/zona.entity';
import { Puesto } from '../entity/puesto.entity';
import { Response } from '../dto/response.dto';

import { isObjectEmpty } from '../utils/isEmpty';
import { compararFolios } from '../utils/compararFolio';

import { Workbook, Row, Cell, Worksheet } from 'exceljs';

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
            let resultadoAspirantes = await getManager().getRepository(AspirantesJoin).find({ where: { idZona, idRama, idPuesto, listado, subcomision }, relations: ['puntaje'] });
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

    if (tipoLista == 'cronologico') {
      datosAspirantes[0].aspirantes.instituto.sort((aspirante1, aspirante2) => {
        if (aspirante1.fecha < aspirante2.fecha) return -1;
        if (aspirante1.fecha > aspirante2.fecha) return 1;

        if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
        if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

        if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
        if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
      });

      datosAspirantes[0].aspirantes.sindicato.sort((aspirante1, aspirante2) => {
        if (aspirante1.fecha < aspirante2.fecha) return -1;
        if (aspirante1.fecha > aspirante2.fecha) return 1;

        if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
        if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

        if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
        if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
      });
    } else if (tipoLista == 'puntuacion') {
      datosAspirantes[0].aspirantes.instituto.sort((aspirante1, aspirante2) => {
        if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
        if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

        if (aspirante1.fecha < aspirante2.fecha) return -1;
        if (aspirante1.fecha > aspirante2.fecha) return 1;

        if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
        if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
      });

      datosAspirantes[0].aspirantes.sindicato.sort((aspirante1, aspirante2) => {
        if (aspirante1.puntaje.total > aspirante2.puntaje.total) return -1;
        if (aspirante1.puntaje.total < aspirante2.puntaje.total) return 1;

        if (aspirante1.fecha < aspirante2.fecha) return -1;
        if (aspirante1.fecha > aspirante2.fecha) return 1;

        if (compararFolios(aspirante1.folio, aspirante2.folio)) return -1;
        if (!compararFolios(aspirante1.folio, aspirante2.folio)) return 1;
      });
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

  async downloadExcel(tipoLista, subcomision): Promise<any> {
    let list = await this.createList(tipoLista, subcomision);
    if (subcomision == 'HOSPITAL REGIONAL') subcomision = 'HR';

    var workbook = new Workbook();
    let worksheet = workbook.addWorksheet(`FORMATO ${tipoLista.toUpperCase()} ${subcomision.toUpperCase()}`, {
      pageSetup: { paperSize: 5, orientation: 'landscape', scale: 88 },
      headerFooter: { firstHeader: "Hello Exceljs", firstFooter: "Hello World" },
      views: [{ state: 'normal', style: 'pageBreakPreview', zoomScale: 98, zoomScaleNormal: 98 }]
    });

    worksheet.pageSetup.margins = {
      left: 0.3, right: 0.3,
      top: 0.3, bottom: 0.6,
      header: 0.3, footer: 0.3
    };

    worksheet = this.reportColumnSize(worksheet);

    list.forEach((element, index) => {
      let headerPage = index * 48;
      worksheet = this.reportHeaderRowSize(worksheet, headerPage);
      worksheet = this.reportHeader(worksheet, headerPage);
      worksheet = this.pageHeaderData(worksheet, headerPage, subcomision, element);
      worksheet = this.reportBodyRowSize(worksheet, headerPage);
      worksheet = this.reportBodyData(worksheet, headerPage);
    });

    return workbook;
  }

  reportColumnSize(worksheet): any {
    const columnA = worksheet.getColumn('A'); columnA.width = 3.29;
    const columnB = worksheet.getColumn('B'); columnB.width = 29.14;
    const columnC = worksheet.getColumn('C'); columnC.width = 12.80;
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
    const columnN = worksheet.getColumn('N'); columnN.width = 12.80;
    const columnO = worksheet.getColumn('O'); columnO.width = 2.81;
    const columnP = worksheet.getColumn('P'); columnP.width = 2.81;
    const columnQ = worksheet.getColumn('Q'); columnQ.width = 2.81;
    const columnR = worksheet.getColumn('R'); columnR.width = 2.81;
    const columnS = worksheet.getColumn('S'); columnS.width = 4.3;
    const columnT = worksheet.getColumn('T'); columnT.width = 10.60;
    const columnU = worksheet.getColumn('U'); columnU.width = 11.90;

    return worksheet;
  }

  reportHeaderRowSize(worksheet, headerPage): any {
    const row1 = worksheet.getRow(headerPage + 1); row1.height = 51;
    const row2 = worksheet.getRow(headerPage + 2); row2.height = 21;
    const row3 = worksheet.getRow(headerPage + 3); row3.height = 10.5;
    const row4 = worksheet.getRow(headerPage + 4); row4.height = 32.5;
    const row5 = worksheet.getRow(headerPage + 5); row5.height = 14.25;
    const row6 = worksheet.getRow(headerPage + 6); row6.height = 15;

    return worksheet;
  }

  reportHeader(worksheet, headerPage): any {

    worksheet.pageSetup.printArea = `A1:U${headerPage + 48}`;

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

    return worksheet;
  }

  pageHeaderData(worksheet, headerPage, subcomision, element): any {
    worksheet.mergeCells(`A${headerPage + 4}:C${headerPage + 4}`);
    worksheet.getCell(`A${headerPage + 4}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
    worksheet.getCell(`A${headerPage + 4}`).value = 'SUBCOMISIÓN MIXTA DE BOLSA DE TRABAJO EN:';

    worksheet.mergeCells(`D${headerPage + 4}:H${headerPage + 4}`);
    worksheet.getCell(`D${headerPage + 4}`).style = { font: { size: 8, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
    worksheet.getCell(`D${headerPage + 4}`).value = subcomision == 'DELEGACION' ? 'DELEGACIÓN ESTATAL SINALOA' : 'SINALOA';
    worksheet.getCell(`D${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
    worksheet.getCell(`E${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

    worksheet.getCell(`I${headerPage + 4}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
    worksheet.getCell(`I${headerPage + 4}`).value = 'REGIÓN:';

    worksheet.getCell(`J${headerPage + 4}`).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.getCell(`J${headerPage + 4}`).value = element.zona;
    worksheet.getCell(`J${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

    worksheet.mergeCells(`K${headerPage + 4}:L${headerPage + 4}`);
    worksheet.getCell(`K${headerPage + 4}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
    worksheet.getCell(`K${headerPage + 4}`).value = 'RAMA:';

    worksheet.getCell(`M${headerPage + 4}`).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.getCell(`M${headerPage + 4}`).value = element.rama;
    worksheet.getCell(`M${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

    worksheet.getCell(`N${headerPage + 4}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'right' } };
    worksheet.getCell(`N${headerPage + 4}`).value = 'PUESTO:';

    worksheet.mergeCells(`O${headerPage + 4}:U${headerPage + 4}`);
    worksheet.getCell(`O${headerPage + 4}`).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.getCell(`O${headerPage + 4}`).value = element.puesto;
    worksheet.getCell(`O${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };
    worksheet.getCell(`P${headerPage + 4}`).border = { bottom: { style: 'thin', color: { argb: '000000' } } };

    worksheet.getCell(`B${headerPage + 5}`).style = { font: { size: 9, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'bottom', horizontal: 'left' } };
    worksheet.getCell(`B${headerPage + 5}`).value = 'REFERENDO: ENERO 2020';

    worksheet.mergeCells(`A${headerPage + 6}:J${headerPage + 6}`);
    worksheet.getCell(`A${headerPage + 6}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`A${headerPage + 6}`).value = 'LISTADO INSTITUTO';

    worksheet.mergeCells(`L${headerPage + 6}:U${headerPage + 6}`);
    worksheet.getCell(`L${headerPage + 6}`).style = { font: { size: 9, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`L${headerPage + 6}`).value = 'LISTADO SINDICATO';

    return worksheet;
  }

  reportBodyRowSize(worksheet, headerPage): any {

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

    return worksheet;
  }

  reportBodyData(worksheet, headerPage): any {

    worksheet.getCell(`A${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`A${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`A${headerPage + 7}`).value = 'No.';

    worksheet.getCell(`B${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`B${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`B${headerPage + 7}`).value = 'NOMBRE';

    worksheet.getCell(`C${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
    worksheet.getCell(`C${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`C${headerPage + 7}`).value = 'NIVEL MAXIMO DE ESTUDIOS';

    worksheet.getCell(`D${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`D${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`D${headerPage + 7}`).value = 'E';

    worksheet.getCell(`E${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`E${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`E${headerPage + 7}`).value = 'P';

    worksheet.getCell(`F${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`F${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`F${headerPage + 7}`).value = 'TS';

    worksheet.getCell(`G${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`G${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`G${headerPage + 7}`).value = 'TR';

    worksheet.getCell(`H${headerPage + 7}`).style = { font: { size: 5, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
    worksheet.getCell(`H${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`H${headerPage + 7}`).value = 'TOTAL';

    worksheet.getCell(`I${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`I${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`I${headerPage + 7}`).value = 'NOMICACIÓN';

    worksheet.getCell(`J${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`J${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`J${headerPage + 7}`).value = 'MOTIVO BAJA';

    //
    worksheet.getCell(`L${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`L${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`L${headerPage + 7}`).value = 'No.';

    worksheet.getCell(`M${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`M${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`M${headerPage + 7}`).value = 'NOMBRE';

    worksheet.getCell(`N${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
    worksheet.getCell(`N${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`N${headerPage + 7}`).value = 'NIVEL MAXIMO DE ESTUDIOS';

    worksheet.getCell(`O${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`O${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`O${headerPage + 7}`).value = 'E';

    worksheet.getCell(`P${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`P${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`P${headerPage + 7}`).value = 'P';

    worksheet.getCell(`Q${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`Q${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`Q${headerPage + 7}`).value = 'TS';

    worksheet.getCell(`R${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`R${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`R${headerPage + 7}`).value = 'TR';

    worksheet.getCell(`S${headerPage + 7}`).style = { font: { size: 5, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };
    worksheet.getCell(`S${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`S${headerPage + 7}`).value = 'TOTAL';

    worksheet.getCell(`T${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`T${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`T${headerPage + 7}`).value = 'NOMICACIÓN';

    worksheet.getCell(`U${headerPage + 7}`).style = { font: { size: 7, bold: true, name: 'Century Gothic' }, alignment: { vertical: 'middle', horizontal: 'center' } };
    worksheet.getCell(`U${headerPage + 7}`).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
    worksheet.getCell(`U${headerPage + 7}`).value = 'MOTIVO BAJA';

    return worksheet;
  }

}