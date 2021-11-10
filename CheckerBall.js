let checkerBall;
let checkerTex;
let headingVec, newVec, normalized;

let theta, phi;

const boxNum = 256;
const array = [];

function preload() {
  checkerBall = loadModel('assets/CheckerBall.obj', true, () => console.log("hello!world"));
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  checkerTex = new CheckerTex();
  headingVec = createVector(0, -1, 0);
  
  for(let i = 0; i < boxNum; i++) {
    theta = radians(90);
    phi = randomGaussian(0, Math.PI);
    newVec = p5.Vector.fromAngles(theta, phi);
    normalized = headingVec.normalize();
    
    let dot = normalized.dot(newVec);
    
    newVec.rotate(acos(dot), normalized);
    headingVec = newVec.copy();
    let dist = random(0, 100);
    
    array.push({ vector:headingVec, dist:dist });
  }
  console.log(array);
  
  ambientLight(255);
}

function draw() {
  let black = color(0, 0, 0);
  background(black);
  checkerTex._draw();
  orbitControl();
  
  for(let i = 0; i < boxNum; i++) {
    push();
    blendMode(DIFFERENCE);
    noStroke();
    texture(checkerTex.call());
    textureWrap(CLAMP);
    model(checkerBall);
    pop();
    
    translate(array[i].vector.setMag(array[i].dist));
  }
 }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
