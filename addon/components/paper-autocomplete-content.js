import Ember from 'ember';
import ContentComponent from 'ember-basic-dropdown/components/basic-dropdown/content';
import layout from '../templates/components/paper-autocomplete-content';

const { computed } = Ember;

export default ContentComponent.extend({
  layout,

  itemHeight: 48,
  maxHeight: 240,

  desiredHeight: computed('select.{resultsCount,loading,searchText}', 'maxHeight', 'itemHeight', function() {

    if (this.get('select.loading')) {
      return 0;
    }

    // Angular material uses .ng-hide class
    let itemsCount = this.get('select.resultsCount');

    if (!this.get('select.searchText') && !itemsCount) {
      return 0;
    }

    let maxHeight = this.get('maxHeight');
    let itemHeight = this.get('itemHeight');

    if (!itemsCount) {
      return itemHeight;
    }

    if ((itemHeight * itemsCount) > maxHeight) {
      return maxHeight;
    }

    return itemHeight * itemsCount;

  }).readOnly()
});
