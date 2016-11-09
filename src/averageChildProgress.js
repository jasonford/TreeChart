//  recurse through children to get average progress of all with progress active
function averageChildProgress(element, progressCount) {
  progressCount = progressCount || {
    totalProgress : 0,
    totalImportance : 0
  };
  Object.keys(element.elements || {}).forEach((key)=>{
    let el = element.elements[key];
    averageChildProgress(el, progressCount);
    if (!isNaN(el.progress)) {
      progressCount.totalProgress += el.progress;
      progressCount.totalImportance += el.importance;
    }
  });

  //  if nothing had progress defined, return null so no progress is shown
  return progressCount.totalImportance ? progressCount.totalProgress/progressCount.totalImportance : null;
}

export default averageChildProgress;