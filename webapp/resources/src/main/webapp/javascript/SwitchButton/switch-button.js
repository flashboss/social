(function($) {
  var iOSCheckbox;
  var __slice = Array.prototype.slice;
  iOSCheckbox = (function() {
    function iOSCheckbox(elem, options) {
      var key, opts, value;
      this.elem = $(elem);
      opts = $.extend({}, iOSCheckbox.defaults, options);
      for (key in opts) {
        value = opts[key];
        this[key] = value;
      }
      this.elem.data(this.dataName, this);
      this.wrapCheckboxWithDivs();
      this.attachEvents();
      this.disableTextSelection();
      
      this.container.css({
        width: this.containerWidth
      });
      
      if (this.resizeHandle) {
        this.optionallyResize('handle');
      }
      
      this.initialPosition();
    }
    iOSCheckbox.prototype.isDisabled = function() {
      return this.elem.is(':disabled');
    };
    iOSCheckbox.prototype.wrapCheckboxWithDivs = function() {
      this.elem.wrap("<div class='" + this.containerClass + "' />");
      this.container = this.elem.parent();
      this.offLabel = $("<label class='" + this.labelOffClass + "'>\n  <span>" + this.uncheckedLabel + "</span>\n</label>").appendTo(this.container);
      this.offSpan = this.offLabel.children('span');
      this.onLabel = $("<label class='" + this.labelOnClass + "'>\n  <span>" + this.checkedLabel + "</span>\n</label>").appendTo(this.container);
      this.onSpan = this.onLabel.children('span');
      return this.handle = $("<div class='" + this.handleClass + "'>\n  <div class='" + this.handleRightClass + "'>\n    <div class='" + this.handleCenterClass + "' />\n  </div>\n</div>").appendTo(this.container);
    };
    iOSCheckbox.prototype.disableTextSelection = function() {
      if ($.browser.msie) {
        return $([this.handle, this.offLabel, this.onLabel, this.container]).attr("unselectable", "on");
      }
    };
    iOSCheckbox.prototype._getDimension = function(elem, dimension) {
      if ($.fn.actual != null) {
        return elem.actual(dimension);
      } else {
        return elem[dimension]();
      }
    };
    iOSCheckbox.prototype.optionallyResize = function(mode) {
      var newWidth, offLabelWidth, onLabelWidth;
      onLabelWidth = this._getDimension(this.onLabel, "width");
      offLabelWidth = this._getDimension(this.offLabel, "width");
      if (mode === "container") {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        newWidth += this._getDimension(this.handle, "width") + this.handleMargin;
        return this.container.css({
          width: newWidth
        });
      } else {
        newWidth = onLabelWidth > offLabelWidth ? onLabelWidth : offLabelWidth;
        return this.handle.css({
          width: newWidth
        });
      }
    };
    iOSCheckbox.prototype.onMouseDown = function(event) {
      var x;
      event.preventDefault();
      if (this.isDisabled()) {
        return;
      }
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      iOSCheckbox.currentlyClicking = this.handle;
      iOSCheckbox.dragStartPosition = x;
      return iOSCheckbox.handleLeftOffset = parseInt(this.handle.css('left'), 10) || 0;
    };
    iOSCheckbox.prototype.onDragMove = function(event, x) {
      var newWidth, p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      p = (x + iOSCheckbox.handleLeftOffset - iOSCheckbox.dragStartPosition) / this.rightSide;
      if (p < 0) {
        p = 0;
      }
      if (p > 1) {
        p = 1;
      }
      newWidth = p * this.rightSide;
      this.handle.css({
        left: newWidth
      });
      this.onLabel.css({
        width: newWidth + this.handleRadius
      });
      this.offSpan.css({
        marginRight: -newWidth
      });
      return this.onSpan.css({
        marginLeft: -(1 - p) * this.rightSide
      });
    };
    iOSCheckbox.prototype.onDragEnd = function(event, x) {
      var p;
      if (iOSCheckbox.currentlyClicking !== this.handle) {
        return;
      }
      if (this.isDisabled()) {
        return;
      }
      if (iOSCheckbox.dragging) {
        p = (x - iOSCheckbox.dragStartPosition) / this.rightSide;
        this.elem.prop('checked', p >= 0.5);
      } else {
        this.elem.prop('checked', !this.elem.prop('checked'));
      }
      iOSCheckbox.currentlyClicking = null;
      iOSCheckbox.dragging = null;
      return this.didChange();
    };
    iOSCheckbox.prototype.refresh = function() {
      return this.didChange();
    };
    iOSCheckbox.prototype.didChange = function() {
      var new_left;
      if (typeof this.onChange === "function") {
        this.onChange(this.elem, this.elem.prop('checked'));
      }
      if (this.isDisabled()) {
        this.container.addClass(this.disabledClass);
        return false;
      } else {
        this.container.removeClass(this.disabledClass);
      }
      new_left = this.elem.prop('checked') ? this.rightSide : 1;
      this.handle.animate({
        left: new_left
      }, this.duration);
      
      this.onLabel.animate({
        width: (new_left + this.handleRadius + 6)
      }, this.duration);
      
      this.offSpan.animate({
        marginRight: -new_left
      }, this.duration);
      
      return this.onSpan.animate({
        marginLeft: new_left - this.rightSide
      }, this.duration);
    };
    iOSCheckbox.prototype.attachEvents = function() {
      var localMouseMove, localMouseUp, self;
      self = this;
      localMouseMove = function(event) {
        return self.onGlobalMove.apply(self, arguments);
      };
      localMouseUp = function(event) {
        self.onGlobalUp.apply(self, arguments);
        $(document).unbind('mousemove touchmove', localMouseMove);
        return $(document).unbind('mouseup touchend', localMouseUp);
      };
      return this.container.bind('mousedown touchstart', function(event) {
        self.onMouseDown.apply(self, arguments);
        $(document).bind('mousemove touchmove', localMouseMove);
        return $(document).bind('mouseup touchend', localMouseUp);
      });
    };
    iOSCheckbox.prototype.initialPosition = function() {
      var containerWidth, offset;
      containerWidth = this._getDimension(this.container, "width");
      this.offLabel.css({
        width: (containerWidth - this.containerRadius - 4)
      });
      offset = this.containerRadius - 4;
      if ($.browser.msie && $.browser.version < 7) {
        offset -= 3;
      }
      this.rightSide = containerWidth - this._getDimension(this.handle, "width")  - offset;
      
      if (this.elem.is(':checked')) {
        this.handle.css({
          left: this.rightSide
        });
        this.onLabel.css({
          width: this.rightSide + this.handleRadius + 5
        });
        this.offSpan.css({
          marginRight: -this.rightSide
        });
      } else {
        this.onLabel.css({
          width: 9
        });
        this.onSpan.css({
          marginLeft: -this.rightSide
        });
      }
      if (this.isDisabled()) {
        return this.container.addClass(this.disabledClass);
      }
    };
    iOSCheckbox.prototype.onGlobalMove = function(event) {
      var x;
      if (!(!this.isDisabled() && iOSCheckbox.currentlyClicking)) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      if (!iOSCheckbox.dragging && (Math.abs(iOSCheckbox.dragStartPosition - x) > this.dragThreshold)) {
        iOSCheckbox.dragging = true;
      }
      return this.onDragMove(event, x);
    };
    iOSCheckbox.prototype.onGlobalUp = function(event) {
      var x;
      if (!iOSCheckbox.currentlyClicking) {
        return;
      }
      event.preventDefault();
      x = event.pageX || event.originalEvent.changedTouches[0].pageX;
      this.onDragEnd(event, x);
      return false;
    };
    iOSCheckbox.defaults = {
      duration: 200,
      checkedLabel: 'ON',
      uncheckedLabel: 'OFF',
      resizeHandle: false,
      resizeContainer: true,
      disabledClass: 'switchBtnDisabled',
	  containerClass: 'uiSwitchBtn',
	  labelOnClass: 'switchBtnLabelOn',
	  labelOffClass: 'switchBtnLabelOff',
	  handleClass: 'switchBtnHandle',
	  handleCenterClass: 'switchBtnHandleCenter',
	  handleRightClass: 'switchBtnHandleRight',
	  dragThreshold: 5,
	  handleMargin: 15,
	  handleRadius: 4,
	  containerWidth: 60,
	  containerRadius: 5,
	  dataName: "iphoneStyle",
      onChange: function() {}
    };
    return iOSCheckbox;
  })();
  $.iphoneStyle = this.iOSCheckbox = iOSCheckbox;
  $.fn.iphoneStyle = function() {
    var args, checkbox, dataName, existingControl, method, params, _i, _len, _ref, _ref2, _ref3, _ref4;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dataName = (_ref = (_ref2 = args[0]) != null ? _ref2.dataName : void 0) != null ? _ref : iOSCheckbox.defaults.dataName;
    _ref3 = this.filter(':checkbox');
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      checkbox = _ref3[_i];
      existingControl = $(checkbox).data(dataName);
      if (existingControl != null) {
        method = args[0], params = 2 <= args.length ? __slice.call(args, 1) : [];
        if ((_ref4 = existingControl[method]) != null) {
          _ref4.apply(existingControl, params);
        }
      } else {
        new iOSCheckbox(checkbox, args[0]);
      }
    }
    return this;
  };
  $.fn.iOSCheckbox = function(options) {
    var opts;
    if (options == null) {
      options = {};
    }
    opts = $.extend({}, options, {
      resizeHandle: false,
      disabledClass: 'switchBtnDisabled',
	  containerClass: 'uiSwitchBtn',
	  labelOnClass: 'switchBtnLabelOn',
	  labelOffClass: 'switchBtnLabelOff',
	  handleClass: 'switchBtnHandle',
	  handleCenterClass: 'switchBtnHandleCenter',
	  handleRightClass: 'switchBtnHandleRight',
      dragThreshold: 5,
      handleMargin: 15,
      handleRadius: 4,
      containerWidth: 60,
      containerRadius: 5,
      dataName: 'iOSCheckbox'
    });
    return this.iphoneStyle(opts);
  };
})(gj);
