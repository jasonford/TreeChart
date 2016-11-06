let pressedEvents = [];

let pressedKeys = '';

document.body.addEventListener('keypress', function (e) {
  pressedKeys += e.key;
  pressedEvents.forEach((pressHandlers)=>{
    //  if pattern matches press handler
    pressHandlers.handler(pressedKeys);
  });
  pressedKeys = '';
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