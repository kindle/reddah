$(document).ready(function () {
    //process videos specified in cosmos
    //reddah.videoPlayer.VideoPlayerUrl = "http://localhost/Reddah/Content/Silverlight/VideoPlayer.xap?time=123";
    //reddah.videoPlayer.VideoPlayerUrl = "../../Content/Silverlight/VideoPlayer.xap";
    processCosmosVideos();
});

/* Manage videos*/
function isEmpty(str) {
    return (!str || 0 === str.replace(/^\s+|\s+$/, '').length);
}

function normalizeDimension(dimension) {
    dimension = dimension.replace(/\s+/, '');
    if (dimension.indexOf("px") === -1) {
        return dimension + "px";
    }
    return dimension;
}

function openSupportSplashVideoViewer(index, url, mediaTitle, minimumAge, culture, uiCulture) {
    //closeVideoViewer();

    $('.silverlightVideoHost').hide();
    var host = $('#silverlightVideoHost' + index);

    $('#silverlightPreviewHost' + index).hide();

    host.height(host.parent().innerHeight());
    host.width(host.parent().innerWidth());
    reddah.videoPlayer.openVideoOther('silverlightVideoHost' + index, 'silverlightVideoObject', url, mediaTitle, minimumAge, culture, uiCulture, 'onCloseSupportVideoViewer' + index);
}

function onCloseSupportVideoViewer(index) {
    $('#silverlightPreviewHost' + index).show();
    var host = $('#silverlightVideoHost' + index);
    if (host.size() > 0) {
        reddah.videoPlayer.closeSilverlightObject('silverlightVideoHost' + index);
        $('.silverlightVideoHost').show();
    }
}

function processCosmosVideos() {
    //for each tag found we insert in the dom the preview image and prepare the video playback
    $('.supportVideo').each(function (index) {
        if (!isEmpty($(this).attr('videourl')) && !isEmpty($(this).attr('previewimageurl')) && !isEmpty($(this).attr('width')) && !isEmpty($(this).attr('height'))) {
            //reddah.videoPlayer.VideoPlayerUrl = "~/Content/Silverlight/VideoPlayer.xap?time=123";
            //reddah.videoPlayer.VideoPlayerUrl = @HttpContext.Current.Server.MapPath("~/Content/Silverlight/VideoPlayer.xap");
            //alert(reddah.videoPlayer.VideoPlayerUrl);
            var title = "Video";
            if (!isEmpty($(this).attr('title'))) {
                title = $(this).attr('title');
            }

            var locale = "en-us";
            if ($(this).attr('locale') !== undefined && !isEmpty($(this).attr('locale'))) {
                locale = $(this).attr('locale');
            }
            var slCultureParameter;
            switch (locale.toLowerCase()) {
                case "en-ae":
                    slCultureParameter = "'ar-ae', 'en-us'";
                    break;
                case "es-us":
                    slCultureParameter = "'es-es', 'en-us'";
                    break;
                case "en-hk":
                    slCultureParameter = "'zh-hk', 'en-us'";
                    break;
                default:
                    slCultureParameter = "'" + locale + "','" + locale + "'";
            }
            var rating = "";
            if ($(this).attr('rating') !== undefined && !isEmpty($(this).attr('rating'))) {
                rating = $(this).attr('rating');
            }

            var overflow = "true";
            if ($(this).attr('overflow') !== undefined && !isEmpty($(this).attr('overflow'))) {
                overflow = $(this).attr('overflow');
            }

            var width = normalizeDimension($(this).attr('width'));
            var height = normalizeDimension($(this).attr('height'));

            var html = "<div style=\"";
            html += "width:" + width + "; ";
            html += "height:" + height + "; ";

            if (overflow === "true") {
                html += "\"><div id=\"silverlightPreviewHost" + index + "\" style=\"width:100%; height:100%;\" ><div style=\"overflow:hidden; position:relative; width:100%; height:100%;\"><a id=\"spplaysmall\" title=\"Play video\" class=\"playSmall\" onclick=\"javascript:openSupportSplashVideoViewer('" + index + "','" + $(this).attr('videourl') + "'";
            }
            else {
                html += "\"><div id=\"silverlightPreviewHost" + index + "\" style=\"width:100%; height:100%;\" ><div style=\"position:relative; width:100%; height:100%;\"><a id=\"spplaysmall\" title=\"Play video\" class=\"playSmall\" onclick=\"javascript:openSupportSplashVideoViewer('" + index + "','" + $(this).attr('videourl') + "'";
            }

            html += ",'" + title + "'";
            html += ",'" + rating + "', " + slCultureParameter + ");\"></a><img width=\"100%\" height=\"100%\" alt=\"" + title + "\"";
            html += " src=\"" + $(this).attr('previewimageurl') + "\"";
            html += "/></div></div><div id=\"silverlightVideoHost" + index + "\"></div></div>";

            //prepare the javascript for onclose
            var javascript = "<script type=\"text/javascript\">";
            javascript += "function onCloseSupportVideoViewer" + index + "(){onCloseSupportVideoViewer(" + index + ");}";
            javascript += "</script>";

            $(this).append(html + javascript);
            //}
        }
    });
}