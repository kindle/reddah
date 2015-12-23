var StepListArray = new Array();

function loadFirstWizardContent(url, stepUrl, answer, index, solutionIndex) {
    displayLoadingAnim();
    
    getWizardContent(url, stepUrl, index, solutionIndex,
        function (result) {
            removeLoadingAmin(result);

            addEllipsisEffect();

            var itemErray = [stepUrl, $('div#GhostLegendTitle').html(), ''];
            pushStepToStepList(url, itemErray, answer, solutionIndex);

            adaptVideoSize();

            processCosmosVideos();
        },
        function () {
            alert("error");
            $('#LoadingAnimation').removeClass('LoadingAnimation50');
        });
}

function pushStepToStepList(url, stepData, answer, sIndex) {
    StepListArray.push(stepData);
    var currentstep = "<div id=\"Step" + (StepListArray.length - 1) + "\" class=\"WizardStepListItem Current\"><div class=\"StepIcon\">" + StepListArray.length + "</div><div class=\"StepText\"><div class=\"LinkedStepName\"><a href=\"javascript:changeIndexInStepList('" + url + "', '" + (StepListArray.length - 1) + "', '" + sIndex + "')\">" + stepData[1] + "</a></div><div class=\"StepName\">" + stepData[1] + "</div><div class=\"StepResponse\"></div></div>";
    $('div.WizardStepList').append(currentstep);
    if (StepListArray.length > 1 && $('div.WizardStepList').children('div.Current').size() > 1) {
        $('div.WizardStepList').children('div.Current').first().removeClass('Current').addClass('Visited');
    }

    if (StepListArray.length > 1) {
        StepListArray[StepListArray.length - 1][2] = answer;
    }

    $('div.WizardStepList').children('div.Visited').last().children('div.StepText').children('div.StepResponse').html(answer);
    $('div.WizardStepList').children('div.Visited').last().children('div.StepIcon').empty();
}


function displayLoadingAnim() {
    $('div.WizardStepContent').html("<div id='LoadingAnimation' class='LoadingAnimation50'></div>");
}

function removeLoadingAmin(content) {
    $('#LoadingAnimation').removeClass('LoadingAnimation50');
    $('div.WizardStepContent').append(content);
}

function getWizardContent(url, compassUrl, index, solutionIndex, successFunction, errorFunction, ispValue, routerManufacturerValue, routerModelValue, modemManufacturerValue, modemModelValue) {
    return $.ajax({
        type: "GET",
        url: url,
        data: 'path=' + compassUrl + '&StepIndex=' + index + '&SolutionIndex=' + solutionIndex,
        dataType: 'html',
        error: function () {
            if (errorFunction) {
                errorFunction();
            }
        },
        success: function (response) {
            successFunction(response);
        }
    });
}

function addEllipsisEffect() {
    $.each($('div.ProposalBottom'), function () {
        applyPseudoEllipsisStyle($(this));
    });
}

function applyPseudoEllipsisStyle(div) {
    $.each($(div), function () {
        var height = $(this).height();
        var span = $(this).children('span');
        var isModified = false;
        while ($(span).outerHeight() > height) {
            $(span).text(function (index, text) {
                isModified = true;
                return text.substr(0, text.length - 1);
            });
        }

        if (isModified) {
            var spanText = $(span).text();
            $(span).text(spanText.substr(0, spanText.length - 3) + "...");
        }
    });
}

function adaptVideoSize() {
    $("div.VideoModuleMediumImage").attr({
        width: '295px',
        height: '165px'
    });
    $("div.VideoModuleMediumImage").children("div.supportVideo").attr({
        width: '295px',
        height: '165px'
    });

    $("div.VideoModuleLargeImage").attr({
        width: '605px',
        height: '340px'
    });
    $("div.VideoModuleLargeImage").children("div.supportVideo").attr({
        width: '605px',
        height: '340px'
    });
}

function toggleLinkedStepNameTag(tagIn, tagOut) {
    $('div.LinkedStepName').find(tagIn).each(function () {
        var temp = $('<' + tagOut + '/>');
        temp.html($(this).html());
        temp.attr("href", $(this).attr("href"));
        $(this).replaceWith(temp);
    });
}

function selectAnAnswer(url, stepUrl, answer, index, solutionIndex, ispValue, routerManufacturerValue, routerModelValue, modemManufacturerValue, modemModelValue) {
    var indexInt = parseInt(index, 10);
    window.scrollTo(0, 0);
    displayLoadingAnim();
    toggleLinkedStepNameTag('a', 'span');
    /*if (indexInt < StepListArray.length)
    {
        if (stepUrl.toString() !== StepListArray[indexInt][0].toString() ||
           (stepUrl.toString() === StepListArray[indexInt][0].toString() && answer.toString() !== StepListArray[indexInt][2].toString()) ||
           (typeof resources !== 'undefined' && resources.CommonAnswer !== 'undefined' && answer.toString() === resources.CommonAnswer)) {
            $.each($('div#Step' + (indexInt - 1).toString()).siblings('div.WizardStepListItem'), function () {
                var i = $(this).attr('id').substring(4);
                if (indexInt <= parseInt(i, 10)) {
                    $(this).remove();
                }
            });

            $('div#Step' + (indexInt - 1).toString()).children('div.StepText').children('div.StepResponse').empty();

            StepListArray.splice((indexInt), (StepListArray.length - (indexInt)));
        }
        else
        {
            //modifyStepListStyle(index);
        }
    }*/
    
    getWizardContent(url, stepUrl, index, solutionIndex,
        function (result) {
            removeLoadingAmin(result);
            toggleLinkedStepNameTag('span', 'a');
            addEllipsisEffect();

            if (StepListArray.length === indexInt || stepUrl.toString() !== StepListArray[indexInt][0].toString()) {
                pushStepToStepList(url, [stepUrl, $('div#GhostLegendTitle').html(), ''], answer, solutionIndex);

                modifyStepListStyle(index);
            }

            adaptVideoSize();

            processCosmosVideos();
        },

        function () {
            $('#LoadingAnimation').removeClass('LoadingAnimation50');
            toggleLinkedStepNameTag('span', 'a');
    });
}

function modifyStepListStyle(ind) {
    var stepText = $('div#Step' + ind).children('div.StepText');
    stepText.children('div.StepName').show();
    stepText.children('div.LinkedStepName').hide();
    $.each($('div#Step' + ind).siblings('div.WizardStepListItem'), function () {
        $(this).children('div.StepText').children('div.StepName').hide();
        $(this).children('div.StepText').children('div.LinkedStepName').show();
    });
}

function changeIndexInStepList(url, index, solutionIndex) {
    var indexInt = parseInt(index, 10);
    var solutionIndexInt = parseInt(solutionIndex, 10);

    window.scrollTo(0, 0);

    displayLoadingAnim();
    toggleLinkedStepNameTag('a', 'span');

    modifyStepListStyle(index);

    getWizardContent(url, StepListArray[indexInt][0], indexInt, solutionIndexInt,
                function (result) {
                    removeLoadingAmin(result);
                    toggleLinkedStepNameTag('span', 'a');
                    addEllipsisEffect();

                    adaptVideoSize();

                    processCosmosVideos();
                },
                function () {
                    $('#LoadingAnimation').removeClass('LoadingAnimation50');
                    toggleLinkedStepNameTag('span', 'a');
                });
}