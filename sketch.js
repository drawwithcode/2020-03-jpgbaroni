let wDim0 = [0,0]; // Window dimension at starting time
let fps = 12; // Frames per Second

let zoomscale = 3; // must be N
let blocksize = 15*zoomscale; // Size of ambient block

let cameraposition = [0,0]; // camera position

let backimg = []; // Background image
let characters = [];
let selworld; // current selected world

let airresistance = -0.1;

const gravity = - 9.81/5; // gravity acceleration in blocks per second per second

// axes are cartesian-like

class World { // The Map of the game
  constructor(name = "00 Intro", size = [800,16]) {
    this.name = name;
    this.size = size; // size in blocks
    this.rad = [blocksize*size[0]/2/PI,blocksize*(size[0]/2/PI-size[1])]; // Outer and Inner Radius
    this.blocks = new Array(size[0]).fill(new Array(size[1]).fill(0)); // create blocks
    this.blocks.forEach((b) => { // create floor
      b[0] = 1;
    });
    this.entities = [];
    this.startingpoint = [4*blocksize,4*blocksize];
  }
}

class Character { // Like a player class but cooler
  constructor(display, name = "giorgioinnocenti") {
    this.name = name;
    this.sprites = [];
    this.display = display;
    this.position = [0,0]; // Center of the character
    this.speed = [0,1]; // blocks per second
    this.blocks = [2,4]; // Blocks that occupies
    this.hasweight = true;
    this.cursprite = 1; // current sprite index
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
   document.body.style.overflow = "hidden";
   backimg.push(loadImage('./assets/images/back.png'));
   characters.push(new Character(true));
   characters.push(new Character(false,"guard"));
   //img = loadImage('/assets/images/giorgioinnocenti.png');
   selworld = new World();
   characters[0].position = selworld.startingpoint;
   cameraposition = [selworld.startingpoint[0],selworld.startingpoint[1]+wDim0[1]/2];
}

function drawBackground(backimage) {
  if(backimage.width/backimage.height > wDim0[0]/wDim0[1]) {
    image(backimage, 0, 0, wDim0[1]/backimage.height*backimage.width,wDim0[1]);
  }
  else {
    image(backimage, 0, 0, wDim0[0],wDim0[0]/backimage.width*backimage.height);
  }
}

function drawBlock(x,y) {
  let pos = [(x+0.5)*blocksize,(y+0.5)*blocksize];
  push();
  fill(color(150,100,70,255));
  stroke(color(75,50,10,255));
  strokeWeight(1.5);
  translate(wDim0[0]/2,wDim0[1]-cameraposition[1]-selworld.rad[0]);
  rotate(-(pos[0]-cameraposition[0])/selworld.rad[0]);
  rect(-blocksize/2,selworld.rad[0]-pos[1]-blocksize/2,blocksize,blocksize);
  pop();/*
  beginShape();
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape(CLOSE);*/
}

function drawWorld() {
  push();
  translate(wDim0[0]/2,wDim0[1]-cameraposition[1]-selworld.rad[0]);
  fill(200);
  ellipse(0,0,selworld.rad[0]*2);
  fill(0);
  ellipse(0,0,selworld.rad[1]*2);

  pop();
  //rect();
  selworld.blocks.forEach((row, x) => {
    row.forEach((bl, y) => {
      if (bl == 1) {
        drawBlock(x,y);
      }
    });
  });
}

function drawsprite(sprite,pos) {
  push();
  translate(wDim0[0]/2,wDim0[1]-cameraposition[1]-selworld.rad[0]);
  rotate(-(pos[0]-cameraposition[0])/selworld.rad[0]);
  image(sprite,-sprite.width/2,selworld.rad[0]-pos[1]-sprite.height/2);
  pop();
}

function drawChars() { // Draws the characters
  characters.forEach((ch) => {
    if(ch.display) {
      drawsprite(ch.sprites[ch.cursprite],ch.position);
    }
  });

}

function setup() {
  frameRate(fps);
  wDim0 = [windowWidth,windowHeight];
  createCanvas(wDim0[0],wDim0[1]);
  characters[0].colorpixels();
  characters[1].colorpixels();
  //soundtrack = loadSound('Catch Up - Dan Lebowitz.mp3');
  noStroke();
  angleMode(RADIANS);
}

function windowResized() {
  wDim0 = [windowWidth,windowHeight];
  resizeCanvas(wDim0[0],wDim0[1]);
}

function mouseClicked() {
  // if no block is present
  //selworld.blocks.push(new Block(floor(mouseX/blocksize),floor(mouseX/blocksize)));
}
function mousePressed() {

}

function sign(x) {
  result = 0;
  if (x != 0) {
    result = x/abs(x);
  }
  return result;
}

function moveChars() {
  characters.forEach((ch, ic) => {
    if(ch.display) {
      if (ch.hasweight) { // falling
        ch.speed[1] += airresistance*ch.speed[1]/fps+gravity/fps;
      }
      if(ch.speed[0] != 0 || ch.speed[1] != 0) { // physics
        let newpos = [ch.position[0]+blocksize*ch.speed[0]/fps, ch.position[1]+blocksize*ch.speed[1]/fps];
        if (newpos[0]<0) {
          newpos[0] += selworld.size[0]*blocksize;
        }
        else if (newpos[0]>=selworld.size*blocksize) {
          newpos[0] -= selworld.size[0]*blocksize;
        }

        // if enters a full block stops
        /*
        let oldblocktopleft = [floor(ch.position[0]/blocksize-ch.blocks[0]/2),floor(ch.position[1]/blocksize+ch.blocks[1]/2)];let newblocktopleft = [floor((ch.position[0]+dpos[0])/blocksize-ch.blocks[0]/2),floor((ch.position[1]+dpos[1])/blocksize+ch.blocks[1]/2)];

        for (let x = oldblocktopleft[0]; x != newblocktopleft[0]; x += sign(newblocktopleft[0]-oldblocktopleft[0])) {
          for (let y = oldblocktopleft[1]; y != newblocktopleft[1]; y += sign(newblocktopleft[1]-oldblocktopleft[1])) {
            if (selworld.blocks[x][y] != 0) {

            }
          }
        }*/
        let distancethisframe = ((ch.position[0] - newpos[0])^2 + (ch.position[1] - newpos[1])^2)^0.5;
        let oldblocktopleft = [floor(ch.position[0]/blocksize-ch.blocks[0]/2),floor(ch.position[1]/blocksize+ch.blocks[1]/2)];

        for (let d = distancethisframe%blocksize; d < distancethisframe+blocksize; d+=blocksize) {
          let newblocktopleft =
          [floor((ch.position[0]+d*(-ch.position[0]+newpos[0])/distancethisframe)/blocksize-ch.blocks[0]/2),
          floor((ch.position[1]+d*(-ch.position[1]+newpos[1])/distancethisframe)/blocksize+ch.blocks[1]/2)];
          for (let x = newblocktopleft[0]; x < newblocktopleft[0]+ch.blocks[0]+1; x++) {
            for (let y = newblocktopleft[1]; y > newblocktopleft[1]-ch.blocks[1]-1; y--) {
              let x1 = x, y1 = y;
              drawBlock(x1,y1);
              if (x1<0) {
                x1 = x1+selworld.size[0];
              }
              else if (x1 >= selworld.size[0]) {
                x1 = x1-selworld.size[0];
              }
              if (y1<0) {
                y1 = y1+selworld.size[1];
              }
              else if (y1 >= selworld.size[1]) {
                y1 = y1-selworld.size[1];
              }
              if (selworld.blocks[x1][y1] != 0) { //found collision
                if (newblocktopleft[0] != oldblocktopleft[0]) {
                  ch.speed[0] = -0.1*ch.speed[0];
                  newpos[0] = (oldblocktopleft[0]+ch.blocks[0]/2)*blocksize;
                }
                if (newblocktopleft[1] != oldblocktopleft[1]) {
                  ch.speed[1] = -0.1*ch.speed[1];
                  newpos[1] = (oldblocktopleft[1]-ch.blocks[1]/2)*blocksize;
                }
                x = newblocktopleft[0]+ch.blocks[0];
                break;
              }
            }
          }
          oldblocktopleft = newblocktopleft;
        }

        if (newpos[0]<0) {
          newpos[0] += selworld.size[0]*blocksize;
        }
        else if (newpos[0]>=selworld.size*blocksize) {
          newpos[0] -= selworld.size[0]*blocksize;
        }

        ch.position[0] = newpos[0];
        ch.position[1] = newpos[1];
      }
    }
  });
}

function draw() {
    /*drawBackground(backimg[0]);
    characters[0].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,50);
    });
    characters[1].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,450);
    });*/
    background(color(0));
    drawWorld();

    moveChars();
    drawChars();
}
