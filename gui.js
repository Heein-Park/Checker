class GUI {
  constructor() {
    this.param = {};
    
    this.div = createDiv();
    this.div.class('panel');
    this.div.style('background-color', 'white');
    this.div.position(0, 0);
    
    this.header = createDiv('<div class="panel-title text-large text-bold">GUI Panel</div>');
    this.header.class('panel-header');
    this.header.parent(this.div);
    
    this.body = createDiv();
    this.body.class('panel-body');
    this.body.parent(this.div);
    
    this.footer = createDiv();
    this.footer.class('panel-footer');
    this.footer.parent(this.div);
    
    this.viewMode = new SelectForm("View Mode", ['Fixed', 'Temporal'], this.param);
    this.body.child(this.viewMode);
    
    this.capture = new Button("Capture", () => {
      loadPixels();
      let screenShot = createImage(width * pixelDensity(), height * pixelDensity());
      screenShot.loadPixels();
      let d = pixelDensity();
      let pixelLength = 4 * (width * d) * (height * d);
      for (let i = 0; i < pixelLength; i++) {
        screenShot.pixels[i] = pixels[i];
      }
      screenShot.pixels = pixels;
      screenShot.updatePixels();
      
      let copied = createImage(1000, 1000);
      copied.loadPixels();
      for (let i = 0; i < copied.width; i++) {
        for (let j = 0; j < copied.height; j++) {
          copied.set(i, j, color(0, 0, 0));
        }
      }
      copied.updatePixels();
      copied.copy(screenShot, width/2 - copied.width/2, height/2 - copied.height/2, copied.width, copied.height, 0, 0, copied.width, copied.height);
      console.log(copied);
      copied.save("CheckerScopic-" + (this.param.Seed? this.param.Seed: ""), "png");
    });
    this.body.child(this.capture);
    
    this.connect = new Button("Connect", async () => {
      connectToAccount().then(response => {
        const _seed = response.assets.map(asset => asset.traits[1].value);
        _seed.unshift("Vanilla");
        
        let _prevSeedForm = select('#Seed');
        if(_prevSeedForm) _prevSeedForm.remove();
        
        const seedForm = new SelectForm("Seed", _seed, this.param);
        this.body.child(seedForm);
      }).catch(err => console.error(err));
    });
    this.body.child(this.connect);
    
    this.reset = new Button("Zoom Reset", () => {
      zoomRatio = 1;
      calibrate();
    });
    this.body.child(this.reset);
    
    return this;
  }
  
  callParam() {
    return this.param;
  }
}

class SelectForm {
  constructor(name, array, target) {
    target[name] = array[0];
    
    this.div = createDiv();
    this.div.id(name);
    this.div.class('form-group col-12');
    
    // Name Label
    this.name = createElement('label', name);
    this.name.class('form-label');
    this.name.parent(this.div);
    
    // Select Input
    this.select = createElement('select');
    this.select.class('form-select');
    this.select.parent(this.div);
    
    for (const str of array) {
      let _option = createElement('option', str);
      this.select.child(_option);
    }
    
    this.select.elt.addEventListener('input', e => target[name] = array[parseInt(e.target.options.selectedIndex)]);
    
    return this.div;
  }
}

class Button {
  constructor(name, callback) {
    this.div = createDiv();
    this.div.class('tile tile-centered');
    this.button = createElement('button', name);
    this.button.class('btn my-1 btn-block col-12 tile-content');
    this.button.elt.addEventListener('mouseup', callback);
    this.button.parent(this.div);
    
    return this.div;
  }
}
