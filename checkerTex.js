class CheckerTex {
  constructor(int) {
    this.g = createGraphics(2000, 2000);
    
    this.g.blendArray = [ADD,
                        DARKEST,
                        LIGHTEST,
                        DIFFERENCE,
                        EXCLUSION,
                        MULTIPLY,
                        SCREEN,
                        REPLACE,
                        OVERLAY,
                        HARD_LIGHT,
                        SOFT_LIGHT,
                        DODGE,
                        BURN];
                        
    this.g.blend = this.g.blendArray[floor(random(0, this.g.blendArray.length))];
    this.g.c = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));
    this.g.c.invert = color(red(this.g.c), green(this.g.c), blue(this.g.c)); 
    
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
      this.blendMode(this.blend);
      this.strokeCap(SQUARE);
      this.stroke(this.c.invert);
      this.strokeWeight(h_division * noise(_h));
      this.line(0, _h, this.width, _h);
      this.pop();
    }
  }
  
  setSeed(int) {
    this.noiseSeed(int);
    this.randomSeed(int);
    this.c = color(floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255)));
    this.c.invert = color(red(this.c), green(this.c), blue(this.c)); 
    this.blend = this.blendArray[floor(random(0, this.blendArray.length))];
  }
}
