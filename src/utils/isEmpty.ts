
export const isObjectEmpty = (data) => {
  if (typeof data == 'object') {
    return (Object.keys(data).length == 0);
  }
  return true;
}