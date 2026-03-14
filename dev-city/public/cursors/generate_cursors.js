const fs = require('fs');

function createCrosshair() {
  const size = 32;
  const pixels = Buffer.alloc(size * size * 4);
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; x < size; x++) {
      // transparent background
    }
  }
}
