let wDim0 = [0,0]; // Window dimension at starting time
let fps = 12; // Frames per Second
let backcolor = [0,0,100,255];

let zoomscale = 3; // must be N
let blocksize = 15*zoomscale; // Size of ambient block

let cameraposition = [0,0]; // camera position

//let backimg = []; // Background image
let characters = [];
let selworld; // current selected world
let selworld1; // current selected world

let airresistance = -0.1;

let maxspeed = 8;
let speedincrement = 1;
let speedjump = 8;

let regenHealth = 0.5/60; // Health regained per second
let attacktime = 0.8;
let attackrange = 200;

const gravity = - 9.81*2; // gravity acceleration in blocks per second per second

let deathScreen = 0; // number of seconds to show the death screen for
let mic;
let capture;
let captureOn = false;

let jpressed = false;

let selectedblocktype = 2; // blocktype to edit the map with
let proMode = false; // pro mode: edit map

let loaded_sprites = {"supporter":undefined,"donaldo":undefined,"joebidet":undefined};
let songs = ["Stars And Stripes Forever - The U.S. Army Band.mp3","The Thunderer - The U.S. Army Band.mp3","Washington Post - The U.S. Army Band.mp3"];
let loadedSongs;
let analyzer;

// axes are cartesian-like

class World { // The Map of the game
  constructor(name = "00 Intro", size = [400,32]) {
    this.name = name;
    this.size = size; // size in blocks
    this.rad = [blocksize*size[0]/2/PI,blocksize*(size[0]/2/PI-size[1])]; // Outer and Inner Radius
    /*this.blocks = new Array(size[0]).fill(new Array(size[1]).fill(0)); // create blocks
    this.blocks.forEach((b) => { // create floor
      b[0] = 1;
    });*/
    this.blocks = [];
    for (var x = 0; x < size[0]; x++) {
      let arr = [1];
      for (var y = 1; y < size[1]; y++) {
        arr.push(0);
      }
      this.blocks.push(arr);
    }
    this.entities = [];
    this.startingpoint = [4*blocksize,4*blocksize];
  }
}

class Character { // Like a player class but cooler
  constructor(display, name, position = [0,0], isAI = false, attackdamage = -0.2, faction = 1) {
    this.name = name;
    this.sprites = [];
    this.head = new Image();
    this.display = display;
    this.position = position; // Center of the character
    this.speed = [0,1]; // blocks per second
    this.blocks = [2,4]; // Blocks that occupies
    this.hasweight = true;
    this.cursprite = 1; // current sprite index
    this.currentblocks = [];
    this.life = 1; // life max 1, at 0 death
    this.isAI = isAI;
    this.attack = 0; // if it is attacking > 0
    this.attackdamage = attackdamage; // damage per attack
    this.faction = faction;
    if (loaded_sprites.hasOwnProperty(this.name)) {
      this.sprites = loaded_sprites[this.name].sprites;
      this.head = loaded_sprites[this.name].head;
    }
  }
/*
  loadsprites() { // Loading of the sprites from files, must be performed in the preload
    this.sprites = [];


    for (var side = 0; side < 2; side++) {
      for (var sp = 0; sp < 8; sp++) {
        let img = loadImage('./assets/images/'+this.name+'/Player '+side+' '+sp+'.png');
        this.sprites.push(img);
      }
    }
  }*/
}
class SpriteLoader{ // Like a player class but cooler
  constructor(name, spritefilesize = [8,2], blsize = [2,4], spritessize = [30,60]) { // number of sprites in the file
    this.name = name;
    this.spritefile = loadImage('./assets/images/'+this.name+'/Player.png');
    this.spritefilesize = [spritefilesize[0],spritefilesize[1]];
    this.spritessize = [spritessize[0],spritessize[1]];
    this.sprites = [];
    this.blsize = [blsize[0],blsize[1]];
    this.head = undefined;
  }

