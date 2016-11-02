function makeRows(items) {
  //  get total importance so we have a metric for the average row importance
  let totalImportance = 0;
  items.forEach((item)=>{
    totalImportance += item.importance;
  });

  //  for a square viewport, ideally a the square of the total importance will be the average importance of a row
  let averageRowImportance = Math.pow(totalImportance, 1/2)

  let currentRow = {
    importance : 0,
    height : 0,
    columns : []
  };

  let rows = [currentRow];
  items.forEach((item, index) => {
    
    // add item to row and update row properties
    currentRow.columns.push(item);
    currentRow.importance += item.importance;
    currentRow.totalImportance = totalImportance;
    currentRow.height = currentRow.importance/totalImportance*100 + '%';

    //  decide to advance to next row or not
    //  biased toward accepting more on a row (screens usually wider than tall)
    if (currentRow.importance >= averageRowImportance && index < items.length - 1) {
      currentRow = {
        importance : 0,
        columns : [],
        height : 0
      }
      rows.push(currentRow);
    }
  });
  return rows;
}

export default makeRows;