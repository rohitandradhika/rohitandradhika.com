if (typeof MW == "undefined" || !MW) {
	var MW = {};
}

if ( ! window.log ) {
	window.log = function() {
		var log = {};
		log.history = log.history || [];   // store logs to an array for reference
		log.history.push(arguments);
		if (window.console) {
			console.log( Array.prototype.slice.call(arguments) );
		}
	};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * MW.namespace("property.package");
 * MW.namespace("MW.property.package");
 * </pre>
 * Either of the above would create MW.property, then
 * MW.property.package
 *
 * This method is copied from YUI's global YAHOO object.
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create
 * @return {Object}  A reference to the last namespace object created
 */
MW.namespace = function() {
	var a=arguments, o=null, i, j, d;
	for (i=0; i<a.length; i=i+1) {
		d=(""+a[i]).split(".");
		o=MW;

		// MW is implied, so it is ignored if it is included
		for (j=(d[0] == "MW") ? 1 : 0; j<d.length; j=j+1) {
			o[d[j]]=o[d[j]] || {};
			o=o[d[j]];
		}
	}

	return o;
};

MW.namespace("util");

/**
 * String manipulation methods.
 */
MW.util.String = {
	/**
	 * sprintf() for JavaScript v.0.4
	 *
	 * Copyright (c) 2007 Alexandru Marasteanu <http://alexei.417.ro/>
	 * Thanks to David Baird (unit test and patch).
	 *
	 * This program is free software; you can redistribute it and/or modify it under
	 * the terms of the GNU General Public License as published by the Free Software
	 * Foundation; either version 2 of the License, or (at your option) any later
	 * version.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
	 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
	 * details.
	 *
	 * You should have received a copy of the GNU General Public License along with
	 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
	 * Place, Suite 330, Boston, MA 02111-1307 USA
	 */
	repeat: function (i, m) { for (var o = []; m > 0; o[--m] = i); return(o.join("")); },
	format: function() {
		var i = 0, a, f = arguments[i++], o = [], m, p, c, x;
		while (f) {
			if (m = /^[^\x25]+/.exec(f)) o.push(m[0]);
			else if (m = /^\x25{2}/.exec(f)) o.push("%");
			else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
				if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) throw("Too few arguments.");
				if (/[^s]/.test(m[7]) && (typeof(a) != "number"))
					throw("Expecting number but found " + typeof(a));
				switch (m[7]) {
					case "b": a = a.toString(2); break;
					case "c": a = String.fromCharCode(a); break;
					case "d": a = parseInt(a); break;
					case "e": a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
					case "f": a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
					case "o": a = a.toString(8); break;
					case "s": a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
					case "u": a = Math.abs(a); break;
					case "x": a = a.toString(16); break;
					case "X": a = a.toString(16).toUpperCase(); break;
				}
				a = (/[def]/.test(m[7]) && m[2] && a > 0 ? "+" + a : a);
				c = m[3] ? m[3] == "0" ? "0" : m[3].charAt(1) : " ";
				x = m[5] - String(a).length;
				p = m[5] ? this.repeat(c, x) : "";
				o.push(m[4] ? a + p : p + a);
			}
			else throw ("Huh ?!");
			f = f.substring(m[0].length);
		}
		return o.join("");
	}
}

/**
 * Allow GA to track outbound links. Use sparingly and with caution. CAUTION!
 *
 * usage: <a href="http://www.schmooogle.com" onclick="MW.util.gaTrackOutbound(this, 'a category for tracking',link.href)">
 * @param link reference to the link object, typically 'this'
 * @param category category for tracking
 * @param action domain for tracking or link.href
 */
MW.util.gaTrackOutbound = function (link, category, action)
{
	try
	{
		if (window._gaq)
		{
			if (!action) {action = link.href;}
			_gaq.push(['_trackEvent', category, action]);
			if (link.target == "" || link.target == "_self")
			{
				setTimeout('document.location = "' + link.href + '"', 100)
				return false;
			}
		}
		return true
	}
	catch(err)
	{}
	return true;
}

MW.namespace('controls.facebook');

/**
 * Facebook.
 */
MW.controls.facebook.openLogin = function(link)
{
	window.open(link.getAttribute('href'), link.getAttribute('target'), 'width=700,height=300');
	return false;
};


function countClick(qs) {
	var clickUrl = "/apps/public/mw/click.php?"+qs;
	clickUrl += "&rand="+Math.round(Math.random()*Math.pow(10, 10));
	var img = new Image();
	img.src = clickUrl;
	return true;
}

function countBomwClick(qs, obj, vendor) {
	countClick(qs);
	_gaq.push(['_trackEvent', 'Listing Click', obj, vendor]);
	return true;
}

