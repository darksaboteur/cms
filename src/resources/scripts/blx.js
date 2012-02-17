(function($) {


if (typeof blx == 'undefined')
	blx = {};


// jQuery objects for common elements
blx.$window = $(window);
blx.$document = $(document);
blx.$body = $(document.body);


// Key code constants
blx.DELETE_KEY = 8;
blx.SHIFT_KEY  = 16;
blx.ALT_KEY    = 18;
blx.RETURN_KEY = 13;
blx.ESC_KEY    = 27;
blx.SPACE_KEY  = 32;
blx.LEFT_KEY   = 37;
blx.UP_KEY     = 38;
blx.RIGHT_KEY  = 39;
blx.DOWN_KEY   = 40;


blx.navHeight = 40;


/**
 * Log
 */
blx.log = function(msg)
{
	if (typeof console != 'undefined' && typeof console.log == 'function')
		console.log(msg);
};


/**
 * Utility functions
 */
blx.utils =
{
	/**
	 * Format a number with commas
	 * ex: 1000 => 1,000
	 */
	numCommas: function(num)
	{
		num = num.toString();

		var regex = /(\d+)(\d{3})/;
		while (regex.test(num)) {
			num = num.replace(regex, '$1'+','+'$2');
		}

		return num;
	},

	/**
	 * Converts a comma-delimited string into an array
	 */
	stringToArray: function(str)
	{
		if (typeof str != 'string')
			return str;

		var arr = str.split(',');
		for (var i = 0; i < arr.length; i++)
		{
			arr[i] = $.trim(arr[i]);
		}
		return arr;
	},

	/**
	 * Converts extended ASCII characters to ASCII
	 */
	asciiCharMap: {'223':'ss','224':'a','225':'a','226':'a','229':'a','227':'ae','230':'ae','228':'ae','231':'c','232':'e','233':'e','234':'e','235':'e','236':'i','237':'i','238':'i','239':'i','241':'n','242':'o','243':'o','244':'o','245':'o','246':'oe','249':'u','250':'u','251':'u','252':'ue','255':'y','257':'aa','269':'ch','275':'ee','291':'gj','299':'ii','311':'kj','316':'lj','326':'nj','353':'sh','363':'uu','382':'zh','256':'aa','268':'ch','274':'ee','290':'gj','298':'ii','310':'kj','315':'lj','325':'nj','352':'sh','362':'uu','381':'zh'},

	asciiString: function(str)
	{
		var asciiStr = '';

		for (c = 0; c < str.length; c++) {
			charCode = str.charCodeAt(c);

			if (charCode >= 32 && charCode < 128)
				asciiStr += str.charAt(c);
			else if (typeof this.asciiCharMap[charCode] != 'undefined')
				asciiStr += this.asciiCharMap[charCode];
		}

		return asciiStr;
	},

	/**
	 * Get the distance between two coordinates
	 */
	getDist: function(x1, y1, x2, y2)
	{
		return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
	},

	/**
	 * Check if an element is touching an x/y coordinate
	 */
	hitTest: function(x0, y0, elem)
	{
		var $elem = $(elem),
			offset = $elem.offset(),
			x1 = offset.left,
			y1 = offset.top,
			x2 = x1 + $elem.width(),
			y2 = y1 + $elem.height();

		return (x0 >= x1 && x0 < x2 && y0 >= y1 && y0 < y2);
	},

	/**
	 * Check if the cursor is over an element
	 */
	isCursorOver: function(event, elem)
	{
		return blx.utils.hitTest(event.pageX, event.pageY, elem);
	},

	/**
	 * Prevents the outline when an element is focussed by the mouse
	 */
	preventOutlineOnMouseFocus: function(elem)
	{
		var $elem = $(elem),
			namespace = '.preventOutlineOnMouseFocus';

		$elem.on('mousedown'+namespace, function() {
			$elem.addClass('no-outline');
			$elem.focus();
		})
		.on('keydown'+namespace+' blur'+namespace, function() {
			$elem.removeClass('no-outline');
		});
	},

	/**
	 * Case insensative sort
	 */
	caseInsensativeSort: function(arr)
	{
		return arr.sort(this.caseInsensativeCompare)
	},

	/**
	 * Case insensative string comparison
	 */
	caseInsensativeCompare: function(a, b)
	{
		a = a.toLowerCase();
		b = b.toLowerCase();
		return a < b ? -1 : (a > b ? 1 : 0);
	},

	/**
	 * Returns the body's proper scrollTop, discarding any document banding in Safari
	 */
	getBodyScrollTop: function()
	{
		var scrollTop = document.body.scrollTop;

		if (scrollTop < 0)
			scrollTop = 0;
		else
		{
			var maxScrollTop = blx.$body.outerHeight() - blx.$window.height();
			if (scrollTop > maxScrollTop)
				scrollTop = maxScrollTop;
		}

		return scrollTop;
	},

	/**
	 * Returns the first element in a jQuery object
	 */
	getElement: function(elem)
	{
		return $.makeArray(elem)[0];
	}
};


blx.fx = {
	duration: 400,
	delay: 100
};


/**
 * Base class
 */
blx.Base = Base.extend({

	settings: null,

	_namespace: null,
	_$listeners: null,

	constructor: function()
	{
		this._namespace = '.blx'+Math.floor(Math.random()*999999999);
		this._$listeners = $();
		this.init.apply(this, arguments);
	},

	init: function(){},

	setSettings: function(settings, defaults)
	{
		var baseSettings = (typeof this.settings == 'undefined' ? {} : this.settings);
		this.settings = $.extend(baseSettings, defaults, settings);
	},

	_formatEvents: function(events)
	{
		events = blx.utils.stringToArray(events);
		for (var i = 0; i < events.length; i++)
		{
			events[i] += this._namespace;
		}
		return events.join(' ');
	},

	addListener: function(elem, events, func)
	{
		events = this._formatEvents(events);

		if (typeof func == 'function')
			func = $.proxy(func, this);
		else
			func = $.proxy(this, func);

		$(elem).on(events, func);

		// Remember that we're listening to this element
		this._$listeners = this._$listeners.add(elem);
	},

	removeListener: function(elem, events)
	{
		events = this._formatEvents(events);
		$(elem).off(events);
	},

	removeAllListeners: function(elem)
	{
		$(elem).off(this._namespace);
	},

	destroy: function()
	{
		this.removeAllListeners(this._$listeners);
	}

});


/**
 * Blocks class
 */
var CP = blx.Base.extend({

	_windowHeight: null,
	_$sidebar: null,
	_sidebarTop: null,

	init: function()
	{
		var $sidebar = $('#sidebar');
		if ($sidebar.length)
		{
			this._$sidebar = $sidebar;
			this._sidebarTop = parseInt(this._$sidebar.css('top'));

			this.setSidebarHeight();
			this.addListener(blx.$window, 'resize', 'setSidebarHeight');
			this.addListener(blx.$window, 'scroll', 'setSidebarHeight');
		}
	},

	setSidebarHeight: function()
	{
		if (! this._$sidebar)
			return false;

		// has the window height changed?
		if (this._windowHeight !== (this._windowHeight = blx.$window.height()))
		{
			var sidebarHeight = this._windowHeight - this._sidebarTop;
			this._$sidebar.height(sidebarHeight);
		}
	}

});


blx.cp = new CP();


})(jQuery);
