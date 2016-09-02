'use strict';

exports.__esModule = true;
exports.InnerSlider = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _class2, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _eventHandlers = require('./mixins/event-handlers');

var _eventHandlers2 = _interopRequireDefault(_eventHandlers);

var _helpers = require('./mixins/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _navigation = require('./mixins/navigation');

var _navigation2 = _interopRequireDefault(_navigation);

var _initialState = require('./initial-state');

var _initialState2 = _interopRequireDefault(_initialState);

var _defaultProps = require('./default-props');

var _defaultProps2 = _interopRequireDefault(_defaultProps);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _track = require('./track');

var _dots = require('./dots');

var _arrows = require('./arrows');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InnerSlider = exports.InnerSlider = (0, _eventHandlers2.default)(_class = (0, _helpers2.default)(_class = (0, _navigation2.default)(_class = (_temp = _class2 = function (_React$Component) {
  _inherits(InnerSlider, _React$Component);

  function InnerSlider(props, context) {
    _classCallCheck(this, InnerSlider);

    // bind all event handling methods to this
    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _this.list = null;
    _this.state = (0, _objectAssign2.default)({}, _initialState2.default, {
      currentSlide: _this.props.initialSlide
    });
    _this.track = null;
    _this.refHandlers = {
      list: function list(ref) {
        return _this.list = ref;
      },
      track: function track(ref) {
        return _this.track = ref;
      }
    };
    _this.changeSlide = _this.changeSlide.bind(_this);
    _this.keyHandler = _this.keyHandler.bind(_this);
    _this.onInnerSliderEnter = _this.onInnerSliderEnter.bind(_this);
    _this.onInnerSliderLeave = _this.onInnerSliderLeave.bind(_this);
    _this.onWindowResized = _this.onWindowResized.bind(_this);
    _this.selectHandler = _this.selectHandler.bind(_this);
    _this.swipeEnd = _this.swipeEnd.bind(_this);
    _this.swipeMove = _this.swipeMove.bind(_this);
    _this.swipeStart = _this.swipeStart.bind(_this);
    return _this;
  }

  InnerSlider.prototype.componentWillMount = function componentWillMount() {
    if (this.props.init) {
      this.props.init();
    }
    this.setState({
      mounted: true
    });
    var lazyLoadedList = [];
    for (var i = 0; i < _react2.default.Children.count(this.props.children); i++) {
      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
        lazyLoadedList.push(i);
      }
    }

    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
      this.setState({
        lazyLoadedList: lazyLoadedList
      });
    }
  };

  InnerSlider.prototype.componentDidMount = function componentDidMount() {
    // Hack for autoplay -- Inspect Later
    this.initialize(this.props);
    this.adaptHeight();
    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
    }
  };

  InnerSlider.prototype.componentWillUnmount = function componentWillUnmount() {
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
  };

  InnerSlider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (this.props.slickGoTo != nextProps.slickGoTo) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('react-slick deprecation warning: slickGoTo prop is' + ' deprecated and it will be removed in next release. Use slickGoTo method instead');
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
  };

  InnerSlider.prototype.componentDidUpdate = function componentDidUpdate() {
    this.adaptHeight();
  };

  InnerSlider.prototype.onWindowResized = function onWindowResized() {
    this.update(this.props);
    // animating state should be cleared while resizing, otherwise autoplay stops working
    this.setState({
      animating: false
    });
  };

  InnerSlider.prototype.slickPrev = function slickPrev() {
    this.changeSlide({ message: 'previous' });
  };

  InnerSlider.prototype.slickNext = function slickNext() {
    this.changeSlide({ message: 'next' });
  };

  InnerSlider.prototype.slickGoTo = function slickGoTo(slide) {
    typeof slide === 'number' && this.changeSlide({
      message: 'index',
      index: slide,
      currentSlide: this.state.currentSlide
    });
  };

  InnerSlider.prototype.render = function render() {
    var className = (0, _classnames2.default)('slick-initialized', 'slick-slider', this.props.className, {
      'slick-vertical': this.props.vertical
    });

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

      dots = _react2.default.createElement(_dots.Dots, dotProps);
    }

    var prevArrow, nextArrow, verticalHeightStyle;

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
      prevArrow = _react2.default.createElement(_arrows.PrevArrow, arrowProps);
      nextArrow = _react2.default.createElement(_arrows.NextArrow, arrowProps);
    }

    if (this.props.vertical) {
      verticalHeightStyle = {
        height: this.state.listHeight
      };
    }

    var centerPaddingStyle = null;

    if (this.props.vertical === false) {
      if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: '0px ' + this.props.centerPadding
        };
      }
    } else {
      if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: this.props.centerPadding + ' 0px'
        };
      }
    }

    var listStyle = (0, _objectAssign2.default)({}, verticalHeightStyle, centerPaddingStyle);

    return _react2.default.createElement(
      'div',
      { className: className, onMouseEnter: this.onInnerSliderEnter, onMouseLeave: this.onInnerSliderLeave },
      prevArrow,
      _react2.default.createElement(
        'div',
        {
          ref: this.refHandlers.list,
          className: 'slick-list',
          style: listStyle,
          onMouseDown: this.swipeStart,
          onMouseMove: this.state.dragging ? this.swipeMove : null,
          onMouseUp: this.swipeEnd,
          onMouseLeave: this.state.dragging ? this.swipeEnd : null,
          onTouchStart: this.swipeStart,
          onTouchMove: this.state.dragging ? this.swipeMove : null,
          onTouchEnd: this.swipeEnd,
          onTouchCancel: this.state.dragging ? this.swipeEnd : null,
          onKeyDown: this.props.accessibility ? this.keyHandler : null },
        _react2.default.createElement(
          _track.Track,
          _extends({ ref: this.refHandlers.track }, trackProps),
          this.props.children
        )
      ),
      nextArrow,
      dots
    );
  };

  return InnerSlider;
}(_react2.default.Component), _class2.defaultProps = _defaultProps2.default, _temp)) || _class) || _class) || _class;

;

exports.default = InnerSlider;