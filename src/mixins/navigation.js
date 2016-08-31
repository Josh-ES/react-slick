'use strict';

import mixin from '../utils/mixin';
import ReactDOM from 'react-dom';

const navigation = mixin({
  getNavigableIndexes() {
    let max;
    let breakPoint = 0;
    let counter = 0;
    let indexes = [];

    if (!this.props.infinite) {
      max = this.state.slideCount;
    } else {
      breakPoint = this.props.slidesToShow * -1;
      counter = this.props.slidesToShow * -1;
      max = this.state.slideCount * 2;
    }

    while (breakPoint < max) {
      indexes.push(breakPoint);
      breakPoint = counter + this.props.slidesToScroll;

      counter += this.props.slidesToScroll <= this.props.slidesToShow ?
        this.props.slidesToScroll : this.props.slidesToShow;
    }

    return indexes;
  },

  checkNavigable(index) {
    const navigables = this.getNavigableIndexes();
    let prevNavigable = 0;

    if (index > navigables[navigables.length - 1]) {
      index = navigables[navigables.length - 1];
    } else {
      for (var n in navigables) {
        if (index < navigables[n]) {
          index = prevNavigable;
          break;
        }

        prevNavigable = navigables[n];
      }
    }

    return index;
  },

  getSlideCount() {
    const centerOffset = this.props.centerMode ? this.state.slideWidth * Math.floor(this.props.slidesToShow / 2) : 0;

    if (this.props.swipeToSlide) {
      let swipedSlide;

      const slickList = ReactDOM.findDOMNode(this.list);

      const slides = slickList.querySelectorAll('.slick-slide');

      Array.from(slides).every((slide, index) => {
        if (slide.offsetLeft - centerOffset + (helpers.getWidth(slide) / 2) > this.state.swipeLeft * -1) {
          swipedSlide = slide;
          return false;
        }

        return true;
      });

      const slidesTraversed = Math.abs(swipedSlide.dataset.index - this.state.currentSlide) || 1;

      return slidesTraversed;
    } else {
      return this.props.slidesToScroll;
    }
  },
});

export default navigation;
