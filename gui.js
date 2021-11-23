/* jshint esversion: 8 */

class GUI {
  constructor() {
    this.isHidden = false;
    this.isShown = !this.isHidden;
    this.isOver = false;
    this.isOut = !this.isOver;
    this.prev = false;
    
    // GUI Global parameter storage
    this.param = {};
    
    // Constants
    const SUCCESS = 1;
    const WARNING = 2;
    const ERROR = 3;
    
    // Functions
    const setName = () => "CheckerScopic#" + tokenSeed + (this.param["View Mode"] === "Temporal"? `(${year()}.${month()}.${day()}.${hour()}.${minute()})`: "");
    const menuItem = (ele) => { // Encapsulate an element into menu-item <li>
      let _item = createElement("li");
      _item.class("menu-item");
      _item.child(ele);
      return _item;
    };
    const divider = (data_content, _class) => { // Divider for a menu
      let _item = createDiv();
      _item.class("divider");
      if(_class) _item.addClass(_class);
      _item.attribute("data-content", data_content);
      return _item;
    };
    
    // Main Panel
    this.div = createDiv();
    this.div.class('panel opactity-transition');
    this.div.style('background-color', 'white');
    this.div.position(0, 0);
    
    // Header
    this.header = createDiv('<div class="panel-title text-large text-bold">GUI Panel</div>');
    this.header.class('panel-header');
    this.header.parent(this.div);
    
    // Body
    this.body = createDiv();
    this.body.class('panel-body');
    this.body.parent(this.div);
    
    // Footer
    this.footer = createDiv();
    this.footer.class('panel-footer');
    this.footer.parent(this.div);
    this.pinGUISwitch = new Switch("pinGUISwitch", "Pin the GUI panel", this.param);
    this.footer.child(this.pinGUISwitch);
    
    
    
    // Display Option Divider
    this.body.child(divider("Display"));
    // View Mode Options
    this.viewMode = new SelectForm("View Mode", ['Fixed', 'Temporal'], this.param);
    this.body.child(this.viewMode);
    // Zoom Reset Buttom
    this.reset = new Button("Zoom Reset", () => {
      zoomRatio = 1;
      calibrate();
    });
    this.body.child(this.reset);
    
    // Alert Toast Box
    // Put any alert div into this box as a stack
    this.toastBox = createDiv();
    this.toastBox.id('toastBox');
    this.toastBox.class(`p-fixed mx-1 d-flex`);
    this.toastBox.style('bottom', '0px');
    this.toastBox.style('right', '0px');
    this.toastBox.style('width', 'auto');
    this.toastBox.style('min-width', '12rem');
    this.toastBox.style('z-index', '600');
    this.toastBox.style(`
      justify-content: flex-end;
      align-content: flex-end;
      flex-flow: column-reverse;
    `);
    this.toastBox.mouseOver(() => this.onOver());
    this.toastBox.mouseOut(() => {if(!this.isOut) this.onOut();});
    
    // Capture Section
    this.body.child(divider("Capture"));
    //Capture Button and Necessary Functions
    const crop = () => {
      if(this.param.croppedShot) delete this.param.croppedShot;
      this.param.croppedShot = get(width/2 - captureRect._w/2, height/2 - captureRect._h/2, captureRect._w, captureRect._h);
      return this.param.croppedShot;
    }
    const capture = async () => crop().save(setName(), "png");
    this.captureBttn = new Button("Capture", capture);
    this.body.child(this.captureBttn);
    
    // Switch to show or hide a capture area
    this.captRectSwitch = new Switch("captRectSwitch", "Capture Area", this.param);
    this.body.child(this.captRectSwitch);
    
    //Connect Button
    const connect = async () => {
      this.connectBttn.addClass('loading');
      connectToAccount().then(({seedSet, contract, isMinter, address}) => {
        this.connectBttn.remove();
        const _seed = seedSet;
        _seed.unshift("Vanilla");
        
        // Seed Input Form
        this.seedForm = new SelectForm("Seed", _seed, this.param);
        this.body.child(this.seedForm);
        
        if (isMinter) { // Minter Conditional Start   
          this.mintBttn = createA('#mint-modal', 'Mint');
          this.mintBttn.class('btn my-1 btn-block col-12 tile-content');
          this.body.child(this.mintBttn);
          
          // Mint Modal Panel
          this.mintModal = createDiv(`
            <a href="#close" class="modal-overlay" aria-label="Close"></a>
            <div class="modal-container">
              <div class="modal-header">
                <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
                <div class="modal-title h4">Mint a pattern</div>
              </div>
              <div class="modal-body columns">
              </div>
              <div class="modal-footer">
              </div>
            </div>
          `);
          this.mintModal.class('modal');
          this.mintModal.id('mint-modal');
          this.mintModal.body = select("#mint-modal .modal-body");
          this.mintModal.footer = select("#mint-modal .modal-footer");
          this.mintModal.mouseOver(() => this.onOver());
          this.mintModal.mouseOut(() => {if(!this.isOut) this.onOut();});
          
          this.info = createDiv(`
            <h5>Pattern Info</h5>
            <div class="text-small ml-2">
              <p>
              Seed : #${tokenSeed} <br/>
              </p>
            </div>
          `);
          this.info.class("column");
          this.mintModal.body.child(this.info);
          
          // JWT Method
          this.jwtInput = new TextForm("JWT Key", this.param);
          this.jwtInput.addClass("column");
          this.jwtInput.parent(this.mintModal.body);
          
          this.mintModal.body.child(divider("Or", "text-center col-12"));
          
          // Secret API Key Method
          this.scecretKeyDiv = createDiv();
          this.scecretKeyDiv.class('column');
          this.keyInput = new TextForm("API Key", this.param);
          this.scecretKeyDiv.child(this.keyInput);
          this.secretInput = new TextForm("Secret Key", this.param);
          this.scecretKeyDiv.child(this.secretInput);
          this.mintModal.body.child(this.scecretKeyDiv);
          
          // Footer Mint Proceed Button
          const proceed = async () => { // Proceed Callback
            try {
              this.proceedBttn.addClass('loading');
              new Alert(`Minting process begins...`);
              
              // Set headers
              let headers = {};
              
              if (this.param["JWT Key"]) {
                headers.Authorization = `Bearer ${this.param["JWT Key"]}`;
              } else if (this.param["API Key"] && this.param["Secret Key"]) {
                headers.pinata_api_key = this.param["API Key"];
                headers.pinata_secret_api_key = this.param["Secret Key"];
              } else {
                throw "You do not put any authorization key.";
              }
              
              // Get a token seed from default seed
              tokenSeed = defaultSeed;
              setSeed(tokenSeed);
              
              // Preview Image
              new Alert(`Generating a preview image...`);
              //let _imageCanvas = crop().canvas;
              let _imageCanvas = boxGraphic.canvas;
              let base64Data = _imageCanvas.toDataURL("image/png");
              let base64 = await fetch(base64Data);
              let blob = await base64.blob();
              let imgResponse = await pinFileIPFS(setName(), blob, headers).then(response => {
                new Alert('Image Generation Complete', SUCCESS);
                return response.json();
              });

              new Alert(`Generating a metadata...`);
              let metadata = {
                title: "CheckerScopic" + "#" +defaultSeed,
                type: "object",
                properties: {
                    seed: {
                        type: "integer",
                        value: defaultSeed
                    },
                    image: {
                        type: "string",
                        value: "https://gateway.pinata.cloud/ipfs/"+imgResponse.IpfsHash
                    },
                    date: {
                        type: "string",
                        value: `${year()}.${month()}.${day()} ${hour()}:${minute()}:${second()}`
                    }
                }
              };
              
              let metadataResponse = await pinJsonIPFS(metadata, headers).then(response => {
                new Alert('Metadata Generation Complete', SUCCESS);
                return response.json();
              });
              
              let safeMint = await contract.safeMint(address, "https://gateway.pinata.cloud/ipfs/"+metadataResponse.IpfsHash).then(
                response => response,
                reject => {
                  unpin(imgResponse.IpfsHash, headers).then(response => new Alert('Unpin an image in IPFS', WARNING), reject => {throw reject;});
                  unpin(metadataResponse.IpfsHash, headers).then(response => new Alert('Unpin a metadata in IPFS', WARNING), reject => {throw reject;});
                  throw reject.message;
                }
              );
              if(safeMint) {
                new Alert('Minting Complete', SUCCESS);
                this.proceedBttn.removeClass('loading');
              }
            } catch (e) {
              this.proceedBttn.removeClass('loading');
              new Alert(e, ERROR);
              console.error(e);
            }
          }; // Proceed Callback
          
          this.proceedBttn = new Button("Let's Mint", proceed);
          this.mintModal.footer.child(this.proceedBttn);
        } // Minter Conditional End
        
        this.getSize();
      }).catch(err => console.error(err));
    };
    this.body.child(divider("Network"));
    this.connectBttn = new Button("Connect", connect);
    this.body.child(this.connectBttn);
    
    this.getSize();
    this.div.mouseOver(() => this.onOver());
    this.div.mouseOut(() => {if(!this.isOut) this.onOut();});
    // Return GUI element when it is created
    return this;
  }
  
