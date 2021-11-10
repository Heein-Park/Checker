class CheckerTex {
  constructor() {
    this.graphic = createGraphics(1000, 1000);
    this.divNum = 3;
    console.log(this.graphic);
  }
  
  _draw() {
    this.graphic.background(255);
    const w_division = this.graphic.width/this.divNum;
    
    for(let _w = w_division * 3/4; _w < this.graphic.width; _w += w_division) {
      this.graphic.push();
      this.graphic.strokeCap(SQUARE);
      this.graphic.stroke(0);
      this.graphic.strokeWeight(w_division/2);
      this.graphic.line(_w, 0, _w, this.graphic.height);
      this.graphic.pop();
    }
    
    const h_division = this.graphic.height/this.divNum;
    for(let _h = h_division * 3/4; _h < this.graphic.height; _h += h_division) {
      this.graphic.push();
      this.graphic.blendMode(DIFFERENCE);
      this.graphic.strokeCap(SQUARE);
      this.graphic.stroke(255);
      this.graphic.strokeWeight(h_division/2);
      this.graphic.line(0, _h, this.graphic.width, _h);
      this.graphic.pop();
    }
  }
  
  call() {
    return this.graphic;
  }
}
