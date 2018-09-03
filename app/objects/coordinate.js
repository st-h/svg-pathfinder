import EmberObject from '@ember/object';

export default class Command extends EmberObject {
  constructor(original) {
    super();
    this.x = original.x;
    this.y = original.y;
    this.x1 = original.x1;
    this.y1 = original.y1;
    this.x2 = original.x2;
    this.y2 = original.y2;
  }

  moveX(d) {
    if (this.x !== undefined) {
      this.set('x', Math.round((this.x + d) * 100) / 100);
    }
    if (this.x1 !== undefined) {
      this.set('x1', Math.round((this.x1 + d) * 100) / 100);
    }
    if (this.x2 !== undefined) {
      this.set('x2', Math.round((this.x2 + d) * 100) / 100);
    }
  }

  moveY(d) {
    if (this.y !== undefined) {
      this.set('y', Math.round((this.y + d) * 100) / 100);
    }
    if (this.y1 !== undefined) {
      this.set('y1', Math.round((this.y1 + d) * 100) / 100);
    }
    if (this.y2 !== undefined) {
      this.set('y2', Math.round((this.y2 + d) * 100) / 100);
    }
  }
}
