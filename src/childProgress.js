//  recurse through children to get average progress of all with progress active
//  only count first child with progress (so we can overwrite progress of children if we so choose)
function childProgress(element, progress, relativeImportance) {
  return [{progress:50},{progress:25}];
}

export default childProgress;