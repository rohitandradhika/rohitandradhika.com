var autoOpenStop = 0;
var autoOpenRetries = 0;
/*
 * Opens the music player in a popup window.
 */
function openPlayer(siteDir, trackNum, ignoreCookie)
{
    if (mywedding.cookies.get("musicPlaying" + siteDir) == null || ignoreCookie != null) {
        if(playerWindow = window.open ('http://www.mywedding.com/apps/public/mysite/player.php?s=' + siteDir + '&track_num=' + trackNum, 'player',
                'location=0,status=1,scrollbars=0,resizable=1,toolbar=0,menubar=0,width=340,height=200')){
            playerWindow.focus();
            autoOpenStop = 1;
        }
    }
    return false;
}

/*
 * Stops the embedded music player and opens it in a popup.
 */
function switchToPopup(siteDir) {
    sendEvent('musicPlayer', 'stop');
    return openPlayer(siteDir, 0);
}

/*
 * Writes out the configured player Flash object. If 'isMini' is set to true,
 * the player will show only the controls and not the playlist.  If 'autoPlay'
 * is set to true, the
 */
function writePlayerObject(siteDir, parentId, isMini, autoPlay) {
    var height = 132;
    if (isMini) { height = 20; }

    var so = new SWFObject('http://www.mywedding.com/main/flash/jw_mp3_player/mp3player.swf','musicPlayer','320',height,'7');
    // A dummy string is appended to the playlist url to prevent the player from
    // dumbly seeing the final characters of a site dir as a file extension. Also,
    // an ampersand apparently can't be used, because it gets dropped right out.
    so.addVariable('file','http://www.mywedding.com/apps/public/mysite/playlist.php?s=' + siteDir + '%26dummystring');
    so.addVariable('width','320');
    so.addVariable('height',height);
    so.addVariable('displayheight','0');
    so.addVariable('autostart',autoPlay);
    so.addVariable('shuffle','false');
    so.addVariable('largecontrols','false');
    so.addVariable('repeat','list');
    so.addVariable('showicons','true');
    so.addVariable('javascriptid','musicPlayer');
    so.addVariable('enablejs','true');
    so.addVariable('javascriptid','testid');
    so.addVariable('callback','http://www.mywedding.com/apps/public/mysite/music_log.php');
    so.write(parentId);
}

/*
 * Attempts to autoplay music inline in a page.
 */
function embedPlayerObject(siteDir, parentId, autoPlay) {
    if (mywedding.cookies.get("musicPlaying" + siteDir) == null && autoPlay) {
        autoPlay = true;
    }
    else {
        autoPlay = false;
    }
    writePlayerObject(siteDir, parentId, true, autoPlay);
}

/*
 * Used to control the player via Javascript.  See the JW player
 * documentation for details.
 */
function sendEvent(swf,typ,prm) {
    getPlayerMovie(swf).sendEvent(typ,prm);
}

/*
 * Obtains a reference to the player movie.
 */
function getPlayerMovie(swf) {
    if(navigator.appName.indexOf("Microsoft") != -1) {
        return window[swf];
    } else {
        return document[swf];
    }
}

/*
    * Opens up the player, for use on the home page.
    * will retry 5 times to give people who want to allow pop-up to do so.
    * Otherwise it will stop attempting it.
    */
function autoOpenPlayer(siteDir){
    if (autoOpenRetries <= 4 && mywedding.cookies.get("musicPlaying" + siteDir) == null && autoOpenStop == 0) {
        autoOpenRetries++;
        setTimeout("autoOpenPlayer('" + siteDir+  "',0)",5000);
        return openPlayer(siteDir,0);
    }
}

