'use strict';

import React from 'react';
import EventHandlers from './mixins/event-handlers';
import Helpers from './mixins/helpers';
import initialState from './initial-state';
import defaultProps from './default-props';
import classnames from 'classnames';
import assign from 'object-assign';

import {Track} from './track';
import {Dots} from './dots';
import {PrevArrow, NextArrow} from './arrows';

@EventHandlers
@Helpers
export class InnerSlider extends React.Component {
  static defaultProps = defaultProps;

  list = null;

  state = assign({}, initialState, {
    currentSlide: this.props.initialSlide
  });

  track = null;

  refHandlers = {
    list: ref => this.list = ref,
    track: ref => this.track = ref,
  };

  componentWillMount() {
    if (this.props.init) {
      this.props.init();
    }
    this.setState({
      mounted: true
    });
    var lazyLoadedList = [];
    for (var i = 0; i < React.Children.count(this.props.children); i++) {
      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
        lazyLoadedList.push(i);
      }
    }

    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
      this.setState({
        lazyLoadedList: lazyLoadedList
      });
    }
  }

  componentDidMount() {
    // Hack for autoplay -- Inspect Later
    this.initialize(this.props);
    this.adaptHeight();
    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
    }
  }

  componentWillUnmount() {
    if (this.animationEndCallback) {
      clearTimeout(this.animationEndCallback);
    }
    if (window.addEventListener) {
      window.removeEventListener('resize', this.onWindowResized);
    } else {
      window.detachEvent('onresize', this.onWindowResized);
    }
    if (this.state.autoPlayTimer) {
      window.clearInterval(this.state.autoPlayTimer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.slickGoTo != nextProps.slickGoTo) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('react-slick deprecation warning: slickGoTo prop is' +
          ' deprecated and it will be removed in next release. Use slickGoTo method instead')
      }
      this.changeSlide({
          message: 'index',
          index: nextProps.slickGoTo,
          currentSlide: this.state.currentSlide
      });
    } else if (this.state.currentSlide >= nextProps.children.length) {
      this.update(nextProps);
      this.changeSlide({
          message: 'index',
          index: nextProps.children.length - nextProps.slidesToShow,
          currentSlide: this.state.currentSlide
      });
    } else {
      this.update(nextProps);
    }
  }

  componentDidUpdate() {
    this.adaptHeight();
  }

  onWindowResized() {
    this.update(this.props);
    // animating state should be cleared while resizing, otherwise autoplay stops working
    this.setState({
      animating: false
    })
  }

  slickPrev() {
    this.changeSlide({message: 'previous'});
  }

  slickNext() {
    this.changeSlide({message: 'next'});
  }

  slickGoTo(slide) {
    typeof slide === 'number' && this.changeSlide({
      message: 'index',
      index: slide,
      currentSlide: this.state.currentSlide
    });
  }

  render() {
    var className = classnames('slick-initialized', 'slick-slider', this.props.className);

    var trackProps = {
      fade: this.props.fade,
      cssEase: this.props.cssEase,
      speed: this.props.speed,
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      focusOnSelect: this.props.focusOnSelect ? this.selectHandler : new Function(),
      currentSlide: this.state.currentSlide,
      lazyLoad: this.props.lazyLoad,
      lazyLoadedList: this.state.lazyLoadedList,
      rtl: this.props.rtl,
      slideWidth: this.state.slideWidth,
      slidesToShow: this.props.slidesToShow,
      slidesToScroll: this.props.slidesToScroll,
      slideCount: this.state.slideCount,
      trackStyle: this.state.trackStyle,
      variableWidth: this.props.variableWidth
    };

    var dots;

    if (this.props.dots === true && this.state.slideCount >= this.props.slidesToShow) {
      var dotProps = {
        dotsClass: this.props.dotsClass,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        currentSlide: this.state.currentSlide,
        slidesToScroll: this.props.slidesToScroll,
        clickHandler: this.changeSlide
      };

      dots = (<Dots {...dotProps} />);
    }

    var prevArrow, nextArrow;

    var arrowProps = {
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      slideCount: this.state.slideCount,
      slidesToShow: this.props.slidesToShow,
      prevArrow: this.props.prevArrow,
      nextArrow: this.props.nextArrow,
      clickHandler: this.changeSlide
    };

    if (this.props.arrows) {
      prevArrow = (<PrevArrow {...arrowProps} />);
      nextArrow = (<NextArrow {...arrowProps} />);
    }

    var centerPaddingStyle = null;

    if (this.props.vertical === false) {
      if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: ('0px ' + this.props.centerPadding)
        };
      }
    } else {
      if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: (this.props.centerPadding + ' 0px')
        };
      }
    }

    return (
      <div className={className} onMouseEnter={this.onInnerSliderEnter} onMouseLeave={this.onInnerSliderLeave}>
        {prevArrow}
        <div
          ref={this.refHandlers.list}
          className="slick-list"
          style={centerPaddingStyle}
          onMouseDown={this.swipeStart}
          onMouseMove={this.state.dragging ? this.swipeMove: null}
          onMouseUp={this.swipeEnd}
          onMouseLeave={this.state.dragging ? this.swipeEnd: null}
          onTouchStart={this.swipeStart}
          onTouchMove={this.state.dragging ? this.swipeMove: null}
          onTouchEnd={this.swipeEnd}
          onTouchCancel={this.state.dragging ? this.swipeEnd: null}
          onKeyDown={this.props.accessibility ? this.keyHandler : null}>
          <Track ref={this.refHandlers.track} {...trackProps}>
            {this.props.children}
          </Track>
        </div>
        {nextArrow}
        {dots}
      </div>
    );
  }
};

export default InnerSlider;
