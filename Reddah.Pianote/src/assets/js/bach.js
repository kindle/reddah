/* Created by ShearSpire Media 
http://www.shearspiremedia.com 
*/
(function() {
    let noteheads1, noteheads2, notecount1, notecount2;
    let voice1positions, voice2positions;
    let audioplayer, notation, temposlider, notationholder;
    let timerid = 0;
    let mp3Duration = 0;
    let voice1color = "rgb(255,0,0)";
    let voice2color = "rgb(0,255,128)";
    let defaultcolor = "rgb(0,0,0)";
    let systemms = [0, 10200, 21000, 31450, 42700, 52500, 58400, 70000];
    let systemcount = 7;

    function init() {
        notationholder = document.getElementById("notationholder");
        temposlider = document.getElementById("temposlider");
        audioplayer = document.getElementById("audioplayer");
        notation = document.getElementById("notation");
        noteheads1 = document.getElementsByClassName("noteheadcolor1");
        noteheads2 = document.getElementsByClassName("noteheadcolor2");
        notecount1 = noteheads1.length;
        notecount2 = noteheads2.length;

        audioplayer.onplay = startmonitor;
        audioplayer.onpause = stopmonitor;
        audioplayer.onended = stopmonitor;
        audioplayer.ontimeupdate = updateScroll;
        temposlider.onchange = changeTempo;
        let i;
        for (i = 0; i < notecount1; i++) {
            noteheads1[i].style.fill = "rgb(0,0,0)";
            noteheads1[i].notenumber = i;
            noteheads1[i].voicenumber = 1;
            noteheads1[i].addEventListener("click", goNote, false);
        }
        for (i = 0; i < notecount2; i++) {
            noteheads2[i].style.fill = "rgb(0,0,0)";
            noteheads2[i].notenumber = i;
            noteheads2[i].voicenumber = 2;
            noteheads2[i].addEventListener("click", goNote, false);
        }
        createPositions();
        window.onresize = resizeElements;
    }

    function changeTempo() {
        let t = Number(temposlider.value).toFixed(1);
        document.getElementById("currenttempo").innerHTML = "Tempo (" + t + "x)";
        audioplayer.playbackRate = t;
    }

    function goNote(e) {
        stopmonitor();
        let voice = e.target.voicenumber;
        let note = e.target.notenumber;
        let arr = voice === 1 ? voice1positions : voice2positions;
        let seconds = arr[note] / 1000;
        audioplayer.currentTime = seconds;
        audioplayer.play();
        startmonitor();
    }

    function startmonitor() {
        timerid = window.requestAnimationFrame(monitor);
    }

    function stopmonitor() {
        window.cancelAnimationFrame(timerid);
        let i;
        for (i = 0; i < notecount1; i++) {
            noteheads1[i].style.fill = defaultcolor;
            noteheads1[i].style.stroke = "none";
        }
        for (i = 0; i < notecount2; i++) {
            noteheads2[i].style.fill = defaultcolor;
            noteheads2[i].style.stroke = "none";
        }
    }

    function resizeElements() {
        let w = window.innerWidth;
        let nw = w > 1500 ? 1500 : w;
        let sh = nw >= 1500 ? 320 : (nw / 1500) * 320;
        if (nw < 1500) {
            notationholder.style.height = (2 * sh) + "px";
        }
    }

    function updateScroll() {
        let ms = audioplayer.currentTime * 1000;
        let newsystem = -1;
        for (let i = 0; i < systemcount; i++) {
            if (ms > systemms[i] && ms < systemms[i + 1]) {
                newsystem = i;
            }
        }
        let w = window.innerWidth;
        let nw = w > 1500 ? 1500 : w;
        let sh = nw >= 1500 ? 320 : (nw / 1500) * 320;
        let nh = sh * 7.5;

        if (newsystem >= 0) {
            notationholder.scrollTop = (newsystem / 7) * (nh - (2 * sh));
        }
    }

    function monitor() {
        let ct = audioplayer.currentTime;
        let ms = ct * 1000;
        //console.log("ms: " + ms);
        let cn1 = getVoiceNote(ct)[0];

        if (cn1 > 0) {
            if (noteheads1[cn1 - 1]) {
                noteheads1[cn1 - 1].style.fill = defaultcolor;
                noteheads1[cn1 - 1].style.stroke = "none";
            }
        }

        if (cn1 < notecount1 && cn1 >= 0) {
            let onrest1 = (voice1positions[cn1 + 1] - ms) > 300;
            noteheads1[cn1].style.fill = onrest1 ? defaultcolor : voice1color;
            noteheads1[cn1].style.stroke = onrest1 ? "none" : "rgb(0,0,0)";
            noteheads1[cn1].style.strokeWidth = onrest1 ? 1 : 1.5;
        }

        let cn2 = getVoiceNote(ct)[1];
        if (cn2 > 0) {
            if (noteheads2[cn2 - 1]) {
                noteheads2[cn2 - 1].style.fill = defaultcolor;
                noteheads2[cn2 - 1].style.stroke = "none";

            }
        }

        if (cn2 < notecount2 && cn2 >= 0) {
            let onrest2 = (ms > 19100 && ms < 19900) || (ms > 27100 && ms < 27430);

            noteheads2[cn2].style.fill = onrest2 ? defaultcolor : voice2color;
            noteheads2[cn2].style.stroke = onrest2 ? "none" : "rgb(0,0,0)";
            noteheads2[cn2].style.strokeWidth = onrest2 ? 1 : 1.5;
            //noteheads2[cn2].style.fill = voice2color;
        }
        timerid = window.requestAnimationFrame(monitor);
    }

    function getVoiceNote(ct) {
        let n = [-1, -1];
        let pc = ct / mp3Duration;
        let ms = ct * 1000;
        let i;
        for (i = 1; i <= notecount1; i++) {
            if (ms >= voice1positions[i - 1] && ms < voice1positions[i]) {
                n[0] = i - 1;
            }
        }
        for (i = 1; i <= notecount2; i++) {
            if (ms >= voice2positions[i - 1] && ms < voice2positions[i]) {
                n[1] = i - 1;
            }
        }
        return n;
    }


    function createPositions() {
        mp3Duration = 70;
        voice1positions = [0, 260, 410, 550, 712, 898, 1014, 1223, 1432, 1687, 2082, 2384, 2686, 2895, 3057, 3220, 3359, 3522, 3684, 3847, 4009, 4311, 5612, 5658, 5797, 5983, 6122, 6331, 6494, 6680, 6958, 7307, 7585, 7980, 8166, 8328, 8491, 8653, 8862, 9025, 9187, 9327, 9698, 9977, 10325, 10650, 10859, 10999, 11161, 11324, 11695, 11997, 12183, 12345, 12485, 12694, 13019, 13321, 13530, 13692, 13855, 14017, 14366, 14644, 16293, 16386, 16548, 16711, 16897, 17059, 17222, 17384, 17732, 18011, 18429, 18684, 18847, 19056, 19219, 19427, 19567, 19729, 19892, 20078, 20426, 20751, 21099, 21424, 21564, 21726, 21889, 22098, 22214, 22423, 22585, 22794, 23096, 23421, 23746, 24095, 24257, 24420, 24559, 24722, 24884, 25093, 25186, 25395, 25767, 26092, 26417, 26719, 26881, 27044, 27183, 27392, 27531, 27717, 27856, 28089, 28390, 28715, 28924, 29064, 29226, 29366, 29714, 30016, 30225, 30387, 30550, 30712, 31014, 31386, 31548, 31711, 31897, 32013, 32222, 32384, 32593, 32733, 32895, 33011, 33197, 33359, 34878, 35078, 35263, 35426, 35565, 35728, 35890, 36076, 36216, 36424, 36564, 36726, 37632, 37748, 37911, 38096, 38212, 38421, 38561, 38746, 38886, 39095, 39211, 39397, 40279, 40395, 40558, 40720, 40883, 41092, 41231, 41417, 41556, 41719, 41881, 42044, 42949, 43065, 43251, 43414, 43599, 43762, 43878, 44087, 44180, 44389, 44528, 44714, 45596, 45712, 45852, 46061, 46223, 46432, 46548, 46711, 47082, 47384, 47709, 48081, 48220, 48429, 48545, 48754, 48894, 49079, 49219, 49428, 49567, 49730, 49915, 50078, 50264, 50426, 50589, 50751, 50914, 51123, 51262, 51425, 51564, 51750, 51912, 52098, 52260, 52423, 52586, 52748, 52911, 53096, 53282, 53445, 53584, 53747, 53886, 54095, 54211, 54420, 54582, 54745, 54884, 55093, 55233, 55418, 55558, 55743, 55883, 56115, 56417, 56788, 57090, 57578, 57717, 57880, 58065, 58251, 58414, 58600, 58716, 58878, 59087, 59250, 59389, 59598, 59714, 59923, 60062, 60248, 60411, 60596, 60713, 60898, 61084, 61223, 61432, 61595, 61757, 61920, 62129, 62292, 62454, 62617, 62849, 63058, 63290, 63522, 63685, 63894, 64056, 64219, 64451, 64614, 64822, 65031, 65264, 65449, 65728, 65914, 66262, 66448, 66796, 67028, 67307, 69350];
        voice2positions = [0, 20, 270, 1300, 1450, 1600, 1750, 1900, 2013, 2198, 2338, 2570, 2663, 3081, 3382, 3708, 4033, 4195, 4381, 4543, 4706, 4845, 5031, 5217, 5379, 5704, 6076, 6378, 6703, 6912, 7051, 7214, 7376, 7516, 7701, 7794, 8073, 8375, 8746, 9048, 9350, 9582, 9698, 9907, 10047, 10209, 10372, 10534, 10743, 11068, 11370, 11533, 11695, 11881, 12067, 12369, 12694, 12879, 13042, 13205, 13414, 13715, 14040, 14180, 14366, 14551, 14714, 14900, 15062, 15248, 15410, 15573, 15736, 15875, 16107, 16409, 16711, 17082, 17384, 17570, 17709, 17872, 18081, 18243, 18406, 18568, 18731, 19079, 20240, 20403, 20565, 20751, 20890, 21076, 21239, 21448, 21749, 22098, 22446, 22771, 22910, 23096, 23236, 23398, 23584, 23746, 23862, 24095, 24350, 24815, 25070, 25441, 25534, 25813, 25906, 26115, 26231, 26417, 26579, 26811, 27044, 27438, 27740, 28251, 28414, 28576, 28739, 28878, 29064, 29250, 29412, 29551, 29737, 29900, 30062, 30248, 30364, 30573, 30736, 30875, 31037, 31363, 31595, 31734, 31897, 32082, 32245, 32407, 32733, 33034, 33406, 33545, 33708, 33870, 34033, 34195, 34381, 34544, 34729, 35031, 35449, 35751, 36076, 36935, 37075, 37237, 37446, 37702, 38073, 38375, 38746, 39559, 39699, 39907, 40070, 40395, 40743, 41045, 41440, 42229, 42346, 42531, 42740, 43065, 43414, 43739, 44110, 44946, 45039, 45248, 45434, 45736, 46107, 46432, 46734, 46897, 47082, 47245, 47408, 47570, 47733, 47895, 48104, 48243, 48429, 48545, 48778, 48917, 49079, 49242, 49404, 49567, 49730, 49915, 50101, 50240, 50403, 50565, 50774, 51076, 51448, 51750, 52098, 52446, 52795, 53096, 53468, 53770, 54095, 54397, 54815, 55117, 55442, 56231, 56370, 56579, 56742, 56904, 57067, 57206, 57439, 57694, 58112, 58414, 58762, 59064, 59435, 59737, 60132, 60411, 60805, 61084, 61432, 61734, 62129, 62408, 62872, 63267, 63731, 64033, 64451, 64799, 65240, 65682, 66216, 69699];
    }
    document.addEventListener('DOMContentLoaded', function(e) {
        try {
            init();
        } catch (e) {
            console.log("Data didn't load", e);
        }
    });

})();