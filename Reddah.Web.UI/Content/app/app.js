angular.module("reddahApp", [])
.controller("appCtrl", ['$scope', 'loginSvc', function ($scope, loginSvc) {
    $scope.subpost = function (str, n) {
        var r = /[^\u4e00-\u9fa5]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n / 2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + "...";
            }
        }
        return str;
    };
    $scope.toTop = function () {
        $("html,body").animate({ scrollTop: 0 }, 500);
    };
    $scope.htmlDecode = function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/&#183;/g, "\·");

        return s;
    };
    $scope.urlDecode = function (str) {
        var s = "";
        if (str.length == 0) return "";

        s = $scope.htmlDecode(str).replace(/ /g, "-");
        s = s.replace(/--/g, "-");
        s = s.replace(/[^a-zA-Z0-9\-\u4e00-\u9fa5]/g, "");

        return s;
    };
    $scope.summary = function (str, n) {
        str = $scope.htmlDecode(str).replace(/<[^>]+>/g, "");
        return $scope.subpost(str, n);
    };


    $scope.verify = null;
    $scope.loginModel = { UserName: "", Password: "", RememberMe: false, ReturnUrl: window.location.href, Error: "", Token: "", Locale: "en-us" };
    $scope.showPanel = function () {
        $('div#BroswerOpacify').show();
        $('div#LoginRegisterPanel').show();
        var toAlign = $('div#LoginRegisterPanel');
        toAlign.css('top', (($(window).height() - toAlign.outerHeight()) / 2) + $(window).scrollTop() + 'px');
        toAlign.css('left', (($(window).width() - toAlign.outerWidth()) / 2) + $(window).scrollLeft() + 'px');
    };
    $scope.hidePanel = function () {
        $('div#BroswerOpacify').hide();
        $('div#LoginRegisterPanel').hide();
    }
    $scope.showImage = function (box, index) {
        if ($('.' + box + ' img#org_image_' + index).attr("src") === "/content/images/noimage.jpg")
            return;
        $('.' + box + ' img#org_image_' + index).toggle();
    }
    $scope.toggleArticle = function (box, index) {
        $('.' + box + ' div#org_article_' + index).toggle();
    }
    $scope.vote = function (articleId, value, orgCount, page, tick) {
        $scope.voteModel = {
            ArticleId: articleId,
            Value: value,
            Locale: 'en-us'
        };

        if ($scope.verify == null)
            $scope.verify = articleId + tick;
        else {
            if ($scope.verify == articleId + tick) {
                return;
            }
            $scope.verify = articleId + tick;
        }

        loginSvc.vote($scope.voteModel).then(function (data) {
            if (data.success == true) {
                var newCount = value == "up" ? orgCount + 1 : orgCount - 1;
                $('.' + page + ' span#vote-count-post-' + articleId).text(newCount);
                if (page == "articleContent" || page == "articleContentMobile") {
                    $('#voteButton').hide();
                    $('#voteInfo').hide();
                    $('#voteThanks').show();
                }
            }
            else {
                var str = '';
                for (var error in data.errors) {
                    str += data.errors[error] + '\n';
                }
                alert(str);
            }
        })
    }
}])