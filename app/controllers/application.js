import Controller from '@ember/controller';
import { SVGPathData, encodeSVGPath, SVGPathDataParser } from 'svg-pathdata';
import EmberObject from '@ember/object';
import Command from 'pathfinder/objects/command';
import { EKMixin, keyUp } from 'ember-keyboard';
import { on } from '@ember/object/evented';

export default Controller.extend(EKMixin, {

  svgNS: 'http://www.w3.org/2000/svg',

  selected: undefined,

  nudge: 0.1,

  init() {
    this._super(...arguments);
    this.selected = [];
    this.set('keyboardActivated', true);
  },

  right: on(keyUp('ArrowRight'), function() {
    this.selected.forEach((command) => {
      command.moveX(parseFloat(this.nudge));
    });
    this.encode();
  }),

  left: on(keyUp('ArrowLeft'), function() {
    this.selected.forEach((command) => {
      command.moveX(-parseFloat(this.nudge));
    });
    this.encode();
  }),

  up: on(keyUp('ArrowUp'), function() {
    this.selected.forEach((command) => {
      command.moveY(-parseFloat(this.nudge));
    });
    this.encode();
  }),

  down: on(keyUp('ArrowDown'), function() {
    this.selected.forEach((command) => {
      command.moveY(parseFloat(this.nudge));
    });
    this.encode();
  }),

  createSVG() {
    const svgElem = document.createElementNS(this.svgNS, 'svg');
    svgElem.setAttributeNS(null, "viewBox", this.viewBox.toString());
    const p = document.createElementNS(this.svgNS, 'path');
    p.setAttributeNS(null, "d", encodeSVGPath(this.getSVGPath()));

    svgElem.appendChild(p);
    return svgElem;
  },

  appendCircle(svgElem, x, y, color, radius) {
    const circle = document.createElementNS(this.svgNS, 'circle');
    circle.setAttributeNS(null, "cx", x);
    circle.setAttributeNS(null, "cy", y);
    circle.setAttributeNS(null, "fill", color);
    circle.setAttributeNS(null, "r", radius);
    svgElem.appendChild(circle);
  },

  appendLine(svgElem, x1, y1, x2, y2, color) {
    const line = document.createElementNS(this.svgNS, 'line');
    line.setAttributeNS(null, "x1", x1);
    line.setAttributeNS(null, "y1", y1);
    line.setAttributeNS(null, "x2", x2);
    line.setAttributeNS(null, "y2", y2);
    line.setAttributeNS(null, "stroke", color);
    line.setAttributeNS(null, "stroke-width", '0.02');
    svgElem.appendChild(line);
  },

  addControlPointsToSVG(svgElem, path) {
    let lastY;
    let lastX;

    for (let i = 0; i < path.length; i++) {
      const coordinates = path[i].abs;
      const x = coordinates.x;
      const y = coordinates.y;
      const radius = path[i].selected ? '0.2' : '0.1';

      this.appendCircle(svgElem,
        x !== undefined ? x.toString() : lastX.toString(),
        y !== undefined ? y.toString() : lastY.toString(),
        'red', radius);

      if (coordinates.x1 !== undefined && coordinates.y1 !== undefined) {
        this.appendLine(svgElem, coordinates.x, coordinates.y, coordinates.x1, coordinates.y1, 'blue');
        this.appendCircle(svgElem, coordinates.x1, coordinates.y1, 'blue', radius);
      }
      if (coordinates.x2 !== undefined && coordinates.y2 !== undefined) {
        this.appendLine(svgElem, coordinates.x, coordinates.y, coordinates.x2, coordinates.y2, 'green');
        this.appendCircle(svgElem, coordinates.x2, coordinates.y2, 'green', radius);
      }

      if (x !== undefined) {
        lastX = x;
      }
      if (y !== undefined) {
        lastY = y;
      }
    }
  },

  parseCode() {

  },

  /**
   * creates the svg element/code that is displayed in our editor
   **/
  createSVGDisplay() {
    const svgElem = this.createSVG(this.path);
    this.addControlPointsToSVG(svgElem, this.path);
    this.set('svgDisplay', svgElem.outerHTML)
  },

  /**
   * get the svg path in a format which svg-pathdata understands
   **/
  getSVGPath() {
    return this.path.map((command) => {
      return command.toSVGPathData();
    })
  },

  parse() {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(this.code, "image/svg+xml");

    const [x, y, width, height] = doc.documentElement.getAttribute('viewBox').split(' ');
    this.set('viewBox', new EmberObject({
      x: parseFloat(x),
      y: parseFloat(y),
      width: parseFloat(width),
      height: parseFloat(height),
      toString: function() {
        return this.get('x') + ' ' + this.get('y') + ' ' + this.get('width') + ' ' + this.get('height');
      }
    }));

    const svgParser = new SVGPathDataParser();
    const pathElement = doc.documentElement.getElementsByTagName('path')[0];
    const path = svgParser.parse(pathElement.getAttribute('d'));

    const absPath = new SVGPathData(pathElement.getAttribute('d')).toAbs().commands;
    const relPath = new SVGPathData(pathElement.getAttribute('d')).toRel().commands;

    const internalPath = [];
    for (let i = 0; i < path.length; i++) {
      const command = path[i];
      const absCommand = absPath[i];
      const relCommand = relPath[i];
      internalPath.push(new Command(command, relCommand, absCommand));
    }

    this.set('path', internalPath);
    //TODO currently transforms are not supported
    // https://stackoverflow.com/questions/17824145/parse-svg-transform-attribute-with-javascript
    // const transform = pathElement.getAttribute('transform');
    // console.log('transform: ' + transform);

    this.createSVGDisplay();
  },

  /**
   * grabs our internal path model and converts it to html (displayed in the editors code block)
   **/
  encode() {
    //TODO add https://github.com/svg/svgo
    // https://jakearchibald.github.io/svgomg/
    const svgElem = this.createSVG(this.getSVGPath());
    this.set('code', svgElem.outerHTML);
    this.createSVGDisplay();
  },

  actions: {
    // select or deselect an element. If add is true, the current selection gets added or removed.
    selected(element, add) {
      // if this element is selected, deselect it
      if (element.selected) {
        element.set('selected', false);
        this.selected.splice( this.selected.indexOf(element), 1 );
        this.createSVGDisplay();
        return;
      } else if (!add) {
        // only one element allowed, clear all previous selections
        this.selected.forEach((command) => {
          command.set('selected', false);
        })
        this.selected = [];
      }

      // add the new selection
      element.set('selected', true);
      this.selected.push(element);
      this.createSVGDisplay();
    },

    selectAll() {
      this.path.forEach((command) => {
        command.set('selected', true);
        this.selected.push(command);
      })
    },

    // convert all commands to absolute format
    switchToAbsolute() {
      this.path.forEach((command) => {
        command.set('relative', false);
      });
    },

    // convert all commands to relative format
    switchToRelative() {
      this.path.forEach((command) => {
        command.set('relative', true);
      });
    }
  }
});
