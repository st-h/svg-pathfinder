import Component from '@ember/component';

export default Component.extend({

  tagName: '',

  onchange() { },

  actions: {
    setValue(x) {
      this.set('value', new Number(x));
      this.onchange();
    }
  }
});
