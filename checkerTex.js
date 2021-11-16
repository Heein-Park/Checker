class CheckerTex {
  constructor(int) {
    this.g = createGraphics(1600, 1600);
    
    this.g.c = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));    
    this.g.divNum = 10;
    this.g.angleMode(RADIANS);
    this.g.setSeed = this.setSeed.bind(this.g);
    this.g.draw = this.draw.bind(this.g);
    return this.g;
  }
  
  draw() {
    this.background(255);
    
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
      this.blendMode(DIFFERENCE);
      this.strokeCap(SQUARE);
      this.stroke(this.c);
      this.strokeWeight(h_division * noise(_h));
      this.line(0, _h, this.width, _h);
      this.pop();
    }
  }
  
  setSeed(int) {
    this.noiseSeed(int);
    this.randomSeed(int);
    this.c = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));    
    //console.log("Set the seed in a graphic, ", this, int);
  }
}
