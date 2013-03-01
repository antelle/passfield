/*
 * jquery.simulate - simulate browser mouse and keyboard events
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

;(function( $ ) {
	"use strict";

var rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rdocument = /\[object (?:HTML)?Document\]/;

function isDocument(ele) {
	return rdocument.test(Object.prototype.toString.call(ele));
}

function windowOfDocument(doc) {
	for (var i=0; i < window.frames.length; i+=1) {
		if (window.frames[i].document === doc) {
			return window.frames[i];
		}
	}
	return window;
}

$.fn.simulate = function( type, options ) {
	return this.each(function() {
		new $.simulate( this, type, options );
	});
};

$.simulate = function( elem, type, options ) {
	var method = $.camelCase( "simulate-" + type );

	this.target = elem;
	this.options = options || {};

	if ( this[ method ] ) {
		this[ method ]();
	} else {
		this.simulateEvent( elem, type, this.options );
	}
};

$.extend( $.simulate.prototype, {
	simulateEvent: function( elem, type, options ) {
		var event = this.createEvent( type, options );
		this.dispatchEvent( elem, type, event, options );
	},

	createEvent: function( type, options ) {
		if ( rkeyEvent.test( type ) ) {
			return this.keyEvent( type, options );
		}

		if ( rmouseEvent.test( type ) ) {
			return this.mouseEvent( type, options );
		}
	},

	mouseEvent: function( type, options ) {
		var event,
			eventDoc,
			doc = isDocument(this.target)? this.target : (this.target.ownerDocument || document),
			docEle,
			body;
		
		
		options = $.extend({
			bubbles: true,
			cancelable: (type !== "mousemove"),
			view: windowOfDocument(doc),
			detail: 0,
			screenX: 0,
			screenY: 0,
			// TODO: default clientX/Y to a position within the target element
			clientX: 1,
			clientY: 1,
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			button: 0,
			relatedTarget: undefined
		}, options );

		
		
		if ( doc.createEvent ) {
			event = doc.createEvent( "MouseEvents" );
			event.initMouseEvent( type, options.bubbles, options.cancelable,
				options.view, options.detail,
				options.screenX, options.screenY, options.clientX, options.clientY,
				options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
				options.button, options.relatedTarget || doc.body.parentNode );

			// IE 9+ creates events with pageX and pageY set to 0.
			// Trying to modify the properties throws an error,
			// so we define getters to return the correct values.
			if ( event.pageX === 0 && event.pageY === 0 && Object.defineProperty ) {
				eventDoc = isDocument(event.relatedTarget)? event.relatedTarget : (event.relatedTarget.ownerDocument || document);
				docEle = eventDoc.documentElement;
				body = eventDoc.body;

				Object.defineProperty( event, "pageX", {
					get: function() {
						return options.clientX +
							( docEle && docEle.scrollLeft || body && body.scrollLeft || 0 ) -
							( docEle && docEle.clientLeft || body && body.clientLeft || 0 );
					}
				});
				Object.defineProperty( event, "pageY", {
					get: function() {
						return options.clientY +
							( docEle && docEle.scrollTop || body && body.scrollTop || 0 ) -
							( docEle && docEle.clientTop || body && body.clientTop || 0 );
					}
				});
			}
		} else if ( doc.createEventObject ) {
			event = doc.createEventObject();
			$.extend( event, options );
			// TODO: what is this mapping for?
			event.button = { 0:1, 1:4, 2:2 }[ event.button ] || event.button;
		}

		return event;
	},

	keyEvent: function( type, options ) {
		var event, doc;
		options = $.extend({
			bubbles: true,
			cancelable: true,
			view: windowOfDocument(doc),
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			keyCode: 0,
			charCode: undefined
		}, options );

		doc = isDocument(this.target)? this.target : (this.target.ownerDocument || document);
		if ( doc.createEvent ) {
			try {
				event = doc.createEvent( "KeyEvents" );
				event.initKeyEvent( type, options.bubbles, options.cancelable, options.view,
					options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
					options.keyCode, options.charCode );
			// TODO: what is this supporting?
			} catch( err ) {
				event = doc.createEvent( "Events" );
				event.initEvent( type, options.bubbles, options.cancelable );
				$.extend( event, {
					view: options.view,
					ctrlKey: options.ctrlKey,
					altKey: options.altKey,
					shiftKey: options.shiftKey,
					metaKey: options.metaKey,
					keyCode: options.keyCode,
					charCode: options.charCode
				});
			}
		} else if ( doc.createEventObject ) {
			event = doc.createEventObject();
			$.extend( event, options );
		}

		// TODO: can we hook into core's logic?
		//if ( $.browser.msie || $.browser.opera ) {
        try {
			// TODO: is charCode ever <0 ? Can we just use charCode || keyCode?
			event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
			event.charCode = undefined;
        } catch (err) {}
		//}

		return event;
	},

	// TODO: does this need type? Can't we just check event.type?
	dispatchEvent: function( elem, type, event ) {
		if ( elem.dispatchEvent ) {
			elem.dispatchEvent( event );
		} else if ( elem.fireEvent ) {
			elem.fireEvent( "on" + type, event );
		}
	},

	simulateFocus: function() {
		var focusinEvent,
			triggered = false,
			element = $( this.target );

		function trigger() {
			triggered = true;
		}

		element.bind( "focus", trigger );
		element[ 0 ].focus();

		if ( !triggered ) {
			focusinEvent = $.Event( "focusin" );
			focusinEvent.preventDefault();
			element.trigger( focusinEvent );
			element.triggerHandler( "focus" );
		}
		element.unbind( "focus", trigger );
	},

	simulateBlur: function() {
		var focusoutEvent,
			triggered = false,
			element = $( this.target );

		function trigger() {
			triggered = true;
		}

		element.bind( "blur", trigger );
		element[ 0 ].blur();

		// blur events are async in IE
		setTimeout(function() {
			// IE won't let the blur occur if the window is inactive
			if ( element[ 0 ].ownerDocument.activeElement === element[ 0 ] ) {
				element[ 0 ].ownerDocument.body.focus();
			}

			// Firefox won't trigger events if the window is inactive
			// IE doesn't trigger events if we had to manually focus the body
			if ( !triggered ) {
				focusoutEvent = $.Event( "focusout" );
				focusoutEvent.preventDefault();
				element.trigger( focusoutEvent );
				element.triggerHandler( "blur" );
			}
			element.unbind( "blur", trigger );
		}, 1 );
	}
});



/** complex events **/

