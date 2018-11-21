var contactUsModule = contactUsModule || {};

var ajaxProductRequest;
var ajaxCategoryRequest;

var loadingSelector = '#LoadingContactUsProducts';
var contactUsCategoriesSelector = "#contactUsProductsWithCategories";
var arrowSelector = '#triangle';

var getContactUsProductsWithCategories = function (culture) {
    var contactUsProducts = $(".contactUsProductItem");
    contactUsProducts.keypress(function (e) {
        var keyNum = getKeyNum(e);
        // enter key
        if (keyNum === 13) {
            getProductsWithCategoriesForRootProduct(culture, this);
        }
    });

    contactUsProducts.click(function () {
        getProductsWithCategoriesForRootProduct(culture, this);
    });
};

function getKeyNum(e) {
    if (window.event) // IE
    {
        return e.keyCode;
    }
    else if (e.which) // Netscape/Firefox/Opera
    {
        return e.which;
    }

    return null;
}

var getProductsWithCategoriesForRootProduct = function(culture, selector, isBack) {
    if (ajaxProductRequest !== null && ajaxProductRequest !== undefined) {
        ajaxProductRequest.abort();
    }

    var path = $(selector).attr("link");
    
    $(".selectedContactUsProduct").addClass("contactUsProductItem").removeClass("selectedContactUsProduct");
    $(selector).addClass("selectedContactUsProduct").removeClass("contactUsProductItem");
    
    $(loadingSelector).addClass('LoadingAnimationContactUsProducts lightGreyBorder');
    $(contactUsCategoriesSelector).html("");
    $(contactUsCategoriesSelector).removeClass("lightGreyBorder");
    setLittleArrow(loadingSelector);

    ajaxProductRequest = $.ajax({
        type: "GET",
        url: '/' + culture + '/ContactSupport/GetContactUsProductsWithCategories',
        //data: "path=" + encodeURIComponent(path) + "&title=" + encodeURIComponent(title.replace(/\<|\>/g, '')) + "&navigationTestPath=" + navigationTestPath,
        data: "path=" + path,
        dataType: "text",
        success: function (result) {
            $(loadingSelector).removeClass('LoadingAnimationContactUsProducts lightGreyBorder');
            $(arrowSelector).removeClass('LittleArrow');
            $(contactUsCategoriesSelector).html(result);
            $(contactUsCategoriesSelector).addClass("lightGreyBorder");
            

            setLittleArrow(contactUsCategoriesSelector);
        },
        error: function () {
            alert("error");
            //$(loadingSelector).removeClass('LoadingAnimationContactUsProducts lightGreyBorder');
        }
    });
};

var setLittleArrow = function (selectorToMatchWith) {
    $(arrowSelector).addClass('LittleArrow');
    $(arrowSelector).css("left", $("div[class='selectedContactUsProduct']").position().left + 67 + "px");
    $(arrowSelector).css("top", $(selectorToMatchWith).position().top - 14 + "px");
};

var addMarginsToProductBoxes = function () {
    for (var i = 0; i < 5; i++) {
        var selector = $('div[index ="' + i + '"]');
        if (selector.length !== 0) {
            selector.css("margin-right", "11px");
        }
    }

    $(".contactUsProductItem:last").css("margin-right", "0px");
};

var normaliseProductsBoxesHeight = function () {
    // if one of the ProductBoxes is higher than the other, 
    // reshape all the boxes to the height of the heighest
    var highestHeight = $('div[index ="0"]').height();
    var flag = false;
    for (var i = 1; i < 6; i++) {
        var selector = $('div[index ="' + i + '"]');
        if (selector.length !== 0) {
            if (selector.height() > highestHeight) {
                highestHeight = selector.height();
                flag = true;
            }
        }
    }

    if (flag) {
        for (var i = 0; i < 6; i++) {
            selector = $('div[index ="' + i + '"]');
            if (selector.length !== 0) {
                selector.css("height", highestHeight);
            }
        }
    }
};