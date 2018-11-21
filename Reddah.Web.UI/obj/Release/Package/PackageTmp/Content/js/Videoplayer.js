(function () {
    var reddah = window.reddah = window.reddah || {};

    var videoPlayer = (function () {
        reddah.videoPlayer = reddah.videoPlayer || {};

        var silverlightversionnumber = '4.0.50401.0';

        // Generic Functions
        var populateGameVideoInitParams = function (url, mediaTitle, ratingID, ratingDescriptorIDs, onClose) {
            setOmnitureVars(url, mediaTitle, MediaTypes.GameVideo, '');
            var initParams = "mediaType=gamevideo";
            initParams += ",videoSourceURL=" + url;
            initParams += ",mediaTitle=" + mediaTitle;
            initParams += ",ratingID=" + ratingID;
            initParams += ",ratingDescriptorIDs=" + ratingDescriptorIDs;
            initParams += ",onPlayerClose=" + onClose;
            initParams += ",userSignedIn=" + IsUserSignedIn().toString();

            return initParams;
        };
        var populateOtherVideoInitParams = function (url, mediaTitle, minimumAge, onClose) {
            //setOmnitureVars(url, mediaTitle, MediaTypes.OtherVideo, '');

            var initParams = "mediaType=othervideo";
            initParams += ",videoSourceURL=" + url;
            initParams += ",mediaTitle=" + mediaTitle;
            initParams += ",minimumAge" + minimumAge;
            initParams += ",onPlayerClose=" + onClose;
            initParams += ",userSignedIn=" + IsUserSignedIn().toString();
            //prompt("", initParams);
            return initParams;
        };
        var populateGuidInitParams = function (mediaType, mediaID, mediaTitle, onClose) {
            setOmnitureVars(mediaID, mediaTitle, MediaTypes[mediaType], mediaID);

            var initParams = "mediaType=" + mediaType.toLowerCase();
            initParams += ",mediaGuid=" + mediaID;
            initParams += ",mediaTitle=" + mediaTitle;
            initParams += ",onPlayerClose=" + onClose;
            initParams += ",userSignedIn=" + IsUserSignedIn().toString();

            return initParams;
        };
        var loaded = false;

        var loadTimeoutTimerId = 0;
        var timeoutMilliseconds = 60000;

        var originalBuildPrompt = null;

        var activeXEnabled = function () {
            if (typeof window.ActiveXObject == "undefined") {
                return false;
            }
            try {
                new ActiveXObject("Msxml2.XMLHTTP");
                return true;
            } catch (ex) {
                return false;
            }
        };
        var activeXFilteringEnabled = function () {
            if (typeof window.external != "undefined"
                && typeof window.external.msActiveXFilteringEnabled != "undefined"
                && window.external.msActiveXFilteringEnabled() == true) {
                return true;
            }
            return false;
        };
        var promptScreenHtml = function (title, description, closeText, hostId, onClose) {
            var stringBuilder = [];
            stringBuilder.push("<div id='videoPlayerErrorScreen' style='#position: relative;'>");
            stringBuilder.push("<div class='verticalAlign' style='#position: absolute; #top: 50%; width: 100%;'>");
            stringBuilder.push("<div class='horizontalAlign' style='#position: relative; #top: -50%;'>");
            stringBuilder.push("<p id='videoPlayerErrorScreenTitle'>");
            stringBuilder.push(title);
            stringBuilder.push("</p><p>");
            stringBuilder.push(description);
            stringBuilder.push("</p><br><div onclick='");
            stringBuilder.push(onClose);
            stringBuilder.push("()' style='cursor:pointer; text-align:center; padding-top:4px; padding-bottom:4px; background-color:#107C10; width:80px'>");
            stringBuilder.push(closeText);
            stringBuilder.push("</div></div></div></div>");

            return stringBuilder.join("");
        };
        var IsUserSignedIn = function () {
            //            if (currentUser.isSignedIn)
            //                return true;
            //            return false;
            return false;
        };
        var createSilverlightObject = function (hostId, objectId, culture, uiCulture, initParams, onClose) {

            //setOmniturePlayerLaunchedEventAndPostToOmniture();

            var host = window.$('#' + hostId);
            //alert(navigator.appName);
            if (navigator.appName === "Opera") {
                //postToOmniture('event13', ['eVar24', 'prop47'], ['Err-UNSUPPORTED_BROWSER-60020', 'Err-UNSUPPORTED_BROWSER-60020']);
                host[0].innerHTML = promptScreenHtml(reddah.videoPlayer.txtPlaybackErrorTitle, reddah.videoPlayer.txtPlaybackErrorUnsupportedBrowser, reddah.videoPlayer.txtPlaybackErrorClose, hostId, onClose);
                return;
            }

            //checkOmnitureSilverlightNotInstalledAndPostToOmniture();

            loaded = false;

            if (originalBuildPrompt == null) {
                originalBuildPrompt = Silverlight.buildPromptHTML;
            }

            Silverlight.buildPromptHTML = function (b) {
                if (activeXFilteringEnabled() || (window.ActiveXObject != "undefined" && !activeXEnabled())) {
                    return promptScreenHtml(reddah.videoPlayer.txtPlaybackErrorTitle, reddah.videoPlayer.txtPlaybackErrorActiveXDescription, reddah.videoPlayer.txtPlaybackErrorClose, hostId, onClose);
                }
                else {
                    return originalBuildPrompt(b);
                }
            };
            var onSilverlightError = function (sender, errorArgs) {
                alert("error");
                //postToOmniture('event13', ['eVar24', 'prop47'], ['Err-PLAY_ERROR-40011', 'Err-PLAY_ERROR-40011']);
                host[0].innerHTML = promptScreenHtml(reddah.videoPlayer.txtPlaybackErrorTitle, reddah.videoPlayer.txtPlaybackErrorGenericDescription, reddah.videoPlayer.txtPlaybackErrorClose, hostId, onClose);
            };
            //alert(reddah.videoPlayer.VideoPlayerUrl);
            Silverlight.createObject(
                reddah.videoPlayer.VideoPlayerUrl,
                document.getElementById(hostId),
                objectId,
                {
                    width: '100%',
                    height: '100%',
                    background: '#333',
                    version: silverlightversionnumber,
                    autoUpgrade: 'true',
                    culture: culture,
                    uiculture: uiCulture,
                    windowless: 'true',
                    enablehtmlaccess: 'true'
                },
                { onError: onSilverlightError },
                initParams,
                'context');
            
            if (!reddah.videoPlayer.loaded) {
                loadTimeoutTimerId = setTimeout("reddah.videoPlayer.timeout('" + hostId + "', '" + onClose + "')", timeoutMilliseconds);
            }
        };
        var timeout = function (hostId, onClose) {
            if (!reddah.videoPlayer.loaded) {
                postToOmniture('event13', ['eVar24', 'prop47'], ['Err-VIDEOPLAYER_XAP_LOADED_TIMEOUT-60010', 'Err-VIDEOPLAYER_XAP_LOADED_TIMEOUT-60010']);
                window.$('#' + hostId)[0].innerHTML = promptScreenHtml(reddah.videoPlayer.txtPlaybackErrorTitle, reddah.videoPlayer.txtPlaybackErrorGenericDescription, reddah.videoPlayer.txtPlaybackErrorClose, hostId, onClose);
            }
        };
        var closeSilverlightObject = function (hostId) {
            var host = window.$('#' + hostId);
            if (typeof (host) !== 'undefined') {
                host.height(0);
                host.width(0);
                host.html("");
            }
        };
        var MediaTypes = {
            GameVideo: 'GameVideo',
            TVEpisode: 'TVEpisode',
            Movie: 'Movie',
            MovieTrailer: 'MovieTrailer',
            OtherVideo: 'OtherVideo'
        }; // Omniture
        var setOmnitureVars = function (contentUrl, mediaTitle, mediaType, mediaID) {
            if (omnitureTrackingOn()) {
                s.prop44 = s.eVar21 = 'ReddahComVideoPlayer';

                if (mediaType) {
                    s.prop45 = s.eVar22 = mediaType;
                }
                else {
                    s.prop45 = s.eVar22 = MediaTypes.OtherVideo;
                }

                mediaTitle = window.jQuery.trim(mediaTitle);
                s.prop46 = s.eVar23 = 'Vid-';
                if (mediaID) {
                    s.prop46 = s.eVar23 += mediaID;
                }
                if (mediaTitle) {
                    s.prop46 = s.eVar23 += mediaTitle;
                }
                if (s.prop46 == 'Vid-') {
                    s.prop46 = s.eVar23 += contentUrl;
                }
            }
        };
        //        var setOmniturePlayerLaunchedEventAndPostToOmniture = function () {
        //            if (omnitureTrackingOn()) {
        //                s.events = 'event11';
        //                postToOmniture('event11');
        //            }
        //        };
        //        var checkOmnitureSilverlightNotInstalledAndPostToOmniture = function () {
        //            if (omnitureTrackingOn()) {
        //                if (activeXFilteringEnabled()) {
        //                    postToOmniture('event13', ['eVar24', 'prop47'], ['Err-ACTIVE_X_FILTERING_ENABLED-60002', 'Err-ACTIVE_X_FILTERING_ENABLED-60002']);
        //                }
        //                else if (typeof window.ActiveXObject != "undefined" && activeXEnabled() == false) {
        //                    postToOmniture('event13', ['eVar24', 'prop47'], ['Err-ACTIVE_X_DISABLED-60001', 'Err-ACTIVE_X_DISABLED-60001']);
        //                }
        //                else if (!Silverlight.isInstalled(silverlightversionnumber)) {
        //                    postToOmniture('event13', ['eVar24', 'prop47'], ['Err-SILVERLIGHT_NOT_INSTALLED-60000', 'Err-SILVERLIGHT_NOT_INSTALLED-60000']);
        //                }
        //            }
        //        };
        var postToOmniture = function (event, varNames, varValues) {
            if (omnitureTrackingOn()) {
                clearOmnitureVars();

                if (varNames) {
                    setOmnitureEventVars(varNames, varValues);
                }

                s.events = event;
                s.linkTrackVars = 'events,eVar21,eVar22,eVar23,eVar24,prop44,prop45,prop46,prop47';
                s.linkTrackEvents = event;
                var friendlyEvent;
                switch (event) {
                    case 'event11':
                        friendlyEvent = 'launch';
                        break;
                    case 'event12':
                        friendlyEvent = 'play';
                        break;
                    case 'event13':
                        friendlyEvent = 'error';
                        break;
                    case 'event17':
                        friendlyEvent = 'play 25%';
                        break;
                    case 'event18':
                        friendlyEvent = 'play 50%';
                        break;
                    case 'event19':
                        friendlyEvent = 'play 75%';
                        break;
                    case 'event10':
                        friendlyEvent = 'playback complete';
                        break;
                }
                var customLinkString = s.eVar21 + ':' + s.eVar22 + ':' + s.eVar23 + ':' + friendlyEvent;
                if (event == 'event13') {
                    customLinkString = customLinkString + ':' + s.eVar24;
                }
                try {
                    s.tl(true, 'o', customLinkString);
                } catch (e) {
                }
            }
        };
        var OmnitureVarsToClear = ['eVar24', 'prop47'];
        var OmnitureVarTypes = { 'eVar24': 0, 'prop47': 1 };
        var OmnitureVarTypeLengths = [250, 100];

        var clearOmnitureVars = function () {
            if (omnitureTrackingOn()) {
                var count = OmnitureVarsToClear.length;

                for (var i = 0; i < count; i++) {
                    s[OmnitureVarsToClear[i]] = '';
                }
            }
        };
        var setOmnitureEventVars = function (varNames, varValues) {
            if (omnitureTrackingOn()) {
                var count = varNames.length;

                for (var i = 0; i < count; i++) {
                    if (OmnitureVarTypes[varNames[i]]) {
                        s[varNames[i]] = escape(varValues[i]).substr(0, OmnitureVarTypeLengths[OmnitureVarTypes[varNames[i]]]);
                    }
                    else {
                        s[varNames[i]] = escape(varValues[i]);
                    }
                }
            }
        };
        var omnitureTrackingOn = function () {
            return typeof (s) !== 'undefined';
        }; // Video Player API
        var openVideoGameVideo = function (hostId, objectId, url, mediaTitle, ratingID, ratingDescriptorIDs, culture, uiCulture, onClose) {
            createSilverlightObject(hostId, objectId, culture, uiCulture, populateGameVideoInitParams(url, mediaTitle, ratingID, ratingDescriptorIDs, onClose), onClose);
        };
        var openVideoOther = function (hostId, objectId, url, mediaTitle, minimumAge, culture, uiCulture, onClose) {
            createSilverlightObject(hostId, objectId, culture, uiCulture, populateOtherVideoInitParams(url, mediaTitle, minimumAge, onClose), onClose);
        };
        var openVideoMovie = function (hostId, objectId, mediaId, mediaTitle, culture, uiCulture, onClose) {
            createSilverlightObject(hostId, objectId, culture, uiCulture, populateGuidInitParams("Movie", mediaId, mediaTitle, onClose), onClose);
        };
        var openVideoMovieTrailer = function (hostId, objectId, mediaId, mediaTitle, culture, uiCulture, onClose) {
            createSilverlightObject(hostId, objectId, culture, uiCulture, populateGuidInitParams("MovieTrailer", mediaId, mediaTitle, onClose), onClose);
        };
        var openVideoTVEpisode = function (hostId, objectId, mediaId, mediaTitle, culture, uiCulture, onClose) {
            createSilverlightObject(hostId, objectId, culture, uiCulture, populateGuidInitParams("TVEpisode", mediaId, mediaTitle, onClose), onClose);
        }; // public functions
        return {
            openVideoGameVideo: openVideoGameVideo,
            openVideoOther: openVideoOther,
            openVideoMovie: openVideoMovie,
            openVideoMovieTrailer: openVideoMovieTrailer,
            openVideoTVEpisode: openVideoTVEpisode,
            closeSilverlightObject: closeSilverlightObject,
            postToOmniture: postToOmniture,
            loaded: loaded,
            VideoPlayerUrl: reddah.videoPlayer.VideoPlayerUrl,
            txtPlaybackErrorTitle: reddah.videoPlayer.txtPlaybackErrorTitle,
            txtPlaybackErrorActiveXDescription: reddah.videoPlayer.txtPlaybackErrorActiveXDescription,
            txtPlaybackErrorGenericDescription: reddah.videoPlayer.txtPlaybackErrorGenericDescription,
            txtPlaybackErrorUnsupportedBrowser: reddah.videoPlayer.txtPlaybackErrorUnsupportedBrowser,
            txtPlaybackErrorClose: reddah.videoPlayer.txtPlaybackErrorClose,
            timeout: timeout
        };
    })();

    reddah.videoPlayer = videoPlayer;
})();