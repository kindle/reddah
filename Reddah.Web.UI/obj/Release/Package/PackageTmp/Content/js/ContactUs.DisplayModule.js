contactUsModule.displayContact = (function () {
    
    var setContactUsProductIconMouseEvents = function (selector) {
        var iconImageSelector = " .contactUsProductIcon img";
        var selectorId = $(selector).attr("id");
        var productIconSelector = "#" + selectorId + iconImageSelector;
        var iconOutHoverPath = $(productIconSelector).attr("src") + "";
        var iconPath = iconOutHoverPath.replace("Hover", "");
        var iconHoverPath = iconPath.replace(".png", "Hover.png");

        $(selector).mouseout(function () {
            $(productIconSelector).attr("src", iconPath);
        });

        $(selector).mouseover(function () {
            $(productIconSelector).attr("src", iconHoverPath);
        });
    };
    
    var setContactUsProductsIconMouseEvents = function () {
        var contactUsProducts = $(".contactUsProductItem");
        contactUsProducts.each(function () {
            setContactUsProductIconMouseEvents(this);
        });
    };
    
    return {
        setContactUsProductsIconMouseEvents: setContactUsProductsIconMouseEvents
    };
}());