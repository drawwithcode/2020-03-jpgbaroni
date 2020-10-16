let wDim0 = [0,0]; // Window dimension at starting time
let fps = 12; // Frames per Second

let blocksize = 75; // Size of ambient block

let backimg = []; // Background image

class World {
  constructor(name = "00 Intro") {
    this.name = name;
    this.blocks = [];
    this.entities = [];
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
   backimg.push(loadImage('/assets/images/back.png'));
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

function draw() {
    drawBackground(backimg[0]);
}