  onOver() {
    this.isOver = true;
    this.isOut = !this.isOver;
  }
  
  onOut() {
    this.isOver = false;
    this.isOut = !this.isOver;
  }
  
  show() {
    this.div.removeClass("transparent");
    this.div.addClass("opaque");
    
    this.isHidden = false;
    this.isShown = !this.isHidden;
  }
  
  hide() {
    this.div.removeClass("opaque");
    this.div.addClass("transparent");
    
    this.isHidden = true;
    this.isShown = !this.isHidden;
  }
  
  getSize() {
    this.width = this.div.elt.clientWidth;
    this.height = this.div.elt.clientHeight;
    //console.log(this.width, this.height);
  }
  
  callParam() {
    return this.param;
  }
}

class SelectForm {
  constructor(name, array, target, callback) {
    target[name] = array[0];
    
    this.div = createDiv();
    this.div.id(name);
    this.div.class('form-group col-12');
    
    // Name Label
    this.name = createElement('label', name);
    this.name.class('form-label text-small');
    this.name.parent(this.div);
    
    // Select Input
    this.select = createElement('select');
    this.select.class('form-select');
    this.select.parent(this.div);
    
    for (const str of array) {
      let _option = createElement('option', str);
      this.select.child(_option);
    }
    
    this.select.elt.addEventListener('input', e => {
      let _i = parseInt(e.target.options.selectedIndex);
      target[name] = array[_i];
      let _value = {index:_i, value:target[name]};
      if(callback) callback.call(this, _value);
    });
    
    return this.div;
  }
}

