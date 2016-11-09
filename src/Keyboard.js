let pressedEvents = [];

let pressedKeys = '';

document.body.addEventListener('keypress', function (e) {
  //  only catch keypresses not in a box
  if (e.target !== document.body) return;
  pressedKeys += e.key;
  let handlers = [];
  pressedEvents.forEach((pressHandlers)=>{
    //  if pattern matches press handler
    handlers.push(pressHandlers.handler);
  });
  let stop = false;
  let event = {
    pressed : pressedKeys,
    stopPropagation : ()=>{
      stop = true;
    }
  }
  while (!stop && handlers.length && !handlers.pop()(event)) {}
  pressedKeys = '';
});

let onlyKeyDownKeys = {
  'Backspace' : 8
};

document.body.addEventListener('keydown', function (e) {
  //  only catch keypresses not in a box
  if (e.target !== document.body) return;

  if (onlyKeyDownKeys[e.key]) {
    pressedKeys += e.key;
    let handlers = [];
    pressedEvents.forEach((pressHandlers)=>{
      //  if pattern matches press handler
      handlers.push(pressHandlers.handler);
    });
    let stop = false;
    let event = {
      pressed : onlyKeyDownKeys[e.key],
      stopPropagation : ()=>{
        stop = true;
      }
    }
    while (!stop && handlers.length && !handlers.pop()(event)) {}
    pressedKeys = '';
  }
});

let Keyboard = {
  onPress(keyPattern, handler) {
    pressedEvents.push({
      pattern : keyPattern,
      handler : handler
    })
  }
}

export default Keyboard;