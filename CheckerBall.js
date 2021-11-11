let checkerBall;
let checkerTex;
let camera;
let axis;

let randomizer;
let meta;

const boxNum = 256;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true, () => console.log("hello!world"));
  
  const owner = beyondHelpers.get('owner', '0x0000000000000000000000000000000000000000');
  const viewer = beyondHelpers.get('viewer', '0x0000000000000000000000000000000000000000');

  meta = {
    owner,
    viewer,
  };
}

function setup() {
  angleMode(DEGREES);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  randomizer = new P5DeterministicRandomWithHexSeed(meta.owner);
  
  axis = {
    x: createVector(1,0,0),
    y: createVector(0,1,0),
    z: createVector(0,0,1),
  };
  
  for(let i = 0; i < boxNum; i++) {
    let horizontal = randomGaussian(0, 1000);
    let vertical = randomGaussian(0, 1000);
    let depth = randomGaussian(0, 1000);
    let vec = createVector(horizontal, vertical, depth);    
    array.push(vec);
  }
  
  let _i = floor(random(0,boxNum));
  
  console.log(_i);
  camera = createCamera();
  let cameraPos = array[_i];
  camera.setPosition(cameraPos.x, cameraPos.y, cameraPos.z);
  camera.lookAt(0,0,0);
  ortho();
  ambientLight(255);
}

function draw() {
  let black = color(0, 0, 0);
  background(black);
  checkerTex._draw();
  
  camera.pan(0.1);
  
  for(let i = 0; i < boxNum; i++) {
    push();
    blendMode(DIFFERENCE);
    translate(array[i]);
    scale(5);
    noStroke();
    texture(checkerTex.call());
    textureWrap(CLAMP);
    model(checkerBall);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  let _i = floor(random(0,boxNum));
  let cameraPos = array[_i];
  camera.setPosition(cameraPos.x, cameraPos.y, cameraPos.z);
  camera.lookAt(0,0,0);
  ortho();
}
