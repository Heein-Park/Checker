let checkerBall;
let checkerTex;
let camera;

let pan_time = 60; // A Minute
let tilt_time = 86400; // A Day

const boxNum = 64;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true);
}

function setup() {
  angleMode(RADIANS);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  
  for(let i = 0; i < boxNum; i++) {
    let theta = randomGaussian(0, PI);
    let phi = randomGaussian(0, PI);
    let depth = randomGaussian(100, 200);
    let vec = p5.Vector.fromAngles(theta, phi, depth);
    array.push(vec);
  }
  
  camera = createCamera();
  camera.setPosition(0, 0, 0);
  
  perspective();
  ambientLight(255);
}

function draw() {
  background(0);
  checkerTex._draw();
  
  let panAng = getAngle(pan_time);
  let tiltAng = getAngle(tilt_time);
  
  tiltAng = tiltAng >= PI? TAU - tiltAng: tiltAng;
  
  let lookAtVec = p5.Vector.fromAngles(tiltAng, panAng);
  camera.lookAt(lookAtVec.x, lookAtVec.y, lookAtVec.z);
    
  for(let i = 0; i < boxNum; i++) {
    push();
    blendMode(DIFFERENCE);
    translate(array[i]);
    scale(1);
    noStroke();
    texture(checkerTex.call());
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
  camera.setPosition(0, 0, 0);
}
