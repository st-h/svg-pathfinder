import Component from '@ember/component';

export default Component.extend({

  classNames: ['command'],
  classNameBindings: ['command.selected:selected'],

  click(event) {
    this.onselect(this.command, event.altKey);
  },

  actions: {
    toggleRelative() {
      this.toggleProperty('command.relative');
      this.onchange();
    }
  }
});
