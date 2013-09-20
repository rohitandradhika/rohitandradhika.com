// Add the cookies object to the mywedding namespace
var mywedding = window.mywedding || {}
/*
 * This code handles getting and setting cookies in a user's browser via javascript.
 */
mywedding.cookies = {
	"get" : function (name) {
		var nameMatch = name+"=";
		var cookies = document.cookie.split(/;\s?/);
		for (var i = 0; i < cookies.length; i++) {
			if (cookies[i].indexOf(nameMatch) == 0) {
				return unescape(cookies[i].substring(nameMatch.length, cookies[i].length));
			}
		}
		return null;
	},
	"set" : function (name, value, expire, path) {
		var cookieValue = name + "=" + escape(value);
		var expireDate = this.parseExpire(expire);
		if (expireDate != null) {
			cookieValue += "; expires=" + expireDate.toGMTString();
		}
		cookieValue += "; path=" + (path == null ? "/" : path);
		document.cookie = cookieValue;
	},
	"remove" : function (name, path) {
		this.set(name, "", -1, path);
	},
	/*
	 * Parses the expire time sent to the sent method. Acceptable values
	 * are whole numbers, optionally followed by a letter specifying unit.
	 * The letter is case-insensitive, and can be one of D, M, or H,
	 * meaning days, hours and minutes, respectively. Default is seconds.
	 * Returns Date object.
	 */ 
	"parseExpire" : function (expire) {
		// Any negative value is interpreted as an expiration command.
		if (parseInt(expire) < 0) {
			return new Date(new Date().getTime() - 86400000);
		}
		var re = /^(\d+)([a-z]?)/i;
		var m = re.exec(expire);
		if (m != null) {
			var addTime;
			var unit = m[2] == null ? "" : m[2].toUpperCase();
			if (unit == "D") {
				addTime = m[1] * 86400000;
			}
			else if (unit == "H") {
				addTime = m[1] * 3600000;
			}
			else if (unit == "M") {
				addTime = m[1] * 60000;
			}
			else {
				addTime = m[1] * 1000;
			}
			var expireDate = new Date();
			expireDate.setTime(new Date().getTime() + addTime);
			return expireDate;
		}
		// If the expire time is unparseable, return null to default to
		// a session cookie.
		else {
			return null;
		}
	}
}
