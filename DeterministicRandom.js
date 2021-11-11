class P5DeterministicRandomWithHexSeed {
  constructor(seed) {
    if (seed.startsWith('0x')) {
      seed = seed.substr(2);
    }
    this.seed = seed;
    this.seedIndex = 0;
    this.nextRandomSequence();
  }

  random() {
    return random();
  }

  nextRandomSequence() {
    // get current seed
    const e = this.seed.substr(this.seedIndex, 6);
    
    // increment seedIndex for later call
    this.seedIndex += 6;
    
    // if it's too near the end, add again and modulo
    if (this.seedIndex >= this.seed.length - 6) {
      this.seedIndex = (this.seedIndex + 6) % this.seed.length;
    }

    randomSeed(parseInt(e, 16));
  }
}
