let wDim0 = [0,0]; // Window dimension at starting time
let fps = 12; // Frames per Second

let zoomscale = 3; // must be N
let blocksize = 15*zoomscale; // Size of ambient block

let backimg = []; // Background image
let characters = [];

class World { // The Map of the game
  constructor(name = "00 Intro") {
    this.name = name;
    this.blocks = [];
    this.entities = [];
  }
}

class Character { // Like a player class but cooler
  constructor(name = "giorgioinnocenti") {
    this.name = name;
    this.sprites = [];
    this.loadsprites();
  }

  loadsprites() { // Loading of the sprites from files, must be performed in the preload
    this.sprites = [];
    for (var side = 0; side < 2; side++) {
      for (var sp = 0; sp < 8; sp++) {
        let img = loadImage('./assets/images/'+this.name+'/Player '+side+' '+sp+'.png');
        this.sprites.push(img);
      }
    }
  }

  /* DO NOT READ THE FOLLOWING, VERY BORING*/
  colorpixels(playercolor=[106,53,53]) { // Make transparency and colours the characters
    let spritesn = [];
    this.sprites.forEach((img) => {
      let imgnew = createImage(blocksize*2, blocksize*4);
      img.loadPixels();
      imgnew.loadPixels();

      let scaling = blocksize/img.width*2;
      function paintbigsquare(x,y,c) {
        for (var dx = 0; dx < scaling; dx++) {
          for (var dy = 0; dy < scaling; dy++) {
            imgnew.set(scaling*x+dx,scaling*y+dy,c);
          }
        }
      }

      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          let pix = img.get(i, j);
          if (pix[0] == 255 && pix[1] == 255 && pix[2] == 255 && pix[3] == 255) {
            paintbigsquare(i, j,color(0, 0, 0, 0));
          }
          else if (pix[0] == 177 && pix[1] == 103 && pix[2] == 103) { // light cloth color
            let lightcolor = color(playercolor[0]*1.1+40,playercolor[1]*1.1+40,playercolor[2]*1.1+40,255);
            paintbigsquare(i, j,lightcolor);
          }
          else if (pix[0] == 106 && pix[1] == 53 && pix[2] == 53) { // base cloth color
            let basecolor = color(playercolor[0],playercolor[1],playercolor[2],255);
            paintbigsquare(i, j,basecolor);
          }
          else if (pix[0] == 65 && pix[1] == 33 && pix[2] == 33) { // dark cloth color
            let darkcolor = color(playercolor[0]/1.1-40,playercolor[1]/1.1-40,playercolor[2]/1.1-40,255);
            paintbigsquare(i, j,darkcolor);
          }
          else  {
            paintbigsquare(i, j, color(pix[0], pix[1], pix[2], pix[3]));
          }
        }
      }
      imgnew.updatePixels();
      spritesn.push(imgnew);
    });
    /* // better not saving them
    let counter = 0;
    for (var side = 0; side < 2; side++) {
      for (var sp = 0; sp < 8; sp++) {
        spritesn[counter].save('Player '+side+' '+sp,'png');
        counter++;
      }
    }
    this.loadsprites();*/
    this.sprites = spritesn;
  }
}

class Block {
  constructor(x,y,type = "rock") {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

class Entity {
  constructor([x,y]) {
    this.name = name;
    this.entities = [];
  }
}

function preload(){
   backimg.push(loadImage('./assets/images/back.png'));
   characters.push(new Character());
   characters.push(new Character("guard"));
   //img = loadImage('/assets/images/giorgioinnocenti.png');
   world1 = new World();
}

function drawBackground(backimage) {
  if(backimage.width/backimage.height > wDim0[0]/wDim0[1]) {
    image(backimage, 0, 0, wDim0[1]/backimage.height*backimage.width,wDim0[1]);
  }
  else {
    image(backimage, 0, 0, wDim0[0],wDim0[0]/backimage.width*backimage.height);
  }

}

function setup() {
  frameRate(fps);
  wDim0 = [windowWidth,windowHeight-4];
  createCanvas(wDim0[0],wDim0[1]);
  characters[0].colorpixels();
  characters[1].colorpixels();
  //soundtrack = loadSound('Catch Up - Dan Lebowitz.mp3');
  noStroke();
}

function windowResized() {
  wDim0 = [windowWidth,windowHeight-4];
  resizeCanvas(wDim0[0],wDim0[1]);
}

function mouseClicked() {
  // if no block is present
  world1.blocks.push(new Block(floor(mouseX/blocksize),floor(mouseX/blocksize)));
}
function mousePressed() {
  const fs = require('fs');

  // create a JSON object
  const user = {
      "id": 1,
      "name": "John Doe",
      "age": 22
  };

  // convert JSON object to string
  const data = JSON.stringify(user);

  // write JSON string to a file
  fs.writeFile('user.json', data, (err) => {
      if (err) {
          throw err;
      }
      console.log("JSON data is saved.");
  });
}
function draw() {
    drawBackground(backimg[0]);
    characters[0].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,50);
    });
    characters[1].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,450);
    });
}
