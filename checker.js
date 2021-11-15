//esversion:8;

let checkerBall;
let checkerTex;
let camera;
let gui;

const scrConstant = 720;

let pan_time = 60; // A Minute
let tilt_time = 86400; // A Day

const boxNum = 8;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true);
}

function setup() {
  angleMode(RADIANS);
  createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  gui = createGui('Asset Picker');
  
  for(let i = 0; i < boxNum; i++) {
    let theta = randomGaussian(0, PI);
    let phi = randomGaussian(0, PI);
    let depth = randomGaussian(0, 50);
    let vec = p5.Vector.fromAngles(theta, phi, depth);
    array.push(vec);
  }
  
  camera = createCamera();
  calibrate();
  
  ambientLight(255);
  connectToAccount().then(response => {
    let tokenID = parseInt(response.assets[0].token_id);
    console.log(response, tokenID);
    randomSeed(tokenID);
    noiseSeed(tokenID);
    checkerTex.setSeed(tokenID);
    
    let tokens = response.assets.map(asset => asset.token_id);
    gui.addObject({
      Tokens: tokens,
    });
    
    for(let i = 0; i < boxNum; i++) {
      let theta = randomGaussian(0, PI);
      let phi = randomGaussian(0, PI);
      let depth = randomGaussian(0, 50);
      array[i] = p5.Vector.fromAngles(theta, phi, depth);
    }
    

  }).catch(err => console.error(err));
}

function calibrate() {
  camera.setPosition(0, 0, 0);
  let ratio = min(width, height) / max(width, height);
  console.log(width > height? "Wider Width": "Higher Height", ratio);
  let _w = width >= height? scrConstant: scrConstant * ratio;
  let _h = width <= height? scrConstant: scrConstant * ratio;
  console.log(_w, _h);
  ortho(-_w/2, _w/2, -_h/2, _h/2, -1000, 1000);
}

function draw() {
  background(0);
  checkerTex.draw();
  
  let panAng = getAngle(pan_time);
  let tiltAng = getAngle(tilt_time);
  
  tiltAng = tiltAng >= PI? TAU - tiltAng: tiltAng;
  
  let lookAtVec = p5.Vector.fromAngles(tiltAng, panAng);
  camera.lookAt(lookAtVec.x, lookAtVec.y, lookAtVec.z);
  
  blendMode(EXCLUSION);
  for(let i = 0; i < boxNum; i++) {
    push();
    translate(array[i]);
    scale(5);
    noStroke();
    texture(checkerTex);
    textureWrap(CLAMP);
    model(checkerBall);
    pop();
  }
}

function getAngle(time = 1) {
  if(time != 0) {
    return map(Date.now() % (1000 * time), 0, (1000 * time), 0, TAU, true);
  } else {
    throw "time is zero";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calibrate();
}
