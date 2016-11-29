import Ember from 'ember';

const {
  $,
  Service
} = Ember;

/**
* Determines the absolute position of the viewport.
* Useful when making client rectangles absolute.
* @returns {number}
*/

const getViewportTop = function() {
  return window.scrollY || window.pageYOffset || 0;
};

export default Service.extend({

  /**
   * Disables scroll around the passed parent element.
   * @param element Unused
   * @param {!Element|!angular.JQLite} parent Element to disable scrolling within.
   *   Defaults to body if none supplied.
   * @param options Object of options to modify functionality
   *   - disableScrollMask Boolean of whether or not to create a scroll mask element or
   *     use the passed parent element.
   */
  disableScrollAround(element, parent, options) {
    options = options || {};

    this.disableScrollAround._count = Math.max(0, this.disableScrollAround._count || 0);
    this.disableScrollAround._count++;

    if (this.disableScrollAround._restoreScroll) {
      return this.disableScrollAround._restoreScroll;
    }

    let { body } = document;
    let restoreBody = disableBodyScroll();
    let restoreElement = disableElementScroll(parent);

    return this.disableScrollAround._restoreScroll = () => {
      if (--this.disableScrollAround._count <= 0) {
        restoreBody();
        restoreElement();
        delete this.disableScrollAround._restoreScroll;
      }
    };

    /**
     * Creates a virtual scrolling mask to prevent touchmove, keyboard, scrollbar clicking,
     * and wheel events
     */
    function disableElementScroll(element) {
      element = $(element || body);

      let scrollMask;

      if (options.disableScrollMask) {
        scrollMask = element;
      } else {
        scrollMask = $(
          `<div class="md-scroll-mask">
              <div class="md-scroll-mask-bar"></div>
          </div>`);
        element.append(scrollMask);
      }

      scrollMask.on('wheel', preventDefault);
      scrollMask.on('touchmove', preventDefault);

      return function restoreElementScroll() {
        scrollMask.off('wheel');
        scrollMask.off('touchmove');

        if (!options.disableScrollMask) {
          scrollMask[0].parentNode.removeChild(scrollMask[0]);
        }
      };

      function preventDefault(e) {
        e.preventDefault();
      }
    }

    // Converts the body to a position fixed block and translate it to the proper scroll position
    function disableBodyScroll() {
      let { documentElement } = document;

      let prevDocumentStyle = documentElement.style.cssText || '';
      let prevBodyStyle = body.style.cssText || '';

      let viewportTop = getViewportTop();
      let { clientWidth } = body;

      if (body.scrollHeight > body.clientHeight + 1) {

        $(body).css({
          position: 'fixed',
          width: '100%',
          top: `-${viewportTop}px`
        });

        documentElement.style.overflowY = 'scroll';
      }

      if (body.clientWidth < clientWidth) {
        body.style.overflow = 'hidden';
      }

      return function restoreScroll() {
        // Reset the inline style CSS to the previous.
        body.style.cssText = prevBodyStyle;
        documentElement.style.cssText = prevDocumentStyle;

        // The body loses its scroll position while being fixed.
        body.scrollTop = viewportTop;
      };
    }

  },

  enableScrolling() {
    let restoreFn = this.disableScrollAround._restoreScroll;
    if (restoreFn) {
      restoreFn();
    }
  }

});
