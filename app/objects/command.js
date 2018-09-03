import EmberObject from '@ember/object';
import Coordinate from 'pathfinder/objects/coordinate';
import { computed } from '@ember/object';

export default class Command extends EmberObject.extend({
  displayType: computed('type', function() {
    switch(this.type) {
      case 1:
        return 'close';
      case 2:
        return 'move';
      case 4:
        return 'horizontal';
      case 8:
        return 'vertical';
      case 16:
        return 'line';
      case 32:
        return 'curve';
      case 64:
        return 'smooth-curve';
      case 128:
        return 'quad';
      case 256:
        return 'smooth-quad';
      case 512:
        return 'arc';
    }
  }),
  coordinates: computed('relative', function() {
    if (this.relative) {
      return this.rel;
    } else {
      return this.abs;
    }
  })
}) {

  constructor(original, rel, abs) {
    super();
    this.type = original.type;
    this.relative = original.relative;

    this.rel = new Coordinate(rel);
    this.abs = new Coordinate(abs);
  }

  toSVGPathData() {
    const ret =  {
      type: this.type,
      relative: this.relative
    }
    if (this.relative) {
      ret.x = Math.round(this.rel.x * 100) / 100;
      ret.y = Math.round(this.rel.y * 100) / 100;
      ret.x1 = Math.round(this.rel.x1 * 100) / 100;
      ret.y1 = Math.round(this.rel.y1 * 100) / 100;
      ret.x2 = Math.round(this.rel.x2 * 100) / 100;
      ret.y2 = Math.round(this.rel.y2 * 100) / 100;
    } else {
      ret.x = Math.round(this.abs.x * 100) / 100;
      ret.y = Math.round(this.abs.y * 100) / 100;
      ret.x1 = Math.round(this.abs.x1 * 100) / 100;
      ret.y1 = Math.round(this.abs.y1 * 100) / 100;
      ret.x2 = Math.round(this.abs.x2 * 100) / 100;
      ret.y2 = Math.round(this.abs.y2 * 100) / 100;
    }
    return ret;
  }

  moveX(d) {
    this.abs.moveX(d);
    this.rel.moveX(d);
  }
  moveY(d) {
    this.abs.moveY(d);
    this.rel.moveY(d);
  }

}
