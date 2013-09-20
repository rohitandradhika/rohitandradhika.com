var fader;
var lastImage, currentImage, nextImage;
var pauseTimer;
// Default changing image flag to true so navigation doesn't work until js executes
var changingImage = true;
var activeFaders = new Array();

function preLoadImagesInto(element) {
	var startImage = document.getElementById("c-photo-image");
	for (var i=0;i<images.length;i++) {
		images[i].number = i + 1;
		if (images[i].src == startImage.src) {
			images[i].element = startImage;
			currentImage = images[i];
			continue;
		}
		var img = document.createElement("img");
		img.style.display = "none";
		img.setAttribute("src", images[i].src);
		img.setAttribute("width", images[i].width);
		img.setAttribute("height", images[i].height);
		img.setAttribute("alt", images[i].name);
		element.appendChild(img);
		images[i].element = img;
	}
	// Set image changing flag to false to enable navigation links
	changingImage = false;
}

function toImage(direction) {
	if (changingImage) {
		return;
	}
	for (var i=0;i<images.length;i++) {
		if (images[i].src == currentImage.src) {
			var to;
			if (direction > 0) {
				to = i + 1 == images.length ? 0 : i + 1;
			}
			else {
				to = i == 0 ? images.length - 1 : i - 1;
			}
			nextImage = images[to];
			fadeOutImage();
			break;
		}
	}
}

function fadeOutImage() {
	var fader = getFader(currentImage.element);
	var textFader = getFader(document.getElementById("c-photo-caption"));
	if (fader) {
		changingImage = true;
		fader.onFinish = function() {pauseTimer = setTimeout(displayImage, 250)};
		fader.fadeOut();
		textFader.fadeOut();
	}
	else {
		displayImage();
		lastImage.element.style.display = "none";
		currentImage.element.style.display = "inline";
	}
}

function fadeInImage() {
	var fader = getFader(currentImage.element);
	var textFader = getFader(document.getElementById("c-photo-caption"));
	if (fader) {
		fader.currentOpacity = 0;
		fader.doFadeStep();
		
		lastImage.element.style.display = "none";
		currentImage.element.style.display = "inline";
		
		fader.onFinish = function() {changingImage = false}
		fader.fadeIn();
		textFader.fadeIn();
	}
}

function displayImage() {
	var title = document.getElementById("c-photo-subtitle");
	var number = document.getElementById("c-photo-number");
	var caption = document.getElementById("c-photo-caption");
	
	if (title.childNodes.length > 0) {
		title.removeChild(title.childNodes[0]);
	}
	title.appendChild(document.createTextNode(nextImage.name));
	number.removeChild(number.childNodes[0]);
	number.appendChild(document.createTextNode(nextImage.number));
	while (caption.childNodes.length > 0) {
		caption.removeChild(caption.childNodes[0]);
	}
	paragraphize(nextImage.caption, caption);
	
	lastImage = currentImage;
	currentImage = nextImage;
	
	fadeInImage();
}

function paragraphize(str, parent) {
	var paragraphs = str.split(/[\r\n]{4,}/);
	for (var i=0;i<paragraphs.length;i++) {
		if (paragraphs[i] != "") {
			var lines = paragraphs[i].split(/\r\n/);
			var p = document.createElement("p");
			for (var q=0;q<lines.length;q++) {
				if (q > 0) {
					p.appendChild(document.createElement("br"));
				}
				p.appendChild(document.createTextNode(lines[q]));
			}
			parent.appendChild(p);
		}
	}
}

function getFader(obj) {
	var faderId = obj.getAttribute("faderId");
	if (faderId != "" && typeof activeFaders[faderId] != "undefined") {
		return activeFaders[faderId];
	}
	faderId = activeFaders.length;
	obj.setAttribute("faderId", faderId);
	if (obj.style.opacity != undefined) {
		activeFaders[faderId] = new Fader(obj);
	}
	/* Disabled due to ie rendering bug
	else if (obj.style.filter != undefined) {
		activeFaders[faderId] = window.f_activeFader = new IEFader(obj);
	}*/
	else if (obj.style.MozOpacity != undefined) {
		activeFaders[faderId] = new MozFader(obj);
	}
	else {
		return false;
	}
	return activeFaders[faderId];
}

function Fader(objToFade) {
	this.objToFade = objToFade;
	this.currentOpacity = 1;
	this.fadeStep = .25;
	this.fadeInterval = 20;
	this.timer = null;
	this.onFinish = null;
	
	this.cancelFade = function() {
		clearInterval(this.timer);
	}
	
	this.fadeOut = function() {
		this.currentOpacity = 1;
		this.doFadeOut();
		this.timer = setInterval("activeFaders["+this.objToFade.getAttribute("faderId")+"].doFadeOut()", 100);
	}
	this.doFadeOut = function() {
		this.currentOpacity -= this.fadeStep;
		this.doFadeStep();
		if (this.currentOpacity == 0) {
			clearInterval(this.timer);
			if (this.onFinish) this.onFinish();
		}
	}
	
	this.fadeIn = function() {
		this.currentOpacity = 0;
		this.doFadeIn();
		this.timer = setInterval("activeFaders["+this.objToFade.getAttribute("faderId")+"].doFadeIn()", 100);
	}
	this.doFadeIn = function() {
		this.currentOpacity += this.fadeStep;
		this.doFadeStep();
		if (this.currentOpacity == 1) {
			clearInterval(this.timer);
			if (this.onFinish) this.onFinish();
		}
	}
	
	this.doFadeStep = function() {
		this.objToFade.style.opacity = this.currentOpacity;
	}
}

function IEFader(objToFade) {
	this.objToFade = objToFade;
	this.doFadeStep = function() {
		this.objToFade.style.filter = "alpha(opacity=" + (this.currentOpacity * 100) + ")";
	}
}
IEFader.prototype = new Fader;

function MozFader(objToFade) {
	this.objToFade = objToFade;
	this.doFadeStep = function() {
		this.objToFade.style.MozOpacity = this.currentOpacity;;
	}
}
MozFader.prototype = new Fader;
