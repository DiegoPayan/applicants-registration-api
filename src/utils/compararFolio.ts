export const compararFolios = (folio1, folio2) => {
  //Retorna true si el primero es mayor
  let response = false;

  let splittedFolio1 = folio1.split('/');
  let splittedFolio2 = folio2.split('/');

  if (parseInt(splittedFolio1[0]) > parseInt(splittedFolio2[0])) {
    response = true;
  } else if (parseInt(splittedFolio1[0]) == parseInt(splittedFolio2[0])) {
    if (parseInt(splittedFolio1[1]) > parseInt(splittedFolio2[1])) {
      response = true;
    }
  }
  return response;
}