// Homepage Tabs.
// Depends on lib/assets/js/plugins/jquery-observehashchange/jquery.observehashchange.js
$( function() {

	// just for handy.
	var homeTabs = $('#myTab');

	// Are we on the right page?
	if ( ! homeTabs.length ) {
		return;
	}

	// Couple o' globals.
	var FADE_SPEED = 500;
	var targetIdAtr = 'target-id';

	var getHash = function( hash ) {
		hash = window.location.hash.replace('#', '');
		return hash !== '' ? hash : null;
	}

	var showTabById = function( tabId, callback ) {

		var target = cleanTarget( tabId );
		var tabElem = $('a[href="/' + target + '"]');

		// When first loading the page, a hash like #inspiration
		// will cause the browser to scroll to the anchor with href as this.
		// I append -tab to the ids differentiate and break that behavior.
		var contentElem = $('#' + tabId + '-tab');

		var fadeInElem = function( callback ) {

			// Hide *all* the panes for a moment.
			$('.tab-pane').hide();

			// Remove active from all tabs briefly.
			homeTabs.find('li').removeClass('active');
			homeTabs.find('span').removeClass('active');

			// Make the correct tab active.
			tabElem.parent('li').addClass('active');
			tabElem.find('span').addClass('active');

			// Show our tab as selected (no content loaded just yet).
			tabElem.show();

			// Fade our content in.
			$(contentElem).fadeIn( FADE_SPEED, callback );
		}

		if ( tabElem.length && contentElem.length )
		{
			// Poor man cache. Don't load twice.
			if ( $(contentElem).is(':parent') ) {
				loadAds( tabId );
				// The tab is already loaded, so just show it.
				fadeInElem( callback );
			}
			else {
				// Load the content via ajax, although since we
				// are preloading, it is unlikely to even reach this.
				$(contentElem).load( '/' + target, function() {
					loadAds( tabId );
					fadeInElem( callback );
				});
			}
		}
	}

	var preloadTabs = function() {
		$('.tab-pane').each( function() {
			var targetTabId = $(this).data(targetIdAtr);
			if (targetTabId === 'registries') {
				// Let's not preload registries because the Macy's slider
				// is not lazy loading ads.
				return;
			}
			var currentTabId = getTabId();
			// Only load the hidden tabs.
			if ( targetTabId !== currentTabId ) {
				var target = cleanTarget( $(this).data(targetIdAtr) );
				var url = '/' + target;
				$(this).load( url );
			}
		});
	}

	var cleanTarget = function( target ) {
		if (target === 'find-vendor') {
			target = 'home/find-vendor';
		}
		if (target === 'ideas') {
			target = '';
		}
		return target;
	}

	var getTabId = function() {
		var tabId = getHash();
		return tabId ? tabId : $('.default-active').data(targetIdAtr);
	}

	var showTabFromHash = function( callback ) {
		var tabId = getTabId();
		showTabById( tabId, callback );
		fireTracking( cleanTarget(tabId) );
	}

	var loadAds = function( tabId ) {
	//	window.log('Fetching ads for: ' + tabId);
		var prefix = 'lazy-ad-';
		if ( typeof _lazyAds === 'undefined' ) {
			return;
		}
		var ads = _lazyAds[tabId];
		if ( ! $(ads).length ) {
			return;
		}
		$.each( ads, function(key, val) {
			var ids = {
				'script' : prefix + 'script-' + key,
				'iframe' : prefix + 'iframe-' + key,
				'a' : prefix + 'a-' + key,
				'img' : prefix + 'img-' + key
			}
			var that = this;
			$.each( ids, function(key, val) {
				var id = '#' + val;
				if ( $(id).length ) {
					if ( $(id).attr('src') !== 'undefined' ) {
						if ( $(id).attr('src') === '') {
							$(id).attr('src', that[key]);
//							window.log('loading src: ' + that[key]);
						}
						else {
//							window.log('skipping src: ' + that[key]);
						}
					}
					else if ( $(id).attr('href') !== 'undefined' ) {
						if ( $(id).attr('href') === '' ) {
							$(id).attr('href', that[key]);
//							window.log('loading href: ' + that[key]);
						}
						else {
//							window.log('skipping href: ' + that[key]);
						}
					}
				}
			});
		});
	}

	var fireTracking = function( target )
	{
		ga( 'send', 'pageview', '/' + target );

		// These correspond to the files found in:
		// /application/modules/shared/views/trackers
		var trackers = [
			'quantcast',
			'comscore',
			'google-tag-manager',
			'google-analytics',
			'retargeting'
		];

		for ( var i = 0; i < trackers.length; ++i ) {
			var css = '.' + trackers[i] + '.tracker';
			var tracker = $(css);

			if ( tracker.length ) {
				// Replace the tracker html with itself,
				// which will cause it to refire :)
				tracker.html( tracker.html() );
			}
		}
	}

	var postSetup = function() {

		preloadTabs();

		// Watch for changes in the hash value.
		$(window).hashchange( function() {
			showTabFromHash( function() {
				// Change the page title.
				if ( $(MW_homepage_titles).length ) {
					var tabId = getHash();
					if ( tabId in MW_homepage_titles ) {
						document.title = MW_homepage_titles[tabId].title;
					}
				}
			});
		});

		// Change tabs on clicking.
		homeTabs.bind( 'click', function(e) {
			e.preventDefault();
			var tabId = $(e.target).parent('li').data(targetIdAtr);
			if (tabId) {
				window.location.hash = tabId;
			}
		});
	}

	// Setup the nav links to trigger tabs instead of redirecting.
	var setupNavLinks = function() {

		var navLinks = [
			'free-wedding-websites',
			'registries',
			'planning',
			'travel'
		]

		// Little closure to set the hash.
		var getLinkClick = function(link) {
			return function(e) {
				e.preventDefault();
				window.location.hash = link;
			}
		}

		for ( var ndx in navLinks ) {
			var link = navLinks[ndx];
			var selector = '#mainNavBottom a[href="/' + link + '"]';
			var linkElem = $(selector);
			if ( linkElem.length ) {
				linkElem.click( getLinkClick(link) );
			}
		}
	}

	var main = function() {

		setupNavLinks();

		if ( getHash() ) {
			showTabFromHash( postSetup );
		}
		else {
			var activeTab = getTabId();
			loadAds(activeTab);
			postSetup();
		}
	}

	main();
});

