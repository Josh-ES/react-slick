'use strict';

import mixin from '../utils/mixin';
import {getTrackCSS, getTrackLeft, getTrackAnimateCSS} from './trackHelper';
import assign from 'object-assign';

const EventHandlers = mixin({
  // Event handler for previous and next
  changeSlide(options) {
    var indexOffset, previousInt, slideOffset, unevenOffset, targetSlide;
    const {slidesToScroll, slidesToShow} = this.props
    const {slideCount, currentSlide} = this.state
    unevenOffset = (slideCount % slidesToScroll !== 0);
    indexOffset = unevenOffset ? 0 : (slideCount - currentSlide) % slidesToScroll;

    if (options.message === 'previous') {
      slideOffset = (indexOffset === 0) ? slidesToScroll : slidesToShow - indexOffset;
      targetSlide = currentSlide - slideOffset;
      if (this.props.lazyLoad) {
        previousInt = currentSlide - slideOffset;
        targetSlide = previousInt === -1 ? slideCount -1 : previousInt;
      }
    } else if (options.message === 'next') {
      slideOffset = (indexOffset === 0) ? slidesToScroll : indexOffset;
      targetSlide = currentSlide + slideOffset;
      if (this.props.lazyLoad) {
        targetSlide = ((currentSlide + slidesToScroll) % slideCount) + indexOffset;
      }
    } else if (options.message === 'dots' || options.message === 'children') {
      // Click on dots
      targetSlide = options.index * options.slidesToScroll;
      if (targetSlide === options.currentSlide) {
        return;
      }
    } else if (options.message === 'index') {
      targetSlide = parseInt(options.index);
      if (targetSlide === options.currentSlide) {
        return;
      }
    }

    this.slideHandler(targetSlide);
  },
 
  // Accessiblity handler for previous and next
  keyHandler(e) {
    //Dont slide if the cursor is inside the form fields and arrow keys are pressed
    if(!e.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
        if (e.keyCode === 37 && this.props.accessibility === true) {
            this.changeSlide({
              message: this.props.rtl === true ? 'next' :  'previous'
            });
        } else if (e.keyCode === 39 && this.props.accessibility === true) {
            this.changeSlide({
              message: this.props.rtl === true ? 'previous' : 'next'
            });
        }
    }
  },
  // Focus on selecting a slide (click handler on track)
  selectHandler(options) {
    this.changeSlide(options)
  },
  swipeStart(e) {
    var touches, posX, posY;

    if ((this.props.swipe === false) || ('ontouchend' in document && this.props.swipe === false)) {
      return;
    } else if (this.props.draggable === false && e.type.indexOf('mouse') !== -1) {
      return;
    }
    posX = (e.touches !== undefined) ? e.touches[0].pageX : e.clientX;
    posY = (e.touches !== undefined) ? e.touches[0].pageY : e.clientY;
    this.setState({
      dragging: true,
      touchObject: {
        startX: posX,
        startY: posY,
        curX: posX,
        curY: posY
      }
    });
  },
  swipeMove(e) {
    if (!this.state.dragging) {
      e.preventDefault();
      return;
    }
    if (this.state.animating) {
      return;
    }
    var swipeLeft;
    var curLeft, positionOffset;
    var touchObject = this.state.touchObject;

    curLeft = getTrackLeft(assign({
      slideIndex: this.state.currentSlide,
      trackRef: this.track
    }, this.props, this.state));

    touchObject.curX = (e.touches) ? e.touches[0].pageX : e.clientX;
    touchObject.curY = (e.touches) ? e.touches[0].pageY : e.clientY;
    touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(touchObject.curX - touchObject.startX, 2)));

    if (this.props.verticalSwiping) {
      touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(touchObject.curY - touchObject.startY, 2)));
    }

    positionOffset = (this.props.rtl === false ? 1 : -1) * (touchObject.curX > touchObject.startX ? 1 : -1);

    if (this.props.verticalSwiping) {
      positionOffset = touchObject.curY > touchObject.startY ? 1 : -1;
    }

    var currentSlide = this.state.currentSlide;
    var dotCount = Math.ceil(this.state.slideCount / this.props.slidesToScroll);
    var swipeDirection = this.swipeDirection(this.state.touchObject);
    var touchSwipeLength = touchObject.swipeLength;

    if (this.props.infinite === false) {
      if ((currentSlide === 0 && swipeDirection === 'right') || (currentSlide + 1 >= dotCount && swipeDirection === 'left')) {
        touchSwipeLength = touchObject.swipeLength * this.props.edgeFriction;

        if (this.state.edgeDragged === false && this.props.edgeEvent) {
          this.props.edgeEvent(swipeDirection);
          this.setState({ edgeDragged: true });
        }
      }
    }

    if (this.state.swiped === false && this.props.swipeEvent) {
      this.props.swipeEvent(swipeDirection);
      this.setState({ swiped: true });
    }

    if (!this.props.vertical) {
      swipeLeft = curLeft + touchSwipeLength * positionOffset;
    } else {
      swipeLeft = curLeft + (touchSwipeLength * (this.state.listHeight / this.state.listWidth)) * positionOffset;
    }

    if (this.props.verticalSwiping) {
      swipeLeft = curLeft + touchSwipeLength * positionOffset;
    }

    this.setState({
      touchObject: touchObject,
      swipeLeft: swipeLeft,
      trackStyle: getTrackCSS(assign({left: swipeLeft}, this.props, this.state))
    });

    if (Math.abs(touchObject.curX - touchObject.startX) < Math.abs(touchObject.curY - touchObject.startY) * 0.8)
      { return; }
    if (touchObject.swipeLength > 4) {
      e.preventDefault();
    }
  },
  swipeEnd(e) {
    if (!this.state.dragging) {
      e.preventDefault();
      return;
    }
    var touchObject = this.state.touchObject;
    var minSwipe = this.state.listWidth/this.props.touchThreshold;
    var swipeDirection = this.swipeDirection(touchObject);

    if (this.props.verticalSwiping) {
      minSwipe = this.state.listHeight/this.props.touchThreshold;
    }

    // reset the state of touch related state variables.
    this.setState({
      dragging: false,
      edgeDragged: false,
      swiped: false,
      swipeLeft: null,
      touchObject: {}
    });
    // Fix for #13
    if (!touchObject.swipeLength) {
      return;
    }
    if (touchObject.swipeLength > minSwipe) {
      e.preventDefault();
      if (swipeDirection === 'left') {
        this.slideHandler(this.state.currentSlide + this.props.slidesToScroll);
      } else if (swipeDirection === 'right') {
        this.slideHandler(this.state.currentSlide - this.props.slidesToScroll);
      } else {
        this.slideHandler(this.state.currentSlide);
      }
    } else {
      // Adjust the track back to it's original position.
      var currentLeft = getTrackLeft(assign({
        slideIndex: this.state.currentSlide,
        trackRef: this.track
      }, this.props, this.state));

      this.setState({
        trackStyle: getTrackAnimateCSS(assign({left: currentLeft}, this.props, this.state))
      });
    }
  },
  onInnerSliderEnter(e) {
    if (this.props.autoplay && this.props.pauseOnHover) {
      this.pause();
    }
  },
  onInnerSliderLeave(e) {
    if (this.props.autoplay && this.props.pauseOnHover) {
      this.autoPlay();
    }
  }
});

export default EventHandlers;
