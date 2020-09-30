(function() {
    var stage = 6,
        active = 1,
        levelCount = $('div[class^=level]').length;
    setTheme();
    createLevels();
    showLevels();

    $('.block').click(function() {
        var x = $(this).attr('class').replace(/\D+/g, '');
        if (active && x) {
            $(this).removeClass('r' + x);
            x++;
            if ($(this).hasClass('straight')) {
                if (x == 3) x = 1;
            } else if (x == 5) {
                x = 1;
            }
            $(this).addClass('r' + x);
            combination();
        }
    });

    $('#gctheme').click(function() {
        console.log('toggle theme')
        $('app-connect').toggleClass('light');
        if ($('app-connect').attr('class') == 'light') {
            $('#gctheme').text('Lights Off');
        } else {
            $('#gctheme').text('Lights On');
        }
        localStorage.setItem('theme', $('app-connect').attr('class'));
    });

    function combination() {
        var x = $('.level' + stage).find('.block'),
            h = '';
        $.each(x, function(i, el) {
            h += $(this).attr('class').replace(/\D+/g, '');
        });
        console.info(h);
        if ($('.level' + stage).data('code') == h) {
            stage++;
            active = 0;
            setTimeout(function() {
                showLevels();
            }, 500);
        }
    }

    function showLevels() {
        console.log('show levels')
        var remove = stage - 1;
        $('#gcwin .text span').text(remove);
        if (stage > levelCount) {
            $('#gcfinished').fadeIn();
        } else if (stage > 1) {
            $('#gcwin').fadeIn();
            setTimeout(function() {
                $('.level' + remove).remove();
                $('div.level' + stage).show();
                $('#gcwin').fadeOut();
                active = 1;
            }, 2000);
        } else {
            $('div.level' + stage).fadeIn();
        }
    }

    function createLevels() {
        console.log('create levels')
        $.each($('div[data-set]'), function(i, el) {
            var levelHtml = '';
            var set = $(this).data('set').split('.');
            $.each(set, function(i, el) {
                var style = 'curve';
                if (set[i][0] == 's') style = 'straight';
                if (set[i][0] == 'e') style = 'end';
                if (set[i][0] == 'b') style = '';
                var rotate = ''
                if (set[i][1]) var rotate = 'r' + set[i][1];
                var double = ''
                if (set[i][2]) var double = 'double';
                levelHtml += '<div class="block ' + style + ' ' + double + ' ' + rotate + '"></div>';
            });
            var text = $(this).data('text');
            if (text) levelHtml += '<div class="text">' + text + '</span></div>';
            $(this).append(levelHtml);
        });
    }

    function setTheme() {
        if (localStorage.theme == 'light') {
            $('app-connect').addClass('light');
            $('#gctheme').text('Lights Off');
        }
    }

})();