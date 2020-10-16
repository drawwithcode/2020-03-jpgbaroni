let wDim0 = [0,0]; // Window dimension at starting time
let fps = 12; // Frames per Second

let blocksize = 30; // Size of ambient block

let backimg = []; // Background image
let characters = [];

class World {
  constructor(name = "00 Intro") {
    this.name = name;
    this.blocks = [];
    this.entities = [];
  }
}

class Character {
  constructor(name = "giorgioinnocenti") {
    this.name = name;
    this.sprites = [];
    this.loadsprites();
  }

  loadsprites() {
    this.sprites = [];
    for (var side = 0; side < 2; side++) {
      for (var sp = 0; sp < 8; sp++) {
        let img = loadImage('/assets/images/'+this.name+'/Player '+side+' '+sp+'.png');
        this.sprites.push(img);
      }
    }
  }

  colorpixels() {
    let spritesn = [];
    this.sprites.forEach((img) => {
      let imgnew = createImage(blocksize*2, blocksize*4);
      img.loadPixels();
      imgnew.loadPixels();
      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          let pix = img.get(i, j);
          if (pix[0] == 255 && pix[1] == 255 && pix[2] == 255 && pix[3] == 255) {
            imgnew.set(2*i, 2*j, color(0, 0, 0, 0));
            imgnew.set(2*i+1, 2*j, color(0, 0, 0, 0));
            imgnew.set(2*i, 2*j+1, color(0, 0, 0, 0));
            imgnew.set(2*i+1, 2*j+1, color(0, 0, 0, 0));
          }
          else  {
            imgnew.set(2*i, 2*j, color(pix[0], pix[1], pix[2], pix[3]));
            imgnew.set(2*i+1, 2*j, color(pix[0], pix[1], pix[2], pix[3]));
            imgnew.set(2*i, 2*j+1, color(pix[0], pix[1], pix[2], pix[3]));
            imgnew.set(2*i+1, 2*j+1, color(pix[0], pix[1], pix[2], pix[3]));
          }
        }
      }
      imgnew.updatePixels();
      spritesn.push(imgnew);
    });
    /*let counter = 0;
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
   backimg.push(loadImage('/assets/images/back.png'));
   characters.push(new Character());
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
    characters[0].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,50);
    });
}
