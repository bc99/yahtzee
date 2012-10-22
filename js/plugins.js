// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.

/**
* RETURN key binding for Knockout.js
*/
ko.bindingHandlers.returnKey = {
  init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
    ko.utils.registerEventHandler(element, 'keydown', function(evt) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        evt.target.blur();
        valueAccessor().call(viewModel);
      }
    });
  }
};

;(function($){
	
	var Bound = function(loweName, upperName){
		this.lowerName = lowerName || "lower";
		this.upperName = upperName || "upper";
	};
	Bound.prototype.calculateCutting = function(lower,upper,size,bound){
		this[this.lowerName] = lower;
		this[this.upperName] = upper;
		
		if(isNaN(bound) && upper>=size){
			if(bound==this.lowerName){
				this[this.upperName] = upper-(upper-size);
			}
			else if(bound==this.upperName){
				this[this.lowerName] = upper-size;
			}
			else{
				this[this.lowerName] = (upper/2)-(size/2);
				this[this.upperName] = (upper/2)+(size/2);
			}
		}else{
			if(bound<lower && upper>=size-bound){
				this[this.lowerName] = upper-(size-bound);
				this[this.upperName] = upper+bound;
			}
			else if(bound>=lower && upper>=size+bound){
				this[this.lowerName] = bound;
				this[this.upperName] = upper-(upper-size-bound);
			}
		}
	};
	
	var FrameCalculator = function(imgSize,frameSize,position){
		this.imgSize = imgSize;
		this.frameSize = frameSize;
		this.position = position;
	};
	
	FrameCalculator.prototype.fits = function(){
		return this.imgSize - this.position >= this.frameSize;
	};
	
	FrameCalculator.prototype.calculateFrameset = function(){
		return this.imgSize - ((this.imgSize - this.position) % this.frameSize);
	};
	
	var Frame = window.Frame = function(imgWidth, imgHeight, frameWidth, frameHeight, offsetX, offsetY){
		this.setImgSize(imgWidth, imgHeight);
		this.setFrameSize(frameWidth, frameHeight);
		this.setOffset(offsetX||0, offsetY||0);
	};
	
	Frame.prototype.setDefaultDuration = function(duration){
		this.duration = duration;
	};
	
	Frame.prototype.changeFrameDuration = function(index, duration){
		this.frames[index][4] = duration;
	};
	
	Frame.prototype.setImgSize = function(width, height){
		this.imageWidth = width;
		this.imageHeight = height;
	};
	
	Frame.prototype.setOffset = function(offsetX, offsetY){
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	};
	
	Frame.prototype.setFrameSize = function(width, height){
		this.frameWidth = width;
		this.frameHeight = height;
	};
	
	Frame.prototype.calculateFrames = function(){
		var fcx = new FrameCalculator(this.imageWidth,this.frameWidth,this.offsetX);
		var fcy = new FrameCalculator(this.imageHeight,this.frameHeight,this.offsetY);
		if(!fcx.fits() || !fcy.fits()) throw new Error("frame is bigger than image.");
		
		var imgWidth = fcx.calculateFrameset();
		var imgHeight = fcy.calculateFrameset();
		
		this.frames = [];
		
		// Berechne die Positionen der Einzelframes vor. Diese können direkt an die
		// CSS Clip-Eigenschaft übertragen werden.
		var i = 0;
		for(var y=0;y<imgHeight/this.frameHeight;y++){
			for(var x=0;x<imgWidth/this.frameWidth;x++){
				var top = y*this.frameHeight+this.offsetY;
				var bottom = top + this.frameHeight;
				var left = x*this.frameWidth+this.offsetX;
				var right = left + this.frameWidth;
				if(right<=this.imageWidth&&bottom<=this.imageHeight){
					this.frames[i++]=[top,right,bottom,left,this.duration];
				}
			}
		}
	};
	
	var Viewport = function(width, height){
		this.width = width;
		this.height = height;
	};
	
	Viewport.prototype.calculatePosition = function(pos){
		return {
			top: (pos[2] - pos[0] == this.height ? -pos[0] : (this.height - pos[2]) / 2), 
			left: (pos[1] - pos[3] == this.width ? -pos[3] : (this.width - pos[1]) / 2)
		};
	};
	
	var arr = [];
	
	Array.prototype.unique = function(){
		var arr = [];
		for(var k in this){
			for(var m in arr){
				if(arr[m-1]==this[k]){
					this.splice(k, 1);
				}
			};
			arr[k]=this[k];
		};
		delete arr;
		return this;
	};
	
	$.timer = $.extend({
		defaults: {
			type: "Timeout",
			callback: $.noop,
			delay: 50
		},
		
		_timerData: [],
		_enabled: true,
		
		_setTimer: function(s){
			s = $.extend(this.defaults, s || {});
			s.delay = s.delay >= this.defaults.delay 
					? s.delay : this.defaults.delay;
			var t = window["set"+s.type](s.callback, s.delay);
			this._timerData[t] = {
				type: s.type || this.defaults.type,
				callback: s.callback,
				delay: s.delay
			};
			this._timerData.unique();
			return t;
		},
		timeout: function(callback, delay){
			console.count('timeout');
			return this._setTimer({
				type: "Timeout",
				callback: callback,
				delay: delay
			});
		},
		interval: function(callback, delay){
			console.count('interval');
			return this._setTimer({
				type: "Interval",
				callback: callback,
				delay: delay
			});
		},
		
		clear: function(index, holdData){
			if(this._timerData[index] != undefined){
				window["clear"+this._timerData[index].type](index);
				if(!holdData) delete this._timerData[index];
			};
		},
		
		enable: function(){
			if(!this._enabled){
				for(var k in this._timerData){
					if(this._timerData[k]==undefined) continue;
					window["set"+this._timerData[k].type](this._timerData[k].callback, this._timerData[k].delay);
				};
				this._enabled = true;
			};
		},
		
		disable: function(){
			if(this._enabled){
				for(var k in this._timerData){
					if(this._timerData[k]==undefined) continue;
					window["clear"+this._timerData[k].type](k);
				};
				this._enabled = false;
			};
		}
	});
	
	$.timer = $.extend($.timer.timeout, $.timer, $.timer.prototype);
	
	$.widget("ui.clip", {
		
		options: {
			width: null,
			height: null,
			frameWidth: null,
			frameHeight: null,
			offsetX: 0,
			offsetY: 0,
			defaultDuration: 50
		},
		
		_init: function(){
			this._frame = new Frame(
					this.options.width,
					this.options.height,
					this.options.frameWidth,
					this.options.frameHeight,
					this.options.offsetX,
					this.options.offsetY);
			this._frame.setDefaultDuration(this.options.defaultDuration);
			this._frame.calculateFrames();
			
			this._index = 0;
			this._maxFrames = this._frame.frames.length;
			
			this._viewport = new Viewport(
					this.options.frameWidth,
					this.options.frameHeight);
		},
		
		destroy: function(){
			this.element.unwrap().css('position',this.element.data('origPosition'));
			this.element.removeData('origPosition');
			$.Widget.prototype.destroy.apply(this, arguments);
		},
		
		_changeView: function(frame){
			if(!this.element.parent().is('.ui-clip-wrapper')){
				this.element
				.data('origPosition', this.element.css('position'))
				.css("position", "absolute")
				.wrap($(document.createElement('span'))
				    .addClass('ui-clip-wrapper')
						.css({
							position: "relative",
							display: "block",
							width: this._frame.frameWidth,
							height: this._frame.frameHeight
						})
				);
			}
			
			var pos = this._viewport.calculatePosition(frame);
			this.element.css({
				clip: "rect("+
						frame[0]+"px,"+
						frame[1]+"px,"+
						frame[2]+"px,"+
						frame[3]+"px)",
				top: pos.top,
				left: pos.left
			});
		},
		
		frame: function(index){
			var frame = this._frame.frames[index-1];
			console.log('frame wird gewechselt zu ' + (index-1), this.element.closest('li')[0].id)
			if(!frame)
				throw new Error("frame " + index + " does not exists!");
			this._changeView(frame);
			return frame;
		},
		
		next: function(){
			this._prevIndex = this._index++;
			if(this._index>this._maxFrames) this._index=1;
			this.frame(this._index);
		},
		
		prev: function(){
			this._nextIndex = this._index--;
			if(this._index<1)this._index=this._maxFrames;
			this.frame(this._index);
		},
		
		_doAnimation: function(){
			var frame = this.frame(this._index++);
			if(this._index>this._lastFrame&&this._loop) this._index = this._firstFrame;
			if(this._index<=this._lastFrame)
				$.timer($.proxy(this._doAnimation, this), frame[4]);
		},
		
		animate: function(loop, firstFrame, lastFrame){
			this._loop = loop || false;
			this._firstFrame = firstFrame || 1;
			this._lastFrame = lastFrame || this._maxFrames;
			this._index = this._firstFrame;
			this._doAnimation();
		}
		
	});
	
	$.Image = function(o){
		var img = new Image();
		var args = Array.prototype.slice.call(arguments, 0);
		if(typeof o == "object"){
			$.extend(img, o);
		}else{
			img.src = args[0];
			if(typeof args[1] == "string") img.alt = args[1];
			if(typeof args[args.length-1] == "function")
				$(img).load(args[args.length-1]);
		}
		return $(img);
	};
	
})(jQuery);