  colorspritepixels(playercolor=[106,53,53]) { // Make transparency and colours the characters
    //this.spritessize = [this.spritefile.width/this.spritefilesize[0],this.spritefile.height/this.spritefilesize[1]];
    let spritesn = [];
    let scaling = blocksize/this.spritessize[0]*2;
    this.spritefile.loadPixels();
    for (var y1 = 0; y1 < this.spritefile.height; y1 += this.spritessize[1]) {
      for (var x1 = 0; x1 < this.spritefile.width; x1 += this.spritessize[0]) {
        let imgnew = createImage(this.blsize[0]*blocksize, this.blsize[1]*blocksize);
        imgnew.loadPixels();

        function paintbigsquare(x,y,c) {
          for (var dx = 0; dx < scaling; dx++) {
            for (var dy = 0; dy < scaling; dy++) {
              imgnew.set(scaling*x+dx,scaling*y+dy,c);
            }
          }
        }

        for (let i = 0; i < this.spritessize[0]; i++) {
          for (let j = 0; j < this.spritessize[1]; j++) {
            let pix = this.spritefile.get(x1+i, y1+j);
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
      }
    }

    for (var i = 0; i < spritesn.length/2; i++) {
      this.sprites.push(spritesn[i]);
    }
    for (var i = spritesn.length-1; i >= spritesn.length/2; i--) {
      this.sprites.push(spritesn[i]);
    }

    // builds just the top square
    this.head = createImage(this.sprites[0].width/scaling, this.sprites[0].width/scaling);
    this.head.loadPixels();
    this.sprites[0].loadPixels();
    for (let i = 0; i < this.head.width; i++) {
      for (let j = 0; j < this.head.height; j++) {
        let pix = this.sprites[0].get(i*scaling, j*scaling);
        this.head.set(i,j,color(pix[0],pix[1],pix[2],pix[3]));
      }
    }
    this.head.updatePixels();
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
   //backimg.push(loadImage('./assets/images/back.png'));
   for (ls in loaded_sprites) {
     loaded_sprites[ls] = new SpriteLoader(ls);
   }
   //img = loadImage('/assets/images/giorgioinnocenti.png');
   selworld = loadJSON("./assets/usa.json");
   //selworld =  new World();
   loadedSong = loadSound("./assets/songs/"+songs[floor(random(0,songs.length))]);
}

function setup() {

  /*selworld1.blocks.forEach((row, x) => {
    row.forEach((bl, y) => {
      if (x < 180) {
        selworld.blocks[x][y] = bl;
      }
      else if (x > selworld1.size[0]-220) {
        selworld.blocks[selworld.size[0]-(selworld1.size[0]-x)][y] = bl;
      }
    });
  });*/
  analyzer = new p5.Amplitude();
  analyzer.setInput(loadedSong);
  loadedSong.play();
  loadedSong.setVolume(0.1);
  for (ls in loaded_sprites) {
    loaded_sprites[ls].colorspritepixels([20,20,200]);
  }

  cameraposition = [selworld.startingpoint[0],-selworld.startingpoint[1]+wDim0[1]/2];
  frameRate(fps);
  wDim0 = [windowWidth,windowHeight];
  createCanvas(wDim0[0],wDim0[1]);
  characters.push(new Character(true,"supporter",[100,140],false,-0.1,0));
  characters.push(new Character(true,"donaldo",[34000,140],true,-0.01));
  characters.push(new Character(true,"joebidet",[35000,140],true,-0.01));
  /*for (var i = 0; i < 6; i++) {
    characters.push(new Character(true,"guard",[8400,450],true,-0.1,characters[1].sprites));
  }
  for (var i = 0; i < 4; i++) {
    characters.push(new Character(true,"guard",[8400,450],true,-0.1,characters[1].sprites));
  }*/
  //soundtrack = loadSound('Catch Up - Dan Lebowitz.mp3');
  noStroke();
  angleMode(RADIANS);
  textFont("GrenzeGotisch");

}

function drawBackground(backimage) {
  if(backimage.width/backimage.height > wDim0[0]/wDim0[1]) {
    image(backimage, 0, 0, wDim0[1]/backimage.height*backimage.width,wDim0[1]);
  }
  else {
    image(backimage, 0, 0, wDim0[0],wDim0[0]/backimage.width*backimage.height);
  }
}

function blockInScreen(x,y) {
  let result = true;
  let xmin = (cameraposition[0]-1.5*wDim0[0]/2)/blocksize;
  let xmax = (cameraposition[0]+1.5*wDim0[0]/2)/blocksize;
  if (x < xmin || x > xmax) {
    result = false;
  }
  if (xmin < 0 && x > xmin + selworld.size[0]) {
    result = true;
  }
  if (xmax >= selworld.size[0] && x < xmax - selworld.size[0]) {
    result = true;
  }
  return result;
}

function drawBlock(x,y,type=1) {
  if (blockInScreen(x,y)) {
    let pos = [(x+0.5)*blocksize,(y+0.5)*blocksize];
    stroke(color(75,50,10,255));
    push();
    switch (type) {
      case 2:  // Cement, gray
        fill(color(90,90,90,200));
        stroke(color(60,60,60,255));
        break;
      case 3:  // Yellow
        fill(color(220,190,10,200));
        stroke(color(200,180,10,255));
        break;
      case 4:  // Orange
        fill(color(255,108,0,200));
        stroke(color(200,100,0,255));
        break;
      case 5:  // Red
        fill(color(200,20,10,200));
        stroke(color(170,10,5,255));
        break;
      case 6:  // whitish
        fill(color(200,200,200,200));
        stroke(color(200,200,200,255));
        break;
      case 7:  // Blue
        fill(color(0,0,255,255));
        stroke(color(0,0,200,255));
        break;
      case 8:  // Brown
        fill(color(160,100,44,200));
        stroke(color(160,100,44,255));
        break;
      case 9:  // Black
        fill(color(0,0,0,200));
        stroke(color(0,0,0,255));
        break;
      case 69:  // For coding 69: fuchsia
        fill(color(200,100,220,255));
        stroke(color(100,50,100,255));
        break;
      default:  // Default or 1: green
        fill(color(50,100,30,150));
        stroke(color(50,100,30,255));
    }
    strokeWeight(1.5);
    translate(wDim0[0]/2,wDim0[1]/2+cameraposition[1]-selworld.rad[0]);
    rotate(-(pos[0]-cameraposition[0])/selworld.rad[0]);
    //rect(-blocksize/2,selworld.rad[0]-pos[1]-blocksize/2,blocksize,blocksize);
    let sctop = yscaling(pos[1]+blocksize/2);
    let scbtm = yscaling(pos[1]-blocksize/2);
    beginShape();
    vertex(-blocksize/2*sctop, selworld.rad[0]-pos[1]-blocksize/2);
    vertex(blocksize/2*sctop, selworld.rad[0]-pos[1]-blocksize/2);
    vertex(blocksize/2*scbtm, selworld.rad[0]-pos[1]+blocksize/2);
    vertex(-blocksize/2*sctop, selworld.rad[0]-pos[1]+blocksize/2);
    endShape(CLOSE);
    pop();
  }
  /*
  beginShape();
  vertex(30, 20);
  vertex(85, 20);
  vertex(85, 75);
  vertex(30, 75);
  endShape(CLOSE);*/
}

function drawWorld() {
  background(color(0));
  /* // Boring circles
  push();
  //noStroke();
  let micscale = 0;
  if (captureOn)
    micscale = mic.getLevel();
  translate(wDim0[0]/2,wDim0[1]/2+cameraposition[1]-blocksize*selworld.size[1]/2);
  for(let rad = wDim0[0]+wDim0[1]; rad > 0; rad -= (wDim0[0]+wDim0[1])/12) {
    stroke(backcolor[0]*2,backcolor[1]*2,2*backcolor[2]*(1-rad/(wDim0[0]+wDim0[1])),200);
    fill(backcolor[0],backcolor[1],backcolor[2]*(1-rad/(wDim0[0]+wDim0[1])));
    ellipse(0,0,(1 - micscale)*rad*(1+0.1*sin(rad/5+frameCount/50)));
  }
  pop();
  */

  push();
  noStroke();
  translate(wDim0[0]/2,wDim0[1]/2+cameraposition[1]-selworld.rad[0]);
  //fill(200);
  //ellipse(0,0,selworld.rad[0]*2);
  fill(0);
  ellipse(0,0,selworld.rad[1]*2);
  pop();

  push();
  translate(0,cameraposition[1]/2-blocksize*selworld.size[1]/2);
  noStroke();
  let hn = 1.5*blocksize*selworld.size[1];
  let hn1 = hn;
  for (var i = 0; i < 13; i++) {
    if (i%2 == 0) {
      fill(255,255,255,255*((12-i)/12)**1.5);
    }
    else {
      fill(255,20,20,(55+200*noise(0,i*hn/13,frameCount/fps))*((12-i)/12)**1.5);
    }
    rect(0,i*hn/13,wDim0[0],hn/13);
  }
  for (var i = 0; i < 7; i++) {
    fill(20*((12-i)/12)**2,20*((12-i)/12)**2,150*((12-i)/12)**1.5,255);
    rect(0,i*hn/13,wDim0[0]/2,hn/13+1);
  }
  hn *= 7/13;
  //fill(20,20,150,255);
  //rect(0,0,wDim0[0]/2,hn);
  fill(255,255,255,200);
  for (var x =  wDim0[0]/2/11; x < (wDim0[0]/2/11)*10; x+=(wDim0[0]/2/11)) {
    for (var y = hn/6; y < hn; y+=(hn/6)) {
      ellipse(x,y,dist(x,y,mouseX,mouseY)**0.4*noise(x,y,frameCount/fps));
    }
  }
  //fill(200,200,200,100);
  //rect(0,0,wDim0[0],hn1);
  pop();

  //rect();
  selworld.blocks.forEach((row, x) => {
    row.forEach((bl, y) => {
      if (bl > 0) {
        drawBlock(x,y,bl);
      }
    });
  });
}

function drawsprite(sprite,pos) {
  push();
  translate(wDim0[0]/2, wDim0[1]/2+cameraposition[1]-selworld.rad[0]);
  rotate(-(pos[0]-cameraposition[0])/selworld.rad[0]);
  let sc = (1+yscaling(pos[1]))/2; // a softer scale
  image(sprite,-sprite.width/2,selworld.rad[0]-pos[1]-sprite.height/2,sc*sprite.width,sprite.height);
  pop();
}

function drawChars() { // Draws the characters
  characters.forEach((ch) => {
    if(ch.display) {
      //findOverBlocks(ch.position,ch.blocks,true);
      drawsprite(ch.sprites[ch.cursprite],ch.position);
    }
  });

}

function windowResized() {
  wDim0 = [windowWidth,windowHeight];
  resizeCanvas(wDim0[0],wDim0[1]);
}

function mouseClicked() {
  // if no block is present
  //selworld.blocks.push(new Block(floor(mouseX/blocksize),floor(mouseX/blocksize)));
}
function mouseDragged() {

}

function mousePressed() {
  backcolor = [50,0,100,255];
  characters[0].attack = attacktime*fps;
  characters[0].cursprite = 4;
  if(mouseX < wDim0[0]/2)
    characters[0].cursprite = 12;
}
function mouseReleased() {
  backcolor = [0,0,100,255];
}

function sign(x) {
  result = 0;
  if (x != 0) {
    result = x/abs(x);
  }
  return result;
}

function findOverBlocks(pos, blsize, graphics = false) { // find the blocks occupied by an entity (position and block size of entity)
  //from top left to bottom right
  let blocktopleft =
  [floor((pos[0]+1)/blocksize-blsize[0]/2),
  floor((pos[1]-1)/blocksize+blsize[1]/2)];
  let blockbottomright =
  [floor((pos[0]-1)/blocksize+blsize[0]/2),
  floor((pos[1]+1)/blocksize-blsize[1]/2)];
  let result = [];
  for (var x = blocktopleft[0]; x <= blockbottomright[0]; x++) {
    for (var y = blocktopleft[1]; y >= blockbottomright[1]; y--) {
      let x1 = x, y1 = y;
      if (x1<0) {
        x1 = x1+selworld.size[0];
      }
      else if (x1 >= selworld.size[0]) {
        x1 = x1-selworld.size[0];
      }
      if (y1<0) {
        y1 = 0;
      }
      else if (y1 > selworld.size[1]) {
        y1 = selworld.size[1]-1;
      }
      else {
        result.push([x1,y1]);
        if (graphics)
          drawBlock(x1,y1,69);
      }
    }
  }
  return result;
}

function blockCollision(blocksoccupied) {
  let result = [false, false, false, false]; //top right bottom left
  blocksoccupied.forEach((bo, ibo) => {
    if (selworld.blocks[bo[0]][bo[1]] != 0) {
      result = [true, true, true, true];
    }
  });
  return result;
}

function hasBlockWhere(blocksoccupied,pos) { // Is there a block under the char/entity
  let result = [false,false,false,false];
  let ypos = pos[1];
  let xpos = pos[0];
  if ((ypos+1) % blocksize < blocksize/2) {
    blocksoccupied.forEach((bo, ibo) => {
      if (selworld.blocks[bo[0]][bo[1]+1] != 0) {
        result[0] = true;
      }
      if (selworld.blocks[bo[0]+1][bo[1]] != 0) {
        result[1] = true;
      }
      if (selworld.blocks[bo[0]][bo[1]-1] != 0) {
        result[2] = true;
      }
      if (selworld.blocks[bo[0]-1][bo[1]] != 0) {
        result[3] = true;
      }
    });
  }
  return result;
}

function hasBlockUnder(blocksoccupied,ypos) { // Is there a block under the char/entity
  let result = false;
  if ((ypos+1) % blocksize < blocksize/2) {
    blocksoccupied.forEach((bo, ibo) => {
      if (selworld.blocks[bo[0]][bo[1]-1] != 0) {
        result = true;
      }
    });
  }
  return result;
}

function l2norm(p1,p2) {
  return ((p1[0]-p2[0])**2+(p1[0]-p2[0])**2)**0.5;
}

function moveChars() {
  characters.forEach((ch, ic) => {
    if(ch.display) {
      let presentblocks = findOverBlocks(ch.position,ch.blocks);
      if (ch.hasweight && (!hasBlockUnder(presentblocks,ch.position[1]) || (ch.position[1]-ch.blocks[1]*blocksize/2 < 0))) { // falling
        ch.speed[1] += airresistance*ch.speed[1]/fps+gravity/fps;
      }
      if(ch.speed[0] != 0 || ch.speed[1] != 0) { // physics

        let newpos = [ch.position[0]+blocksize*ch.speed[0]/fps, ch.position[1]+blocksize*ch.speed[1]/fps];

        let distancethisframe = ((ch.position[0] - newpos[0])**2 + (ch.position[1] - newpos[1])**2)**0.5;

        // TBD Better collision up to last frame, refactor with function

        if (distancethisframe != 0) {
          let oldx = ch.position[0], oldy = ch.position[1];
          for (let d = 0; d < distancethisframe; d+=blocksize) {
            let newx = ch.position[0]+d*(-ch.position[0]+newpos[0])/distancethisframe; // projection on x
            let newy = ch.position[1]+d*(-ch.position[1]+newpos[1])/distancethisframe; // projection on y
            if (newx<0) {
              newx = newx + selworld.size[0]*blocksize;
            }
            else if (newx>selworld.size[0]*blocksize) {
              newx = newx - selworld.size[0]*blocksize;
            }
            if (newy<0) {
              newy = 0;
            }
            else if (newy>selworld.size[1]*blocksize) {
              newy = selworld.size[1]*blocksize;
            }
            let futureblocks = findOverBlocks([newx, newy],[ch.blocks[0],ch.blocks[1]]);
            let willcollide = blockCollision(futureblocks);

            if (willcollide[0] || willcollide[1] || willcollide[2] || willcollide[3]) {
              ch.speed[0] = 0;//-0.1*ch.speed[0];
              newpos[0] = oldx;
              ch.speed[1] = 0;//-0.1*ch.speed[1];
              newpos[1] = oldy;
              if (hasBlockUnder(presentblocks,newpos[1]))
                newpos[1] = round(newpos[1]/blocksize)*blocksize;
              d = distancethisframe+blocksize;
              /*newpos[0] = oldx;
              newpos[1] = oldy;
              if (hasBlockUnder(presentblocks,newpos[1]))
                newpos[1] = round(newpos[1]/blocksize)*blocksize;
              let blockwhere = hasBlockWhere(presentblocks,newpos);
              if (blockwhere[1] || blockwhere[3]) {
                ch.speed[0] = 0;//-0.1*ch.speed[0];
              }
              if (blockwhere[0] || blockwhere[2]) {
                ch.speed[1] = 0;//-0.1*ch.speed[0];
              }*/
              d = distancethisframe+blocksize;
            }
            presentblocks = futureblocks;
            oldx = newx;
            oldy = newy;
          }

          if (newpos[0]<0) {
            newpos[0] = newpos[0] + selworld.size[0]*blocksize;
          }
          else if (newpos[0]>selworld.size[0]*blocksize) {
            newpos[0] = newpos[0] -selworld.size[0]*blocksize;
          }
          if (newpos[1]<-1000) {
            newpos[1] = -1000;
            if (ch.life > 0) {
              ch.life = 0;
            }
          }
          else if (newpos[1]>selworld.size[1]*blocksize) {
            newpos[1] = selworld.size[1]*blocksize;
          }

          let futureblocks = findOverBlocks(newpos,[ch.blocks[0],ch.blocks[1]]);
          let willcollide = blockCollision(futureblocks);
          if (willcollide[0] || willcollide[1] || willcollide[2] || willcollide[3]) {
            ch.speed[0] = 0;//-0.1*ch.speed[0];
            newpos[0] = oldx;
            ch.speed[1] = 0;//-0.1*ch.speed[1];
            newpos[1] = oldy;
            if (hasBlockUnder(presentblocks,newpos[1]))
              newpos[1] = round(newpos[1]/blocksize)*blocksize;
            d = distancethisframe+blocksize;
          }

          ch.position[0] = newpos[0];
          ch.position[1] = newpos[1];

        }
      }
      ch.currentblocks = presentblocks;

      // Updates sprites
      if (ch.speed[0] > 0)
        ch.cursprite = int(4*frameCount/fps) % 4;
      if (ch.speed[0] < 0)
        ch.cursprite = int(4*frameCount/fps) % 4 + 8;
      if (ch.speed[1] > 0) {
        if (ch.cursprite < 8)
          ch.cursprite = 7;
        else
          ch.cursprite = 15;
        }
      }
      if (ch.speed[1] < 0) {
        if (ch.cursprite < 8)
          ch.cursprite = 6;
        else
          ch.cursprite = 14;
      }
      if (ch.speed[0] == 0 && ch.speed[1] == 0) {
        if (ch.cursprite < 8)
          ch.cursprite = 1;
        else
          ch.cursprite = 9;
      }

      // attack stuff
      if (ch.attack > 0 && ch.life > 0) {
        let side = 8;
        if (ch.cursprite < 8)
          side = 0;

        if (ch.attack > attacktime*fps/2)
          ch.cursprite = 4+side;
        else
          ch.cursprite = 5+side;

        ch.attack--;

        characters.forEach((ch2, ich2) => {
          if (ch != ch2 && l2norm(ch.position,ch2.position) <= attackrange && ch2.life > 0 && !(ich2 == 0 && proMode)) {
            ch2.life += ch.attackdamage/(attacktime*fps);
          }
        });

      }

      // AI stuff
      if (ch.isAI && frameCount%(fps/2) == 0 && ch.life > 0) {
        ch.speed[0] += random(-0.5,0.5);
        if (random(0,5)<1)
          ch.speed[1] += speedjump*random(0,1);

        characters.forEach((ch2, ich2) => {
          if (ch != ch2 && l2norm(ch.position,ch2.position) <= attackrange*3 && ch2.life > 0) {
            ch.speed[0] += ch2.position[0] - ch.position[0];
            if (abs(ch.speed[0])> maxspeed)
              ch.speed[0] = maxspeed*ch.speed[0]/abs(ch.speed[0]);
            if (ch.attack <= 0)
              ch.attack = attacktime*fps;
          }
        });
      }
  });
  if (characters[0].display) {
    cameraposition[0] = characters[0].position[0];
    if (characters[0].position[1] > cameraposition[1]) {
      cameraposition[1] = characters[0].position[1];
    }
    else if (characters[0].position[1] < cameraposition[1]) {
      cameraposition[1] = characters[0].position[1];
    }
  }
  else {
    if(abs(mouseX-wDim0[0]/2)>wDim0[0]/3)
      cameraposition[0] += (mouseX - wDim0[0]/2)/fps;
    if(abs(mouseY-wDim0[1]/2)>wDim0[1]/3)
      cameraposition[1] += (-mouseY + wDim0[1]/2)/fps;
    if (cameraposition[1] > selworld.size[1]*blocksize)
      cameraposition[1] = selworld.size[1]*blocksize;
  }

}

function collectInputs() {
  let keydright = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
  let keydleft = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  let keydup = keyIsDown(UP_ARROW) || keyIsDown(87);
  let keyddown = keyIsDown(DOWN_ARROW) || keyIsDown(83);
  let blockundernow = hasBlockUnder(characters[0].currentblocks,characters[0].position[1]);
  if (keydright) {
    if (characters[0].speed[0] == 0)
      characters[0].speed[0] += maxspeed/2;
    else if (characters[0].speed[0] < maxspeed)
      characters[0].speed[0] += speedincrement;
    //characters[0].cursprite = int(4*frameCount/fps) % 4;
  }
  if (keydleft) {
    if (characters[0].speed[0] == 0)
      characters[0].speed[0] -= maxspeed/2;
    else if (characters[0].speed[0] > -maxspeed)
      characters[0].speed[0] -= speedincrement;
    //characters[0].cursprite = int(4*frameCount/fps) % 4 + 8;
  }
  if (keydup) {
    /*if (characters[0].cursprite < 8)
      characters[0].cursprite = 7;
    else
      characters[0].cursprite = 15;*/
    if (characters[0].speed[1] < maxspeed && blockundernow && (characters[0].position[1]-characters[0].blocks[1]*blocksize/2) >= 0){
      characters[0].speed[1] += speedjump;
    }
  }
  if (keyddown) {
    /*if (characters[0].cursprite < 8)
      characters[0].cursprite = 6;
    else
      characters[0].cursprite = 14;*/
    if (characters[0].speed[1] > -maxspeed)
      characters[0].speed[1] -= speedincrement;
  }

  if (!keydright && !keydleft && !keydup && !keyddown) {
    characters[0].speed[0] /= 2;
    if (abs(characters[0].speed[0]) < 0.05)
      characters[0].speed[0] = 0;
    /*if (characters[0].cursprite < 8)
      characters[0].cursprite = 1;
    else
      characters[0].cursprite = 9;*/
  }
}

function yscaling(ypos) { // returns the horizontal scaling based on y position
  return (selworld.rad[0]-ypos)/selworld.rad[0];
}

function drawStats() {

  if (deathScreen > 0) {
    textAlign(CENTER,CENTER);
    textSize(120 - 10*deathScreen/fps);
    fill(255,255,255,100 + 20*deathScreen/fps);
    stroke(0,0,0,100 + 20*deathScreen/fps);
    text("You Lost The Election", wDim0[0]/2, wDim0[1]/2);
    deathScreen--;
  }

  push();
  translate(0,wDim0[1]-80);
  //textFont("GrenzeGotisch");
  textAlign(RIGHT,TOP);
  textSize(20);
  fill(255);
  stroke(0);
  text("Health", 120, 0);
  let xstartbar = 128+characters[0].head.width;
  noStroke();
  fill(0);
  rect(xstartbar-4,5,108,10);
  fill(200-characters[0].life*200,characters[0].life*400,20);
  rect(xstartbar,7,100*characters[0].life,6);
  image(characters[0].head,128,8-characters[0].head.height/2);
  pop();
}

function updateWorld() {
  characters.forEach((ch, ich) => {
    if (ch.life > 1) {
      ch.life = 1;
    }
    else if (ch.life <= 0 && ch.display) {
      ch.life = 0;
      ch.display = false;
      if (ich == 0) {
        deathScreen = 5*fps;
      }
    }
    else if (ch.life > 0) {
      ch.life += regenHealth;
    }
  });

}

function keyPressed() {
  if (keyCode == 80 && jpressed == true) { //j
    proMode = !proMode;
  }
  if (keyCode == 74) { //j
    jpressed = true;
  }
  else {
    jpressed = false;
  }
  if (keyCode <= 57 && keyCode >= 48 && proMode) {
    selectedblocktype = keyCode-48;
  }
}

function mouseDraw() {
  if (proMode && mouseIsPressed) {
    let yrad = ((mouseX-wDim0[0]/2)**2 + (selworld.rad[0]+mouseY-cameraposition[1]-wDim0[1]/2)**2)**0.5;
    let ypos = floor((selworld.rad[0]-yrad)/blocksize);
    let xpos = floor((atan((mouseX-wDim0[0]/2)/yrad)*selworld.rad[0] + cameraposition[0])/blocksize);

    if (xpos < 0) {
      xpos += selworld.size[0];
    }
    else if (xpos >= selworld.size[0]) {
      xpos -= selworld.size[0];
    }
    if (ypos < 0) {
      ypos = 0;
    }
    else if (ypos >= selworld.size[1]) {
      ypos = selworld.size[1] - 1;
    }
    if (mouseButton === RIGHT && selworld.blocks[xpos][ypos] != 0) {
      selworld.blocks[xpos][ypos] = 0;
    }
    else if (mouseButton === LEFT && selworld.blocks[xpos][ypos] != selectedblocktype) {
      selworld.blocks[xpos][ypos] = selectedblocktype;
    }
  }
}

function draw() {
    /*drawBackground(backimg[0]);
    characters[0].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,50);
    });
    characters[1].sprites.forEach((sp,isp) => {
      image(sp,blocksize*2*isp,450);
    });*/
    //characters[0].cursprite = int(2*frameCount/fps) % characters[0].sprites.length;
    collectInputs();

    moveChars();
    mouseDraw();

    drawWorld();

    if (frameCount%fps == 0) // every second updates things in the world
      updateWorld();

    drawChars();

    drawStats();

    if (proMode) {
      if (!captureOn) {
        capture = createCapture();
        capture.hide();
        captureOn = true;
        mic = new p5.AudioIn();
        mic.start();
      }
      push();
      translate(capture.width,0);
      scale(-1,1);
      image(capture, -wDim0[0]+capture.width, wDim0[1]-wDim0[0]/3 * capture.height / capture.width, wDim0[0]/3, wDim0[0]/3 * capture.height / capture.width);
      pop();
    }
    else {
      captureOn = false;
    }

}