// Setup in page login/signup modal triggers.
$( function() {

	var modalClosure = function(selector) {
		return function(e) {
			e.preventDefault();
			$('#redirect-location').val($(this).data('redirect'));
			$(selector).modal();
			$('html, body').animate({ scrollTop: 0 }, 'fast');
			return false;
		};
	}

	$(document).on( 'click', '.loginTrigger', null, modalClosure('#onboarding-login') );
	$(document).on( 'click', '.signupTrigger', null, modalClosure('#onboarding-signup') );
});

// Prompt for copying BOMW badge HTML.
var promptAwardHtml = function( url, badgePath ) {

	window.prompt(
		'Press ctrl/cmd+c to copy award image html.',
		'<input type=\'text\' value=\'' + url + '\'>'
	);
}

// Flag menu in new design.
$( function() {

	var flagMenu = $('#flagMenu');
	var flagPopover = $('#countries');
	var flags    = $('#countries li, #countries li>a');
	var saveUrl  = '/apps/gateway/context/save-home-country';

	// Are we on the right page?
	if ( ! flagMenu.length ) {
		return;
	}

	var saveCountry = function( placeId ) {
		$.getJSON(
			saveUrl,
			{ placeId: placeId },
			function (json) {
				// We've change locations, so we must refresh
				// to see (e.g.) any locale language translations.
				document.location.reload(true);
			}
		);
	}

	var main = function() {
		flags.click( function(e) {
			e.preventDefault();
			flagPopover.hide();
			saveCountry( $(this).data('place-id') );
		});
	}

	main();
});