function findCenter( elem ) {
	var offset,
		$document;
	
	elem = $( elem );
	if ( isDocument(elem[0]) ) {
		$document = elem;
		offset = { left: 0, top: 0 };
	}
	else {
		$document = $( elem[0].ownerDocument || document );
		offset = elem.offset();
	}
	
	return {
		x: offset.left + elem.outerWidth() / 2 - $document.scrollLeft(),
		y: offset.top + elem.outerHeight() / 2 - $document.scrollTop()
	};
}

$.extend( $.simulate.prototype, {
	simulateDrag: function() {
		var target = this.target,
			options = this.options,
			center = findCenter( target ),
			x = Math.floor( center.x ),
			y = Math.floor( center.y ), 
			dx = options.dx || 0,
			dy = options.dy || 0,
			coord = { clientX: x, clientY: y },
			doc = isDocument(target)? target : (target.ownerDocument || document);
		this.simulateEvent( target, "mousedown", coord );
		coord = { clientX: x + 1, clientY: y + 1 };
		this.simulateEvent( doc, "mousemove", coord );
		coord = { clientX: x + dx, clientY: y + dy };
		this.simulateEvent( doc, "mousemove", coord );
		this.simulateEvent( doc, "mousemove", coord );
		this.simulateEvent( target, "mouseup", coord );
		this.simulateEvent( target, "click", coord );
	}
});

})( jQuery );
