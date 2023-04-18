/* jshint esversion: 8 */  
class CheckerTex {
  constructor(int) {
    this.g = createGraphics(4096, 4096);
    this.g.setup = this.setup.bind(this.g);
    this.g.setup();
    this.g.setSeed = this.setSeed.bind(this.g);
    this.g.draw = this.draw.bind(this.g);
    return this.g;
  }
  
  setup() {
    this.blendArray = [ADD, EXCLUSION];
    this.blend = this.blendArray[floor(random(0, this.blendArray.length))];
    this.c = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));
    //this.c.invert = color(255 - red(this.c), 255 - green(this.c), 255 - blue(this.c)); 
    this.c.secondary = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));
    //console.log(this.c, this.c.secondary);
    this.divNum = 20;
    this.angleMode(RADIANS);
  }
  
  draw() {
    this.background(0);
    
    const w_division = this.width/this.divNum;
    for(let _w = w_division * 3/4; _w < this.width; _w += w_division) {
      this.push();
      this.strokeCap(SQUARE);
      this.stroke(this.c);
      this.strokeWeight(w_division * noise(_w));
      this.line(_w, 0, _w, this.height);
      this.pop();
    }
    
    const h_division = this.height/this.divNum;
    for(let _h = h_division * 3/4; _h < this.height; _h += h_division) {
      this.push();
      this.blendMode(this.blend);
      this.strokeCap(SQUARE);
      this.stroke(this.c.secondary);
      this.strokeWeight(h_division * noise(_h));
      this.line(0, _h, this.width, _h);
      this.pop();
    }
  }
  
  setSeed(int) {
    this.noiseSeed(int);
    this.randomSeed(int);
    this.setup();
  }
}