class TextForm {
  constructor(name, target) {
    target[name] = null;
    
    this.div = createDiv();
    this.div.id(name);
    this.div.class('form-group col-12');
    
    // Name Label
    this.name = createElement('label', name);
    this.name.class('form-label text-small');
    this.name.parent(this.div);
    
    // Text Input
    this.text = createInput("", "text");
    this.text.class("col-12");
    this.text.parent(this.div);
    
    this.text.input(() => target[name] = this.text.value());
    
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

class Switch {
  constructor(name, desc, target) {
    this.div = createDiv();
    this.div.class('form-group col-12');
    
    // Name Label
    this.name = createElement('label', desc);
    this.name.class('form-switch text-small');
    this.name.parent(this.div);
    
    this.switchInput = createElement('input');
    this.switchInput.id(name);
    this.switchInput.attribute('type', 'checkbox');
    this.switchInput.parent(this.name);
    
    this.switchIcon = createElement('i');
    this.switchIcon.class('form-icon');
    this.switchIcon.parent(this.name);
    
    this.switchInput.elt.addEventListener('change', e => target[name] = e.target.checked);
    console.log();
    
    return this.div;
  }
}

class Alert {
  constructor(msg, status, container) {
    let statusClass = "toast-";
    switch(status) {
      case 1: statusClass += "success"; // Success
        break;
      case 2: statusClass += "warning"; // Warning
        break;
      case 3: statusClass += "error"; // Error
        break;
      default : statusClass += "primary";
    }
    
    if(!container) {
      container = select('#toastBox');
    }
    
    this.div = createDiv(`
      <button class="btn btn-clear float-right"></button>
      ${msg}
    `);

    this.div.class(`toast ${statusClass} my-1`);
    const closeBttn = select("button.btn-clear", this.div);
    closeBttn.elt.addEventListener('mouseup', () => this.div.remove());
    this.div.parent(container);    
  }
}