//this is a fix so that placeholder texts can appear in IE. This is a plugin forked from https://github.com/jamesallardice/Placeholders.js
/* Placeholders.js v2.1.0 */
!function (a) {
    "use strict";
    function b(a, b, c) {
        return a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent ? a.attachEvent("on" + b, c) : void 0
    }

    function c(a, b) {
        var c, d;
        for (c = 0, d = a.length; d > c; c++)if (a[c] === b)return!0;
        return!1
    }

    function d(a, b) {
        var c;
        a.createTextRange ? (c = a.createTextRange(), c.move("character", b), c.select()) : a.selectionStart && (a.focus(), a.setSelectionRange(b, b))
    }

    function e(a, b) {
        try {
            return a.type = b, !0
        } catch (c) {
            return!1
        }
    }

    a.Placeholders = {Utils: {addEventListener: b, inArray: c, moveCaret: d, changeType: e}}
}(this), function (a) {
    "use strict";
    function b() {
    }

    function c(a) {
        var b;
        return a.value === a.getAttribute(G) && "true" === a.getAttribute(H) ? (a.setAttribute(H, "false"), a.value = "", a.className = a.className.replace(F, ""), b = a.getAttribute(I), b && (a.type = b), !0) : !1
    }

    function d(a) {
        var b, c = a.getAttribute(G);
        return"" === a.value && c ? (a.setAttribute(H, "true"), a.value = c, a.className += " " + E, b = a.getAttribute(I), b ? a.type = "text" : "password" === a.type && R.changeType(a, "text") && a.setAttribute(I, "password"), !0) : !1
    }

    function e(a, b) {
        var c, d, e, f, g;
        if (a && a.getAttribute(G))b(a); else for (c = a ? a.getElementsByTagName("input") : o, d = a ? a.getElementsByTagName("textarea") : p, g = 0, f = c.length + d.length; f > g; g++)e = g < c.length ? c[g] : d[g - c.length], b(e)
    }

    function f(a) {
        e(a, c)
    }

    function g(a) {
        e(a, d)
    }

    function h(a) {
        return function () {
            q && a.value === a.getAttribute(G) && "true" === a.getAttribute(H) ? R.moveCaret(a, 0) : c(a)
        }
    }

    function i(a) {
        return function () {
            d(a)
        }
    }

    function j(a) {
        return function (b) {
            return s = a.value, "true" === a.getAttribute(H) && s === a.getAttribute(G) && R.inArray(C, b.keyCode) ? (b.preventDefault && b.preventDefault(), !1) : void 0
        }
    }

    function k(a) {
        return function () {
            var b;
            "true" === a.getAttribute(H) && a.value !== s && (a.className = a.className.replace(F, ""), a.value = a.value.replace(a.getAttribute(G), ""), a.setAttribute(H, !1), b = a.getAttribute(I), b && (a.type = b)), "" === a.value && (a.blur(), R.moveCaret(a, 0))
        }
    }

    function l(a) {
        return function () {
            a === document.activeElement && a.value === a.getAttribute(G) && "true" === a.getAttribute(H) && R.moveCaret(a, 0)
        }
    }

    function m(a) {
        return function () {
            f(a)
        }
    }

    function n(a) {
        a.form && (x = a.form, x.getAttribute(J) || (R.addEventListener(x, "submit", m(x)), x.setAttribute(J, "true"))), R.addEventListener(a, "focus", h(a)), R.addEventListener(a, "blur", i(a)), q && (R.addEventListener(a, "keydown", j(a)), R.addEventListener(a, "keyup", k(a)), R.addEventListener(a, "click", l(a))), a.setAttribute(K, "true"), a.setAttribute(G, v), d(a)
    }

    var o, p, q, r, s, t, u, v, w, x, y, z, A, B = ["text", "search", "url", "tel", "email", "password", "number", "textarea"], C = [27, 33, 34, 35, 36, 37, 38, 39, 40, 8, 46], D = "#ccc", E = "placeholdersjs", F = new RegExp("(?:^|\\s)" + E + "(?!\\S)"), G = "data-placeholder-value", H = "data-placeholder-active", I = "data-placeholder-type", J = "data-placeholder-submit", K = "data-placeholder-bound", L = "data-placeholder-focus", M = "data-placeholder-live", N = document.createElement("input"), O = document.getElementsByTagName("head")[0], P = document.documentElement, Q = a.Placeholders, R = Q.Utils;
    if (Q.nativeSupport = void 0 !== N.placeholder, !Q.nativeSupport) {
        for (o = document.getElementsByTagName("input"), p = document.getElementsByTagName("textarea"), q = "false" === P.getAttribute(L), r = "false" !== P.getAttribute(M), t = document.createElement("style"), t.type = "text/css", u = document.createTextNode("." + E + " { color:" + D + "; }"), t.styleSheet ? t.styleSheet.cssText = u.nodeValue : t.appendChild(u), O.insertBefore(t, O.firstChild), A = 0, z = o.length + p.length; z > A; A++)y = A < o.length ? o[A] : p[A - o.length], v = y.attributes.placeholder, v && (v = v.nodeValue, v && R.inArray(B, y.type) && n(y));
        w = setInterval(function () {
            for (A = 0, z = o.length + p.length; z > A; A++)y = A < o.length ? o[A] : p[A - o.length], v = y.attributes.placeholder, v && (v = v.nodeValue, v && R.inArray(B, y.type) && (y.getAttribute(K) || n(y), (v !== y.getAttribute(G) || "password" === y.type && !y.getAttribute(I)) && ("password" === y.type && !y.getAttribute(I) && R.changeType(y, "text") && y.setAttribute(I, "password"), y.value === y.getAttribute(G) && (y.value = v), y.setAttribute(G, v))));
            r || clearInterval(w)
        }, 100)
    }
    Q.disable = Q.nativeSupport ? b : f, Q.enable = Q.nativeSupport ? b : g
}(this);