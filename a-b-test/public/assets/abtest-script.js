// Add this to a JavaScript file in your theme or as a script tag
console.log("🚀 A/B Test cart attribute script loaded");
console.log("🚀 Start");
var cf_finalDevId;



function cf_callbody() {

    var cf_debugGen = false;

    var cf_finalBrowserId = "dummy_browserid";
    var cf_finalBrowserIdV2 = "dummy_browseridV2";
    var cf_browserIdStr = "dummy_browseridStr";
    var cf_browserIdStrV2 = "dummy_browseridStrV2";
    var cf_browserIdStrV2part = "dummy_cf_browserIdStrV2part";
    var cf_browserIndStr = "dummy_browserIndStr";


    (function (window) {
        {
            var unknown = '-';

            // screen
            var screenSize = '';
            if (screen.width) {
                width = (screen.width) ? screen.width : '';
                height = (screen.height) ? screen.height : '';
                screenSize += '' + width + " x " + height;
            }

            // browser
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browser = navigator.appName;
            var version = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // Opera Next
            if ((verOffset = nAgt.indexOf('OPR')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 4);
            }
            // Legacy Edge
            else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
                browser = 'Microsoft Legacy Edge';
                version = nAgt.substring(verOffset + 5);
            }
            // Edge (Chromium)
            else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
                browser = 'Microsoft Edge';
                version = nAgt.substring(verOffset + 4);
            }
            // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
            }
            // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                browser = 'Chrome';
                version = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                browser = 'Safari';
                version = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                browser = 'Firefox';
                version = nAgt.substring(verOffset + 8);
            }
            // MSIE 11+
            else if (nAgt.indexOf('Trident/') != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(nAgt.indexOf('rv:') + 3);
            }
            // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                version = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() == browser.toUpperCase()) {
                    browser = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

            majorVersion = parseInt('' + version, 10);
            if (isNaN(majorVersion)) {
                version = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // mobile version
            var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

            // cookie
            var cookieEnabled = (navigator.cookieEnabled) ? true : false;

            if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
            }

            // system
            var os = unknown;
            var clientStrings = [
                { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
                { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
                { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
                { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
                { s: 'Windows Vista', r: /Windows NT 6.0/ },
                { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
                { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
                { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
                { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
                { s: 'Windows 98', r: /(Windows 98|Win98)/ },
                { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
                { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
                { s: 'Windows CE', r: /Windows CE/ },
                { s: 'Windows 3.11', r: /Win16/ },
                { s: 'Android', r: /Android/ },
                { s: 'Open BSD', r: /OpenBSD/ },
                { s: 'Sun OS', r: /SunOS/ },
                { s: 'Chrome OS', r: /CrOS/ },
                { s: 'Linux', r: /(Linux|X11(?!.*CrOS))/ },
                { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
                { s: 'Mac OS X', r: /Mac OS X/ },
                { s: 'Mac OS', r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
                { s: 'QNX', r: /QNX/ },
                { s: 'UNIX', r: /UNIX/ },
                { s: 'BeOS', r: /BeOS/ },
                { s: 'OS/2', r: /OS\/2/ },
                { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
            ];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS':
                case 'Mac OS X':
                case 'Android':
                    osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1];//+ '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;
            }

            cf_platform = navigator.platform;
            window.cf_browser = browser;

            // flash (you'll need to include swfobject)
            /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
            var flashVersion = 'no check';
            if (typeof swfobject != 'undefined') {
                var fv = swfobject.getFlashPlayerVersion();
                if (fv.major > 0) {
                    flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
                }
                else {
                    flashVersion = unknown;
                }
            }
        }

        window.cf_jscd = {
            mobile: mobile,
            os: os,
            //osVersion: osVersion,
            platform: cf_platform
        };
    }(this));

    (function () {
        var LanguageDetector, root, safeParseJSON;

        root = typeof exports !== "undefined" && exports !== null ? exports : this;

        safeParseJSON = function (s) {
            try {
                return JSON.parse(s);
            } catch (error) {
                return false;
            }
        };

        LanguageDetector = (function () {
            function LanguageDetector() {
                this.names = safeParseJSON('[ "Latin", "Chinese", "Arabic", "Devanagari", "Cyrillic", "Bengali/Assamese", "Kana", "Gurmukhi", "Javanese", "Hangul", "Telugu", "Tamil", "Malayalam", "Burmese", "Thai", "Sundanese", "Kannada", "Gujarati", "Lao", "Odia", "Ge-ez", "Sinhala", "Armenian", "Khmer", "Greek", "Lontara", "Hebrew", "Tibetan", "Georgian", "Modern Yi", "Mongolian", "Tifinagh", "Syriac", "Thaana", "Inuktitut", "Cherokee" ]');
                this.codes = safeParseJSON("[[76,97,116,105,110], [27721,23383], [1575,1604,1593,1585,1576,1610,1577], [2342,2375,2357,2344,2366,2327,2352,2368], [1050,1080,1088,1080,1083,1080,1094,1072], [2476,2494,2434,2482,2494,32,47,32,2437,2488,2478,2496,2479,2492,2494], [20206,21517], [2583,2625,2608,2606,2625,2582,2624], [43415,43438], [54620,44544], [3108,3142,3122,3137,3095,3137], [2980,2990,3007,2996,3021], [3374,3378,3375,3390,3379,3330], [4121,4156,4116,4154,4121,4140], [3652,3607,3618], [7070,7077,7060,7082,7059], [3221,3240,3277,3240,3233], [2711,2753,2716,2736,2750,2724,2752], [3749,3762,3751], [2825,2852,2893,2837,2867], [4877,4821,4829], [3523,3538,3458,3524,3517], [1344,1377,1397,1400,1409], [6017,6098,6040,6082,6042], [917,955,955,951,957,953,954,972], [6674,6682,6664,6673], [1488,1500,1508,1489,1497,1514], [3926,3964,3921,3851], [4325,4304,4320,4311,4323,4314,4312], [41352,41760], [6190,6179,6185,6189,6179,6191], [11612,11593,11580,11593,11599,11568,11606], [1808,1834,1825,1821,1808], [1931,1960,1928,1964,1920,1960], [5123,5316,5251,5198,5200,5222], [5091,5043,5033], [55295, 7077]]");
                this.fontSize = 9;
                this.fontFace = "Verdana";
                this.extraHeigth = 15;
                this.results = [];
            }

            LanguageDetector.prototype.begin = function () {
                var c, code, h, height, i, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, o, p, ref, ref1, ref2, ref3, round, s, w, width;
                round = 0;
                this.widths = [];
                this.heights = [];
                this.support = [];
                this.test_div = document.createElement("div");
                document.body.appendChild(this.test_div);
                this.test_div.id = "WritingTest";
                ref = this.codes;
                for (i = 0, len = ref.length; i < len; i++) {
                    code = ref[i];
                    this.height = [];
                    this.width = [];
                    this.div = document.createElement("div");
                    this.test_div.appendChild(this.div);
                    round += 1;
                    this.div.id = round;
                    this.div.style.display = "inline-block";
                    for (j = 0, len1 = code.length; j < len1; j++) {
                        c = code[j];
                        this.div.innerHTML = ("<font face = '" + this.fontFace + "' size = ") + this.fontSize + ">&#" + c + "</font>";
                        this.height.push(document.getElementById(round).clientHeight);
                        this.width.push(document.getElementById(round).clientWidth);
                    }
                    this.div.innerHTML = "";
                    for (k = 0, len2 = code.length; k < len2; k++) {
                        c = code[k];
                        this.div.innerHTML += ("<font face = '" + this.fontFace + "' size = ") + this.fontSize + ">&#" + c + "</font>";
                    }
                    this.test_div.innerHTML += this.height + ";" + this.width + "<br>";
                    this.heights.push(this.height);
                    this.widths.push(this.width);
                }
                this.tw = this.widths.pop();
                this.sw1 = this.tw[0];
                this.sw2 = this.tw[1];
                this.sh = this.heights.pop()[0];
                ref1 = this.heights;
                for (l = 0, len3 = ref1.length; l < len3; l++) {
                    height = ref1[l];
                    this.passed = 0;
                    for (m = 0, len4 = height.length; m < len4; m++) {
                        h = height[m];
                        if (h !== this.sh) {
                            this.support.push(true);
                            this.passed = 1;
                            break;
                        }
                    }
                    if (this.passed === 0) {
                        this.support.push(false);
                    }
                }
                this.writing_scripts_index = 0;
                ref2 = this.widths;
                for (n = 0, len5 = ref2.length; n < len5; n++) {
                    width = ref2[n];
                    for (o = 0, len6 = width.length; o < len6; o++) {
                        w = width[o];
                        if (this.support[this.writing_scripts_index] === false) {
                            if (w !== this.sw1 && w !== this.sw2) {
                                this.support[this.writing_scripts_index] = true;
                            }
                        }
                    }
                    this.writing_scripts_index += 1;
                }
                this.res = [];
                this.writing_scripts_index = 0;
                ref3 = this.support;
                for (p = 0, len7 = ref3.length; p < len7; p++) {
                    s = ref3[p];
                    this.test_div.innerHTML += this.names[this.writing_scripts_index] + ": " + s + " <br>";
                    if (s === true) {
                        this.res.push(this.names[this.writing_scripts_index]);
                    }
                    this.writing_scripts_index += 1;
                }
                this.test_div.remove();
                return this.res;
            };

            return LanguageDetector;

        })();

        root.get_writing_scripts = function () {
            var detector;
            detector = new LanguageDetector;
            return this.res = detector.begin();
        };

    }).call(this);


    (function (root, ns, factory) {
        "use strict";
        "undefined" != typeof module && module.exports ? module.exports = factory(ns, root) : "function" == typeof define && define.amd ? define("detect-zoom", function () {
            return factory(ns, root)
        }) : root[ns] = factory(ns, root)
    })(window, "detectZoom", function () {
        var devicePixelRatio = function () {
            return window.devicePixelRatio || 1
        },
            fallback = function () {
                return {
                    zoom: 1,
                    devicePxPerCssPx: 1
                }
            },
            ie8 = function () {
                var zoom = Math.round(100 * (screen.deviceXDPI / screen.logicalXDPI)) / 100;
                return {
                    zoom: zoom,
                    devicePxPerCssPx: zoom * devicePixelRatio()
                }
            },
            ie10 = function () {
                var zoom = Math.round(100 * (document.documentElement.offsetHeight / window.innerHeight)) / 100;
                return {
                    zoom: zoom,
                    devicePxPerCssPx: zoom * devicePixelRatio()
                }
            },
            webkitMobile = function () {
                var deviceWidth = 90 == Math.abs(window.orientation) ? screen.height : screen.width,
                    zoom = deviceWidth / window.innerWidth;
                return {
                    zoom: zoom,
                    devicePxPerCssPx: zoom * devicePixelRatio()
                }
            },
            webkit = function () {
                var important = function (str) {
                    return str.replace(/;/g, " !important;")
                },
                    div = document.createElement("div");
                div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0", div.setAttribute("style", important("font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;"));
                var container = document.createElement("div");
                container.setAttribute("style", important("width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;")), container.appendChild(div), document.body.appendChild(container);
                var zoom = 1e3 / div.clientHeight;
                return zoom = Math.round(100 * zoom) / 100, document.body.removeChild(container), {
                    zoom: zoom,
                    devicePxPerCssPx: zoom * devicePixelRatio()
                }
            },
            firefox4 = function () {
                var zoom = mediaQueryBinarySearch("min--moz-device-pixel-ratio", "", 0, 10, 20, 1e-4);
                return zoom = Math.round(100 * zoom) / 100, {
                    zoom: zoom,
                    devicePxPerCssPx: zoom
                }
            },
            firefox18 = function () {
                return {
                    zoom: firefox4().zoom,
                    devicePxPerCssPx: devicePixelRatio()
                }
            },
            opera11 = function () {
                var zoom = window.top.outerWidth / window.top.innerWidth;
                return zoom = Math.round(100 * zoom) / 100, {
                    zoom: zoom,
                    devicePxPerCssPx: zoom * devicePixelRatio()
                }
            },
            mediaQueryBinarySearch = function (property, unit, a, b, maxIter, epsilon) {
                function binarySearch(a, b, maxIter) {
                    var mid = (a + b) / 2;
                    if (0 >= maxIter || epsilon > b - a) return mid;
                    var query = "(" + property + ":" + mid + unit + ")";
                    return matchMedia(query).matches ? binarySearch(mid, b, maxIter - 1) : binarySearch(a, mid, maxIter - 1)
                }
                var matchMedia, head, style, div;
                window.matchMedia ? matchMedia = window.matchMedia : (head = document.getElementsByTagName("head")[0], style = document.createElement("style"), head.appendChild(style), div = document.createElement("div"), div.className = "mediaQueryBinarySearch", div.style.display = "none", document.body.appendChild(div), matchMedia = function (query) {
                    style.sheet.insertRule("@media " + query + "{.mediaQueryBinarySearch " + "{text-decoration: underline} }", 0);
                    var matched = "underline" == getComputedStyle(div, null).textDecoration;
                    return style.sheet.deleteRule(0), {
                        matches: matched
                    }
                });
                var ratio = binarySearch(a, b, maxIter);
                return div && (head.removeChild(style), document.body.removeChild(div)), ratio
            },
            detectFunction = function () {
                var func = fallback;
                return isNaN(screen.logicalXDPI) || isNaN(screen.systemXDPI) ? window.navigator.msMaxTouchPoints ? func = ie10 : "orientation" in window && "string" == typeof document.body.style.webkitMarquee ? func = webkitMobile : "string" == typeof document.body.style.webkitMarquee ? func = webkit : navigator.userAgent.indexOf("Opera") >= 0 ? func = opera11 : window.devicePixelRatio ? func = firefox18 : firefox4().zoom > .001 && (func = firefox4) : func = ie8, func
            }();
        return {
            zoom: function () {
                return detectFunction().zoom
            },
            device: function () {
                return detectFunction().devicePxPerCssPx
            }
        }
    });


    function getOSlanguage() {
        raw_lang = navigator.language;
        //console.log("raw_lang: ", raw_lang);
        if (raw_lang == "en" || raw_lang.toLowerCase() === "en-us") {
            return "en";
        } else {
            return "non-en-US"
        }
    }

    function getResolution() {
        //var zoom_level = detectZoom.device();
        var zoom_level = 1;
        var fixed_width = window.screen.width * zoom_level;
        var fixed_height = window.screen.height * zoom_level;
        //var res = Math.round(fixed_width) + '_' + Math.round(fixed_height) + '_' + zoom_level + '_' + window.screen.width+"_"+window.screen.height+"_"+window.screen.colorDepth+"_"+window.screen.availWidth + "_" + window.screen.availHeight + "_" + window.screen.left + '_' + window.screen.top + '_' + window.screen.availLeft + "_" + window.screen.availTop + "_" + window.innerWidth + "_" + window.outerWidth + "_" + detectZoom.zoom();
        var res = Math.round(fixed_width) + '_' + Math.round(fixed_height) + '_' + zoom_level + '_' + window.screen.width + "_" + window.screen.height + "_" + window.screen.colorDepth;
        return res;
    }

    function audioFPrinting() {
        var finished = false;
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext),
                oscillator = audioCtx.createOscillator(),
                analyser = audioCtx.createAnalyser(),
                gainNode = audioCtx.createGain(),
                scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            var destination = audioCtx.destination;
            //return (audioCtx.sampleRate).toString() + '_' + destination.maxChannelCount + "_" + destination.numberOfInputs + '_' + destination.numberOfOutputs + '_' + destination.channelCount + '_' + destination.channelCountMode + '_' + destination.channelInterpretation;
            return (audioCtx.sampleRate).toString() + "_" + destination.numberOfInputs + '_' + destination.numberOfOutputs + '_' + destination.channelCount + '_' + destination.channelCountMode + '_' + destination.channelInterpretation;
        }
        catch (e) {
            console.log("AUDIO NOT SUPPORTED")
            return "not supported";
        }
    }


    function x64Add(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff]
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff]
        const o = [0, 0, 0, 0]
        o[3] += m[3] + n[3]
        o[2] += o[3] >>> 16
        o[3] &= 0xffff
        o[2] += m[2] + n[2]
        o[1] += o[2] >>> 16
        o[2] &= 0xffff
        o[1] += m[1] + n[1]
        o[0] += o[1] >>> 16
        o[1] &= 0xffff
        o[0] += m[0] + n[0]
        o[0] &= 0xffff
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]]
    }

    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // multiplied together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Multiply(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff]
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff]
        const o = [0, 0, 0, 0]
        o[3] += m[3] * n[3]
        o[2] += o[3] >>> 16
        o[3] &= 0xffff
        o[2] += m[2] * n[3]
        o[1] += o[2] >>> 16
        o[2] &= 0xffff
        o[2] += m[3] * n[2]
        o[1] += o[2] >>> 16
        o[2] &= 0xffff
        o[1] += m[1] * n[3]
        o[0] += o[1] >>> 16
        o[1] &= 0xffff
        o[1] += m[2] * n[2]
        o[0] += o[1] >>> 16
        o[1] &= 0xffff
        o[1] += m[3] * n[1]
        o[0] += o[1] >>> 16
        o[1] &= 0xffff
        o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0]
        o[0] &= 0xffff
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]]
    }

    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) rotated left by that number of positions.
    //
    function x64Rotl(m, n) {
        n %= 64
        if (n === 32) {
            return [m[1], m[0]]
        } else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))]
        } else {
            n -= 32
            return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))]
        }
    }

    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) shifted left by that number of positions.
    //
    function x64LeftShift(m, n) {
        n %= 64
        if (n === 0) {
            return m
        } else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n]
        } else {
            return [m[1] << (n - 32), 0]
        }
    }
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // xored together as a 64bit int (as an array of two 32bit ints).
    //
    function x64Xor(m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]]
    }
    //
    // Given a block, returns murmurHash3's final x64 mix of that block.
    // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
    // only place where we need to right shift 64bit ints.)
    //
    function x64Fmix(h) {
        h = x64Xor(h, [0, h[0] >>> 1])
        h = x64Multiply(h, [0xff51afd7, 0xed558ccd])
        h = x64Xor(h, [0, h[0] >>> 1])
        h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53])
        h = x64Xor(h, [0, h[0] >>> 1])
        return h
    }

    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
    //
    function x64hash128(key) {
        key = key || ''
        seed = 0 //seed || 0
        const remainder = key.length % 16
        const bytes = key.length - remainder
        var h1 = [0, seed]
        var h2 = [0, seed]
        var k1 = [0, 0]
        var k2 = [0, 0]
        const c1 = [0x87c37b91, 0x114253d5]
        const c2 = [0x4cf5ad43, 0x2745937f]
        var i = 0
        for (i = 0; i < bytes; i = i + 16) {
            k1 = [
                (key.charCodeAt(i + 4) & 0xff) |
                ((key.charCodeAt(i + 5) & 0xff) << 8) |
                ((key.charCodeAt(i + 6) & 0xff) << 16) |
                ((key.charCodeAt(i + 7) & 0xff) << 24),
                (key.charCodeAt(i) & 0xff) |
                ((key.charCodeAt(i + 1) & 0xff) << 8) |
                ((key.charCodeAt(i + 2) & 0xff) << 16) |
                ((key.charCodeAt(i + 3) & 0xff) << 24),
            ]
            k2 = [
                (key.charCodeAt(i + 12) & 0xff) |
                ((key.charCodeAt(i + 13) & 0xff) << 8) |
                ((key.charCodeAt(i + 14) & 0xff) << 16) |
                ((key.charCodeAt(i + 15) & 0xff) << 24),
                (key.charCodeAt(i + 8) & 0xff) |
                ((key.charCodeAt(i + 9) & 0xff) << 8) |
                ((key.charCodeAt(i + 10) & 0xff) << 16) |
                ((key.charCodeAt(i + 11) & 0xff) << 24),
            ]
            k1 = x64Multiply(k1, c1)
            k1 = x64Rotl(k1, 31)
            k1 = x64Multiply(k1, c2)
            h1 = x64Xor(h1, k1)
            h1 = x64Rotl(h1, 27)
            h1 = x64Add(h1, h2)
            h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729])
            k2 = x64Multiply(k2, c2)
            k2 = x64Rotl(k2, 33)
            k2 = x64Multiply(k2, c1)
            h2 = x64Xor(h2, k2)
            h2 = x64Rotl(h2, 31)
            h2 = x64Add(h2, h1)
            h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5])
        }
        k1 = [0, 0]
        k2 = [0, 0]
        switch (remainder) {
            case 15:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48))
            // fallthrough
            case 14:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40))
            // fallthrough
            case 13:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32))
            // fallthrough
            case 12:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24))
            // fallthrough
            case 11:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16))
            // fallthrough
            case 10:
                k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8))
            // fallthrough
            case 9:
                k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)])
                k2 = x64Multiply(k2, c2)
                k2 = x64Rotl(k2, 33)
                k2 = x64Multiply(k2, c1)
                h2 = x64Xor(h2, k2)
            // fallthrough
            case 8:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56))
            // fallthrough
            case 7:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48))
            // fallthrough
            case 6:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40))
            // fallthrough
            case 5:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32))
            // fallthrough
            case 4:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24))
            // fallthrough
            case 3:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16))
            // fallthrough
            case 2:
                k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8))
            // fallthrough
            case 1:
                k1 = x64Xor(k1, [0, key.charCodeAt(i)])
                k1 = x64Multiply(k1, c1)
                k1 = x64Rotl(k1, 31)
                k1 = x64Multiply(k1, c2)
                h1 = x64Xor(h1, k1)
            // fallthrough
        }
        h1 = x64Xor(h1, [0, key.length])
        h2 = x64Xor(h2, [0, key.length])
        h1 = x64Add(h1, h2)
        h2 = x64Add(h2, h1)
        h1 = x64Fmix(h1)
        h2 = x64Fmix(h2)
        h1 = x64Add(h1, h2)
        h2 = x64Add(h2, h1)
        return (
            ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8)
        )
    }

    (function initCF_PrintJS() {

        try {
            var fa2s = function (fa) {
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                return "[" + fa[0] + ", " + fa[1] + "]";
            };
            var maxAnisotropy = function (gl) {
                var anisotropy, ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
                return ext ? (anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === anisotropy && (anisotropy = 2), anisotropy) : null;
            };
            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            var result = [];
            var result_device = [];
            var result_device2 = [];
            var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
            var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
            var vertexPosBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
            var vertices = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            vertexPosBuffer.itemSize = 3;
            vertexPosBuffer.numItems = 3;
            var program = gl.createProgram(), vshader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vshader, vShaderTemplate);
            gl.compileShader(vshader);
            var fshader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fshader, fShaderTemplate);
            gl.compileShader(fshader);
            gl.attachShader(program, vshader);
            gl.attachShader(program, fshader);
            gl.linkProgram(program);
            gl.useProgram(program);
            program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
            program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
            gl.enableVertexAttribArray(program.vertexPosArray);
            gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
            gl.uniform2f(program.offsetUniform, 1, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
            var cf_canvasDataURL = null;
            var cf_resultPrecision = [];
            if (gl.canvas != null) { cf_canvasDataURL = gl.canvas.toDataURL(); }
            //if (gl.canvas != null) { result.push(gl.canvas.toDataURL()); }
            if (gl.canvas != null) { result_device.push(cf_canvasDataURL); }
            result.push("extensions:" + gl.getSupportedExtensions().join(";"));
            result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
            result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
            result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
            result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
            result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
            result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
            result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
            result.push("webgl max anisotropy:" + maxAnisotropy(gl));
            result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
            result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
            result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
            result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
            result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
            result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
            result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
            result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
            result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
            result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
            result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
            result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
            result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
            result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
            result.push("webgl version:" + gl.getParameter(gl.VERSION));
            cf_resultPrecision.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision);
            cf_resultPrecision.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision);
            cf_resultPrecision.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).precision);
            cf_resultPrecision.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision);
            cf_resultPrecision.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision);
            cf_resultPrecision.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).precision);
            cf_resultPrecision.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMax);
            cf_resultPrecision.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).precision);
            cf_resultPrecision.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMax);
            cf_resultPrecision.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).precision);
            cf_resultPrecision.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMax);
            cf_resultPrecision.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).precision);
            cf_resultPrecision.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMin);
            cf_resultPrecision.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).precision);
            cf_resultPrecision.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).precision);
            cf_resultPrecision.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMax);
            cf_resultPrecision.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).precision);
            cf_resultPrecision.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMin);
            cf_resultPrecision.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMax);

            // NOTE: browser ind
            device_webglSpecs = cf_resultPrecision.join("_")

            result.push(cf_canvasDataURL)
            result.push(device_webglSpecs)
            webGLData = result.join("Â§");

            webGLData_device = result_device.join("_")

            canvas = document.createElement('canvas');
            var ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (ctx.getSupportedExtensions().indexOf("WEBGL_debug_renderer_info") >= 0) {
                webGLVendor = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL);
                webGLRenderer = ctx.getParameter(ctx.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
            } else {
                webGLVendor = "Not supported";
                webGLRenderer = "Not supported";
            }
        } catch (e) {
            webGLData = "Not supported";
            webGLVendor = "Not supported";
            webGLRenderer = "Not supported";
        }
        // This is the visitor identifier:
        try {
            canvas = document.createElement("canvas");
            canvas.height = 60;
            canvas.width = 400;
            canvasContext = canvas.getContext("2d");
            canvas.style.display = "inline";
            canvasContext.textBaseline = "alphabetic";
            canvasContext.fillStyle = "#f60";
            canvasContext.fillRect(125, 1, 62, 20);
            canvasContext.fillStyle = "#069";
            canvasContext.font = "11pt no-real-font-123";
            canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
            canvasContext.fillStyle = "rgba(102, 204, 0, 0.7)";
            canvasContext.font = "18pt Arial";
            canvasContext.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
            canvasData = canvas.toDataURL();
        } catch (e) {
            canvasData = "Not supported";
        }
        //console.log(canvasData)
        //console.log(webGLData)
        if (cf_debugGen) console.log(webGLVendor)
        if (cf_debugGen) console.log(webGLRenderer)



        //console.log("canvasData", canvasData);
        var visitorIdCan = x64hash128(`'canvasData':${canvasData}`)
        if (cf_debugGen) console.log("the visitorIdCan: " + visitorIdCan);

        //console.log("webGLData", webGLData);
        var visitorIdWebGL = x64hash128(`'webGLData':${webGLData}`)
        if (cf_debugGen) console.log("the visitorIdWebGL: " + visitorIdWebGL);

        var cf_browserInd = [];
        var cf_browserIdV2 = [];
        var cf_browserIdLog = [];

        // NOTE: browser ind -- not ind for new MacOS 
        if (cf_debugGen) console.log("webGLVendor", webGLVendor);
        //cf_browserInd.push(`'webGLVendor':${webGLVendor}`)
        var visitorIdWebGLV = x64hash128(`'webGLVendor':${webGLVendor}`)
        if (cf_debugGen) console.log("the visitorIdWebGLV: " + visitorIdWebGLV);

        // NOTE: browser ind -- not ind for new MacOS
        if (cf_debugGen) console.log("webGLRenderer", webGLRenderer);
        //cf_browserInd.push(`'webGLRenderer':${webGLRenderer}`)
        var visitorIdWebGLR = x64hash128(`'webGLRenderer':${webGLRenderer}`)
        if (cf_debugGen) console.log("the visitorIdWebGLR: " + visitorIdWebGLR);

        // NOTE: browser ind
        if (cf_debugGen) console.log(device_webglSpecs);
        cf_browserInd.push(`'device_webglSpecs':${device_webglSpecs}`)
        var visitorIdWebGLSpecs = x64hash128(`'device_webglSpecs':${device_webglSpecs}`)
        if (cf_debugGen) console.log("the visitorIdWebGLSpecs: " + visitorIdWebGLSpecs);

        var visitorIdWebGL_device = x64hash128(`'webGLData_device':${webGLData_device}`)
        if (cf_debugGen) console.log("the visitorIdWebGL_device: " + visitorIdWebGL_device);
        //console.log("the webGLData_device: " + webGLData_device);

        // NOTE: browser ind
        var audioFprint = audioFPrinting();
        if (cf_debugGen) console.log("audioFprint", audioFprint);
        cf_browserInd.push(`'audio_device':${audioFprint}`)
        var audio_device = x64hash128(`'audio_device':${audioFprint}`)
        if (cf_debugGen) console.log("the audio_device: " + audio_device);

        // NOTE: browser ind
        var resFprint = getResolution();
        if (cf_debugGen) console.log("resFprint", resFprint);
        cf_browserInd.push(`'res_device':${resFprint}`)
        var res_device = x64hash128(`'res_device':${resFprint}`)
        if (cf_debugGen) console.log("the res_device: " + res_device);

        var cf_cpuCores = "-1";
        if (navigator.hardwareConcurrency)
            cf_cpuCores = navigator.hardwareConcurrency;
        if (cf_debugGen) console.log("cf_cpuCores", cf_cpuCores);
        cf_browserIdV2.push(`'cpu_device':${cf_cpuCores}`);
        var cpu_device = x64hash128(`'cpu_device':${cf_cpuCores}`);
        if (cf_debugGen) console.log("the cpu_device: " + cpu_device);

        var langFprint = get_writing_scripts();
        if (cf_debugGen) console.log("langFprint", langFprint);
        cf_browserIdV2.push(`'lang_device':${langFprint}`);
        var lang_device = x64hash128(`'lang_device':${langFprint}`);
        if (cf_debugGen) console.log("the lang_device: " + lang_device);

        // NOTE: browser ind
        var timeFprint = new Date().getTimezoneOffset();
        if (cf_debugGen) console.log("timeFprint", timeFprint);
        cf_browserInd.push(`'time_device':${timeFprint}`)
        var time_device = x64hash128(`'time_device':${timeFprint}`)
        if (cf_debugGen) console.log("the time_device: " + time_device);

        // NOTE: browser ind
        var osFprint = JSON.stringify(cf_jscd);
        if (cf_debugGen) console.log("osFprint", osFprint);
        cf_browserInd.push(`'os_device':${osFprint}`);
        var os_device = x64hash128(`'os_device':${osFprint}`);
        cf_browserIdLog.push(`'os_device':${osFprint}`);
        if (cf_debugGen) console.log("the os_device: " + os_device);

        // NOTE: browser ind
        var osLangFprint = getOSlanguage();
        if (cf_debugGen) console.log("osLangFprint", osLangFprint);
        cf_browserInd.push(`'osLang_device':${osLangFprint}`);
        var osLang_device = x64hash128(`'osLang_device':${osLangFprint}`);
        cf_browserIdLog.push(`'osLang_device':${osLangFprint}`);
        if (cf_debugGen) console.log("the osLang_device: " + osLang_device);

        cf_browserIdV2.push(`'browser_device':${cf_browser}`);
        cf_browserIdLog.push(`'browser_device':${cf_browser}`);

        var cf_ipstring = "null";

        try {
            var RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
        } catch {
            var RTCPeerConnection;
        }
        if (RTCPeerConnection) {
            var peerConn = new RTCPeerConnection({
                'iceServers': [{
                    'urls': ['stun:stun.l.google.com:19302']
                }]

            });
            var dataChannel = peerConn.createDataChannel('test'); // Needs something added for some reason
            peerConn.createOffer({}).then((desc) => peerConn.setLocalDescription(desc));
            peerConn.onicecandidate = (e) => {
                if (e.candidate == null) {
                    local_sdp = peerConn.localDescription.sdp;
                    cf_ipstring = /c=IN IP4 ([^\n]*)\n/.exec(local_sdp)[1].trim();
                    if (cf_debugGen) console.log(local_sdp);
                    //sdp_ipstring2 = /a=candidate([^\n]*)\n/.exec(local_sdp)[0]
                    sdp_ipstring2 = /[^\n]*? ((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)) [^\n]*? typ srflx raddr [^\n]*\n/.exec(local_sdp)[0]
                    cf_ipstring2 = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/.exec(sdp_ipstring2)[0];
                    if (cf_debugGen) console.log("you cf_ipstring:" + cf_ipstring);
                    if (cf_debugGen) console.log("your cf_ipstring2:" + cf_ipstring2);
                    if (cf_ipstring.trim() === '0.0.0.0') {
                        if (cf_debugGen) console.log("cf_ipstring is 0.0.0.0");
                        cf_ipstring = cf_ipstring2;
                    } else {
                        if (cf_debugGen) console.log("cf_ipstring is not 0.0.0.0");
                    }
                    // NOTE: browser ind
                    var deviceIdIp = x64hash128(`'cf_ip':${cf_ipstring}`);
                    //var deviceIdIp = x64hash128(`'canvasData':${cf_ipstring2}'`)
                    cf_browserInd.push(`'cf_ip':${cf_ipstring}`);
                    cf_browserIdLog.push(`'cf_ip':${cf_ipstring}`);
                    if (cf_debugGen) console.log("your ip:" + cf_ipstring);
                    if (cf_debugGen) console.log("the device ip: " + deviceIdIp);
                    cf_browserIndStr = cf_browserInd.join("_");
                    cf_browserIdLogStr = cf_browserIdLog.join("_");
                    cf_finalDevId = x64hash128(cf_browserIndStr);
                    if (cf_debugGen) console.log(cf_browserIndStr);
                    console.log("the Device Id (cf_finalDevId): " + cf_finalDevId);
                    // Store cf_finalDevId in cookies for 30 days
                    setCookie('cf_finalDevId', cf_finalDevId, 30);
                    // Mark fingerprinting as complete
                    window.cf_fingerprintComplete = true;
                    //$("#browser_fingerprint").html(cf_browserIndStr);
                    //document.getElementById("cf_demoDeepIDdevIdDebug").innerHTML = cf_browserIndStr;
                    if (cf_debugGen) document.getElementById("cf_demoDeepIDdevId").innerHTML = cf_finalDevId;
                    cf_browserIdStr = `'canvasData':${canvasData}|'webGLData':${webGLData}|'webGLVendor':${webGLVendor}|'webGLRenderer':${webGLRenderer}|'cf_browserIndStr':${cf_browserIndStr}`;
                    cf_finalBrowserId = x64hash128(cf_browserIdStr);
                    console.log("the Browser Id (cf_finalBrowserId): " + cf_finalBrowserId);

                    cf_browserIdStrV2part = cf_browserIdV2.join("_");
                    cf_browserIdStrV2 = `'cf_browserIdStrV2part':${cf_browserIdStrV2part}|'cf_browserIdStr':${cf_browserIdStr}`;
                    cf_finalBrowserIdV2 = x64hash128(cf_browserIdStrV2);
                    console.log("the Browser Id V2 (cf_finalBrowserIdV2): " + cf_finalBrowserIdV2);


                }
            };
        } else {
            // Inform user that webrtc fetch failed
            if (cf_debugGen) console.log('Failed to fetch IP via WebRTC, perhaps your WebRTC is disabled?');
            cf_browserIndStr = cf_browserInd.join("_");
            cf_finalDevId = x64hash128(cf_browserIndStr);
            if (cf_debugGen) console.log(cf_browserIndStr);
            console.log("the Device Id (cf_finalDevId): " + cf_finalDevId);
            // Store cf_finalDevId in cookies for 30 days
            setCookie('cf_finalDevId', cf_finalDevId, 30);
            // Mark fingerprinting as complete
            window.cf_fingerprintComplete = true;
            //$("#browser_fingerprint").html(cf_browserIndStr);
            //document.getElementById("cf_demoDeepIDdevIdDebug").innerHTML = cf_browserIndStr;
            if (cf_debugGen) document.getElementById("cf_demoDeepIDdevId").innerHTML = cf_finalDevId;
            cf_browserIdStr = `'canvasData':${canvasData}|'webGLData':${webGLData}|'webGLVendor':${webGLVendor}|'webGLRenderer':${webGLRenderer}|'cf_browserIndStr':${cf_browserIndStr}`;
            cf_finalBrowserId = x64hash128(cf_browserIdStr);
            console.log("the Browser Id (cf_finalBrowserId): " + cf_finalBrowserId);

            cf_browserIdStrV2part = cf_browserIdV2.join("_");
            cf_browserIdStrV2 = `'cf_browserIdStrV2part':${cf_browserIdStrV2part}|'cf_browserIdStr':${cf_browserIdStr}`;
            cf_finalBrowserIdV2 = x64hash128(cf_browserIdStrV2);
            console.log("the Browser Id V2 (cf_finalBrowserIdV2): " + cf_finalBrowserIdV2);


        }


    })()
};
// Check if cf_finalDevId already exists in cookies
function initializeFingerprinting() {
    const existingDevId = getCookie('cf_finalDevId');

    if (existingDevId && existingDevId !== 'dummy_devid') {
        console.log('🔍 Found existing cf_finalDevId in cookies:', existingDevId);
        // Set the global variable from cookie
        cf_finalDevId = existingDevId;
        // Mark fingerprinting as complete
        window.cf_fingerprintComplete = true;
        console.log('✅ Skipping fingerprinting - using cached device ID');
    } else {
        console.log('🚀 No valid cf_finalDevId found in cookies, running fingerprinting...');
        cf_callbody();
    }
}

if (document.readyState !== 'loading') {
    initializeFingerprinting();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        initializeFingerprinting();
    });
}// Will store the dynamically genered device ID


// Global variables for fingerprinting
var cf_fingerprintComplete = false;
// var cf_finalDevId = "dummy_devid";
var cf_finalBrowserId = "dummy_browserid";
var cf_finalBrowserIdV2 = "dummy_browseridV2";

// Global variable to cache the actual Shopify domain
var cf_cachedShopifyDomain = null;



// Secret key for encryption/decryption (in production, this should be stored securely)
var ENCRYPTION_KEY = 'abtest-secret-key-2025';

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Encrypt a value and format it to look like a natural hash
 * @param {string} value - The value to encrypt
 * @returns {string} - The encrypted and formatted value
 */
function encryptValue(value) {
    const valueStr = value.toString();

    // For numeric values (like hash values), pad to 3 characters
    // For non-numeric values (like test IDs), use as-is
    const paddedValue = /^\d+$/.test(valueStr) ? valueStr.padStart(3, '0') : valueStr;

    // Generate a random prefix and suffix
    const prefix = generateRandomString(4);
    const suffix = generateRandomString(4);

    // Create the base string with dots
    const baseString = `${prefix}.${paddedValue}.${suffix}`;

    // Apply XOR encryption
    let result = '';
    for (let i = 0; i < baseString.length; i++) {
        const charCode = baseString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode);
    }

    // Convert to base64 and remove any non-alphanumeric characters
    return btoa(result).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Decrypt a value from the natural-looking hash format
 * @param {string} encryptedValue - The encrypted value
 * @returns {string} - The decrypted value
 */
function decryptValue(encryptedValue) {
    try {
        // Decode from base64
        const decoded = atob(encryptedValue);
        let result = '';

        // Apply XOR decryption
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }

        // Extract the value between dots (can be numeric or alphanumeric)
        const match = result.match(/\.([^.]+)\./);
        if (match && match[1]) {
            const extractedValue = match[1];
            // If it's a numeric value with leading zeros, remove them
            if (/^\d+$/.test(extractedValue)) {
                return extractedValue.replace(/^0+/, '') || '0';
            }
            // Otherwise return as-is (for alphanumeric test IDs)
            return extractedValue;
        }

        return null;
    } catch (error) {
        console.error('Error decrypting value:', error);
        return null;
    }
}




/**
 * Generate a consistent hash for a customer ID to ensure consistent test group assignment
 * @param {string} customerId - The customer ID to hash
 * @returns {number} - A value between 0 and 100
 */
function generateConsistentHash(customerId) {
    let hash = 0;
    if (customerId.length === 0) return hash;

    for (let i = 0; i < customerId.length; i++) {
        const char = customerId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to a value between 0 and 100
    return Math.abs(hash % 100);
}














function saveAbtestIdsToCart() {
    // Get IP from cookies
    const ip = getCookie('cf_browserIp');

    // If no IP in cookies, fetch it
    if (!ip) {
        fetchAndStoreIP().then(ip => {
            if (ip) {
                updateCartWithIP(ip);
            }
        });
        return;
    }

    updateCartWithIP(ip);
}

/**
 * Get targeting criteria information for all active tests to add to cart attributes
 * @returns {Promise<Object>} Object with targeting info for each test
 */
async function getTargetingInfoForCart() {
    const targetingInfo = {};
    const testData = {};

    try {
        // We'll check for preview mode in the loop below

        // Fetch active tests
        const activeTests = await fetchABTestData();
        if (!activeTests || typeof activeTests !== 'object') {
            return targetingInfo;
        }

        // Process each test
        for (const [testId, test] of Object.entries(activeTests)) {
            // Skip non-test objects (like querySelectors)
            if (!test || typeof test !== 'object' || !test.basicInfo) {
                continue;
            }

            // Check targeting criteria for this test (for all tests, not just active ones)
            const meetsTargeting = await checkTargetingCriteria(test, testId);

            // Create test data object
            const testType = test.basicInfo.type || 'unknown';
            const testStatus = test.basicInfo.status === 'active' ? 'active' : 'inactive';
            const testKey = `${testId}_${testType}_${testStatus}`;

            testData[testKey] = meetsTargeting ? 'true' : 'false';
        }

        // Add single cart attribute with all test data as JSON string
        targetingInfo.abtest_test_data = JSON.stringify(testData);

        console.log('🎯 Targeting info for cart:', targetingInfo);
        return targetingInfo;
    } catch (error) {
        console.error('❌ Error in getTargetingInfoForCart:', error);
        return targetingInfo;
    }
}

async function updateCartWithIP(ip) {
    // Prepare cart attributes
    let attributes = {};

    if (ip) {
        attributes.abtest_device_id = ip;
        attributes.abtest_hash_value = getHashValue();
        attributes._abtest_device_id = ip;
        attributes._abtest_hash_value = getHashValue();
        attributes.abtest_deep_id = getCookie('cf_finalDevId');
        attributes._abtest_deep_id = getCookie('cf_finalDevId');
    }
    const abtest = {
        starttimer: {}
    };

    // Add current time as a separate attribute
    attributes.causal_funnel_current_time = new Date().toISOString();

    // Add test timer information from cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name.startsWith('cf_test_timer_')) {
            // Extract test type and ID from cookie name
            const parts = name.split('cf_test_timer_')[1].split('_');
            const testType = parts[0]; // 'discount' or 'pricing'
            const testId = parts[1];

            // Add to starttimer object
            abtest.starttimer[`${testType}_${testId}`] = decodeURIComponent(value);
        }
    }

    // Add abtest to attributes if we have any timers
    if (Object.keys(abtest.starttimer).length > 0) {
        attributes.causal_funnel_test_timer = JSON.stringify(abtest);
        attributes._causal_funnel_test_timer = JSON.stringify(abtest);
    }

    // Add targeting criteria information for all active tests
    try {
        const targetingInfo = await getTargetingInfoForCart();
        Object.assign(attributes, targetingInfo);
    } catch (error) {
        console.error('❌ Error getting targeting info for cart:', error);
    }

    // Use Shopify Fetch API to update cart attributes
    fetch('/cart/update.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attributes: attributes
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log('🛒 A/B Test attributes saved to cart');
            window.cfAttributesSet = true;
        })
        .catch(error => {
            console.error('❌ Error saving A/B Test IP to cart:', error);
        });
}





/**
 * Fetch A/B test data from Firebase
 */
async function fetchABTestData() {
    try {
        const domain = getShopifyDomainFromScript();
        const sanitizedDomain = domain.replace(/\./g, '_');

        const firebaseUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${sanitizedDomain}.json`;

        const response = await fetch(firebaseUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch A/B test data: ${response.status}`);
        }

        const data = await response.json();

        // Return the data directly without transformation
        return data;
    } catch (error) {
        console.error('❌ Error fetching A/B test data:', error);
        return null;
    }
}




/**
 * Get the app domain from the script source URL
 * @returns {string} The app domain
 */
function getAppDomain() {
    try {
        // Find the current script tag by looking for addCartAttribute.js
        const scripts = document.getElementsByTagName('script');
        for (const script of scripts) {
            if (script.src && script.src.includes('abtest-script.js')) {
                const url = new URL(script.src);
                return url.origin;
            }
        }

        // Fallback: try to determine from current page if it has shop parameter
        const urlParams = new URLSearchParams(window.location.search);
        const shopParam = urlParams.get('shop');
        if (shopParam) {
            // If we're on a page with shop parameter, we might be on the app domain
            return window.location.origin;
        }

        // Final fallback
        return window.location.origin;
    } catch (error) {
        console.error('Error getting app domain:', error);
        return window.location.origin;
    }
}

/**
 * Get the Shopify domain from the script URL or other available sources
 * @returns {string} The myshopify domain
 */
function getShopifyDomainFromScript() {
    try {
        // Method 0: Try document.currentScript first (most reliable)
        if (document.currentScript && document.currentScript.src) {
            if (document.currentScript.src.includes('abtest-script.js')) {
                try {
                    const url = new URL(document.currentScript.src);
                    const shopParam = url.searchParams.get('shop');
                    if (shopParam) {
                        console.log('🔍 Found shop parameter in current script:', shopParam);
                        return shopParam;
                    }
                } catch (urlError) {
                    console.error('❌ Error parsing current script URL:', urlError);
                }
            }
        }

        // Method 1: Check if the script URL has a shop parameter
        const scripts = document.getElementsByTagName('script');

        for (const script of scripts) {
            if (script.src && script.src.includes('abtest-script.js')) {
                try {
                    const url = new URL(script.src);
                    const shopParam = url.searchParams.get('shop');
                    if (shopParam) {
                        console.log('🔍 Found shop parameter in script URL:', shopParam);
                        return shopParam;
                    }
                } catch (urlError) {
                    console.error('❌ Error parsing script URL:', script.src, urlError);
                }
            }
        }

        // Method 2: Check URL parameters of current page
        const urlParams = new URLSearchParams(window.location.search);
        const shopParam = urlParams.get('shop');
        if (shopParam) {
            console.log('🔍 Found shop parameter in page URL:', shopParam);
            return shopParam;
        }

        // Method 3: Check if current domain is already a myshopify domain
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('.myshopify.com')) {
            console.log('🔍 Current domain is already a Shopify domain:', currentDomain);
            return currentDomain;
        }

        return null;
    } catch (error) {
        console.error('❌ Error getting Shopify domain from script:', error);
        return null;
    }
}

/**x
 * Fetch the actual Shopify domain from the API
 * @returns {Promise<string>} The actual myshopify domain
 */
async function fetchShopifyDomain() {
    // First try to get domain from script parameters (faster and doesn't require API call)
    const scriptDomain = getShopifyDomainFromScript();
    if (scriptDomain) {
        console.log('🔍 Using Shopify domain from script:', scriptDomain);
        return scriptDomain;
    }

    // If script method fails, try API call
    try {
        const appDomain = getAppDomain();
        const apiUrl = `${appDomain}/api/store-info`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch store info: ${response.status}`);
        }

        const data = await response.json();
        return data.myshopifyDomain;
    } catch (error) {
        console.error('❌ Error fetching Shopify domain from API:', error);
        // Final fallback to current domain
        const fallbackDomain = window.location.hostname;
        console.warn('⚠️ Using fallback domain:', fallbackDomain);
        return fallbackDomain;
    }
}

/**
 * Get the store ID for the current shop
 * @returns {Promise<string>} The store ID
 */
async function getStoreId() {
    // Return cached domain if available
    if (cf_cachedShopifyDomain) {
        return cf_cachedShopifyDomain.replace(/\./g, '_');
    }

    try {
        // Fetch actual Shopify domain from API
        const shopifyDomain = await fetchShopifyDomain();

        // Cache the domain for future use
        cf_cachedShopifyDomain = shopifyDomain;

        // Convert to Firebase format (replace dots with underscores)
        const sanitizedDomain = shopifyDomain.replace(/\./g, '_');

        return sanitizedDomain;
    } catch (error) {
        console.error('❌ Error getting store ID:', error);
        // Fallback to current domain
        const domain = window.location.hostname;
        const sanitizedDomain = domain.replace(/\./g, '_');
        console.warn('⚠️ Falling back to current domain:', domain);
        return sanitizedDomain;
    }
}





/**
 * Get the hash value from session storage (for preview) or cookies
 * @returns {number} The hash value (0-100)
 */
function getHashValue() {
    // First check session storage for preview hash
    const sessionHashValue = sessionStorage.getItem('cf_hashValue');
    if (sessionHashValue) {
        console.log('🎯 Using preview hash value:', sessionHashValue);
        return parseInt(sessionHashValue, 10);
    }

    // Fallback to cookie value
    const hashValue = getCookie('cf_hashValue');
    return hashValue ? parseInt(hashValue, 10) : -1;
}





/**
 * Find the test variant that applies to the user based on hash value
 * @param {Array} testVariants - The variants for a test
 * @param {number} hashValue - The user's hash value (0-100)
 * @returns {Object|null} The selected variant or null
 */
function getVariantForUser(testVariants, hashValue) {
    if (!Array.isArray(testVariants)) {
        console.error("❌ Invalid test variants data");
        return null;
    }

    let selectedVariant = null;
    let cumulativePercentage = 0;

    // Filter out special groups and sort by ID to maintain original order
    const validVariants = testVariants
        .filter(variant => variant.percentage && variant.id)
        .sort((a, b) => a.id - b.id);

    for (const variant of validVariants) {
        cumulativePercentage += variant.percentage;

        if (hashValue <= cumulativePercentage) {
            selectedVariant = variant;
            console.log(`🎯 User assigned to variant: "${variant.name}" (${variant.percentage}% of users)`);
            break;
        }
    }

    if (!selectedVariant) {
        console.log("🎯 No variant selected for this user");
        return null;
    }

    return selectedVariant;
}




/**
 * Get the clean product ID from a Shopify product ID
 * @param {string} fullProductId - The full Shopify product ID
 * @returns {string} The numeric product ID
 */
function getCleanId(fullProductId) {
    // Handle IDs in format "gid://shopify/Product/8469363753114"
    if (fullProductId.includes('/')) {
        return fullProductId.split('/').pop();
    }
    return fullProductId;
}






/**
 * Process active productDetails A/B tests and hide/show products based on test groups
 * This function only applies to productDetails tests, not pricing tests
 */
async function applyABTestProductModifications() {
    // Fetch active tests
    const activeTests = await fetchABTestData();

    // Get user's hash value
    const hashValue = getHashValue();

    // If no active tests or no hash value, return early
    if (!activeTests || activeTests.length === 0) {
        return;
    }

    if (!hashValue) {
        return;
    }

    // Process all products on the page regardless of page type
    await processProductVisibility(activeTests, hashValue);
}

async function processProductVisibility(activeTests, hashValue) {
    if (!activeTests || typeof activeTests !== 'object') {
        console.error('❌ Invalid activeTests data:', activeTests);
        return;
    }

    // First, collect all product IDs from all tests
    const allProducts = new Set();
    const allTestGroups = new Map(); // Map to store test group products

    // Process each test to collect all products - ONLY for productDetails tests
    Object.entries(activeTests).forEach(([testId, test]) => {
        // Skip non-test objects (like querySelectors)
        if (!test || typeof test !== 'object' || !test.basicInfo) {
            return;
        }

        // Skip if not a productDetails test or not active
        if (!test.basicInfo || test.basicInfo.type !== 'productDetails' || test.basicInfo.status !== 'active') {
            return;
        }

        if (!test.selectedProducts || !test.testGroups) {
            return;
        }

        // Add original products
        test.selectedProducts.forEach(product => {
            if (product.productId) {
                allProducts.add(getCleanId(product.productId));
            }
        });

        // Add test group products
        const groups = Array.isArray(test.testGroups) ? test.testGroups : Object.values(test.testGroups);
        groups.forEach(group => {
            if (!group.products) return;
            Object.values(group.products).forEach(productConfig => {
                if (productConfig.createdProductId) {
                    allProducts.add(getCleanId(productConfig.createdProductId));
                }
            });
        });
    });

    // Helper function to apply visibility styles
    const applyVisibilityStyles = (element, show) => {
        if (show) {
            element.style.display = '';
            element.style.position = '';
            element.style.visibility = '';
            element.style.opacity = '';
            element.style.height = '';
            element.style.width = '';
            element.style.margin = '';
            element.style.padding = '';
        } else {
            element.style.display = 'none';
            element.style.position = 'absolute';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.height = '0';
            element.style.width = '0';
            element.style.margin = '0';
            element.style.padding = '0';
        }
    };

    // First hide all products
    allProducts.forEach(productId => {
        const elements = findProductElementsById(productId);
        elements.forEach(element => {
            applyVisibilityStyles(element, false);
        });
    });

    // Now process each productDetails test to show only products from user's group
    for (const [testId, test] of Object.entries(activeTests)) {

        // Skip non-test objects (like querySelectors, isScriptDetected, or incomplete tests)
        if (testId === 'querySelectors' || testId === 'isScriptDetected' || !test || typeof test !== 'object' || !test.basicInfo) {
            console.log(`⏭️ Skipping invalid entry: ${testId}`);
            continue;
        }

        // Validate test has required structure before processing
        if (!test.testGroups || !test.selectedProducts || !test.targeting) {
            console.log(`❌ Invalid test structure for ${testId}, skipping analytics tracking`);
            continue;
        }

        // Skip if not a productDetails test or not active
        if (!test.basicInfo || test.basicInfo.type !== 'productDetails' || test.basicInfo.status !== 'active') {
            continue;
        }

        // Normalize test groups to array format
        let testGroups;
        if (Array.isArray(test.testGroups)) {
            testGroups = test.testGroups;
        } else {
            testGroups = Object.entries(test.testGroups)
                .filter(([groupId, _]) => groupId !== '1747732448122')
                .map(([_, group]) => group);
        }

        const userVariant = getVariantForUser(testGroups, hashValue);

        if (!userVariant) {
            continue;
        }

        // Show only products from user's variant
        for (const product of test.selectedProducts) {
            if (!product || !product.productId) continue;

            const productId = getCleanId(product.productId);

            const productConfig = userVariant.products && userVariant.products[productId];

            if (productConfig) {
                if (userVariant.id === 1 && userVariant.name === 'Control Group') {
                    // For control group, show original product
                    const originalElements = findProductElementsById(productId);
                    originalElements.forEach(element => {
                        applyVisibilityStyles(element, true);
                    });
                } else {
                    // For test groups, show only their modified product
                    if (productConfig.createdProductId) {
                        const modifiedElements = findProductElementsById(getCleanId(productConfig.createdProductId));
                        modifiedElements.forEach(element => {
                            applyVisibilityStyles(element, true);
                        });
                    }
                }

                // Track view for analytics
                try {
                    const ip = getCookie('cf_browserIp');
                    if (ip) {
                        let variantIndex;
                        if (Array.isArray(test.testGroups)) {
                            variantIndex = test.testGroups.findIndex(group =>
                                group.id && group.id.toString() === userVariant.id.toString()
                            );
                        } else {
                            variantIndex = Object.values(test.testGroups).findIndex(group =>
                                group.id && group.id.toString() === userVariant.id.toString()
                            );
                        }

                        if (variantIndex !== -1) {
                            const storeId = await getStoreId();
                            const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/views`;
                            const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

                            const response = await fetch(analyticsUrl);
                            if (response.ok) {
                                let views = await response.json();
                                views = Array.isArray(views) ? views.filter(v => v !== "") : [];

                                views.push(ip);
                                await fetch(analyticsUrl, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(views)
                                });

                            }
                        }
                    }
                } catch (error) {
                    console.error('Error tracking view:', error);
                }
            }
        }
    }
}






/**
 * Helper function to detect if we're on LeightWorks store
 * @returns {boolean} True if current store is LeightWorks
 */
function isLeightWorksStore() {
    // Priority 1: Check cached Shopify domain
    if (cf_cachedShopifyDomain && cf_cachedShopifyDomain.includes('leightworks')) {
        return true;
    }

    // Priority 2: Check script domain (most reliable for custom domains)
    const scriptDomain = getShopifyDomainFromScript();
    if (scriptDomain && scriptDomain.includes('leightworks')) {
        return true;
    }

    // Priority 3: Fallback to current domain (for direct myshopify access)
    const currentDomain = window.location.hostname;
    if (currentDomain.includes('leightworks')) {
        return true;
    }

    return false;
}

function findProductElementsById(productId) {
    // Check if we're on LeightWorks and use specialized function
    if (isLeightWorksStore()) {
        console.log('🔍 Using LeightWorks-specific product element finder for product:', productId);
        return findProductElementsByIdLeightWorks(productId);
    }

    const elements = new Set();

    // Helper function to check if element has img tag
    const hasImageTag = (element) => {
        return element.querySelector('img') !== null;
    };

    // Helper function to find parent section with image
    const findParentWithImage = (element) => {
        // First check if current element has image
        if (hasImageTag(element)) {
            return element;
        }

        // If not, look for parent section with image
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName.toLowerCase() === 'section' && hasImageTag(parent)) {
                return parent;
            }
            parent = parent.parentElement;
        }

        // If no parent with image found, return original element
        return element;
    };

    // Helper function to add element and its parent containers
    const addElement = (element) => {
        if (element && !elements.has(element)) {
            // Find all parent containers that need to be hidden
            let currentElement = element;
            while (currentElement) {
                if (currentElement.matches('.grid__item, .card-wrapper, .product-grid-item, li.slider__slide, section.product, div[data-product-id], [id*="ProductInfo"], .product-card-wrapper')) {
                    elements.add(currentElement);
                }
                currentElement = currentElement.parentElement;
            }

            // Also add the element itself if it wasn't added as a parent
            if (!elements.has(element)) {
                elements.add(element);
            }
        }
    };

    // Helper function to check if a string contains the product ID
    const containsProductId = (str) => {
        if (!str) return false;
        // Clean both strings for comparison
        const cleanId = getCleanId(productId);
        const cleanStr = getCleanId(str);

        // Check if the string contains ref_pid= followed by the specific product ID we're searching for
        if (cleanStr.includes(`ref_pid=${cleanId}`)) {
            return false;
        }

        return cleanStr.includes(cleanId);
    };

    try {
        // 1. Look for elements with ID containing the product ID
        document.querySelectorAll(`[id*="${productId}"]`).forEach(el => {
            addElement(el);
        });

        // 2. Look for elements with class containing the product ID
        document.querySelectorAll(`[class*="${productId}"]`).forEach(el => {
            addElement(el);
        });

        // class="cart-item"
        document.querySelectorAll(`a[href*="variant=${productId}"]`).forEach(el => {
            const container = el.closest('tr.cart-item');
            if (container) addElement(container);
        });

        // 3. Look for hidden input fields with product ID
        document.querySelectorAll('input[name="product-id"], input[type="hidden"][name*="id"]').forEach(input => {
            if (containsProductId(input.value)) {
                addElement(input);
            }
        });

        // 4. Look for product info containers
        document.querySelectorAll('product-info, .product__info-container').forEach(container => {
            const dataUrl = container.getAttribute('data-url');
            const formInputs = container.querySelectorAll('input[name="product-id"], input[type="hidden"][name*="id"]');

            formInputs.forEach(input => {
                if (containsProductId(input.value)) {
                    addElement(container);
                }
            });

            if (dataUrl && containsProductId(dataUrl)) {
                addElement(container);
            }
        });

        // 5. Look for anchors with href containing the product ID or handle
        document.querySelectorAll('a[href*="/products/"]').forEach(anchor => {
            if (containsProductId(anchor.href)) {
                addElement(anchor);
            }
        });

        // 6. Look for forms with action="/cart/add"
        document.querySelectorAll('form[action="/cart/add"]').forEach(form => {
            const productIdInput = form.querySelector('input[name="product-id"]');
            if (productIdInput && containsProductId(productIdInput.value)) {
                addElement(form);
            }
        });

        // 7. Look for price elements within product containers
        document.querySelectorAll('.price__container, .price').forEach(priceContainer => {
            const productContainer = priceContainer.closest('li.grid__item, .card-wrapper, section.product, div[data-product-id], [id*="ProductInfo"], .product-card-wrapper');
            if (productContainer) {
                const idElements = productContainer.querySelectorAll('input[name="product-id"], input[type="hidden"][name*="id"]');
                idElements.forEach(input => {
                    if (containsProductId(input.value)) {
                        addElement(productContainer);
                    }
                });
            }
        });

        return Array.from(elements);
    } catch (error) {
        console.error('❌ Error in findProductElementsById:', error);
        return [];
    }
}
// let cachedQuerySelectors = null;





function initializeAbtestPriceModifications() {
    // Prevent multiple executions
    if (window.cfPriceModificationRunning || window.cfPriceModificationComplete) {
        return;
    }
    window.cfPriceModificationRunning = true;

    console.log('💰 Initializing price modifications');

    // Set to store already modified elements to prevent re-processing
    const modifiedElements = new Set();


    // Debounced version of price modifications
    const debouncedApplyPriceModifications = debounce(async () => {
        if (!window.cfPriceModificationRunning) return; // Skip if cleanup called
        await applyABTestPriceModifications();
    }, 1000);

    // Add delay to ensure page is fully loaded
    setTimeout(async () => {
        try {
            // Apply initial price modifications
            await applyABTestPriceModifications();

            // Set up a mutation observer with more specific targeting
            const observer = new MutationObserver((mutations) => {
                if (!window.cfPriceModificationRunning) return; // Skip if cleanup called

                let shouldUpdate = false;

                for (const mutation of mutations) {
                    // Skip our own modifications
                    if (mutation.target.hasAttribute && mutation.target.hasAttribute('data-cf-modified')) {
                        continue;
                    }

                    // Check if the mutation is relevant (price-related elements or product cards)
                    const relevantClasses = ['price', 'product-price', 'card__content', 'product-card'];
                    const hasRelevantClass = Array.from(mutation.target.classList || []).some(cls =>
                        relevantClasses.some(relevantCls => cls.includes(relevantCls))
                    );

                    if (hasRelevantClass ||
                        (mutation.type === 'childList' &&
                            Array.from(mutation.addedNodes).some(node =>
                                node.nodeType === Node.ELEMENT_NODE &&
                                node.classList &&
                                relevantClasses.some(cls =>
                                    Array.from(node.classList).some(nodeClass => nodeClass.includes(cls))
                                )
                            ))) {
                        shouldUpdate = true;
                        break;
                    }
                }

                if (shouldUpdate) {
                    debouncedApplyPriceModifications();
                }
            });

            // Configure the observer to only watch relevant parts of the DOM
            const relevantContainers = [
                'main',
                '#MainContent',
                '.product-grid',
                '.collection-grid',
                '.featured-collection',
                '.product-recommendations'
            ];

            const containers = relevantContainers
                .map(selector => document.querySelector(selector))
                .filter(Boolean);

            if (containers.length === 0) {
                // If no specific containers found, observe the body
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false // Reduced to prevent infinite loops
                });
            } else {
                // Observe each relevant container
                containers.forEach(container => {
                    observer.observe(container, {
                        childList: true,
                        subtree: true,
                        attributes: false // Reduced to prevent infinite loops
                    });
                });
            }

            // Store cleanup function
            window.cfPriceModificationCleanup = () => {
                observer.disconnect();
                modifiedElements.clear();
                window.cfPriceModificationRunning = false;
            };

            // Mark as complete
            window.cfPriceModificationComplete = true;
            window.cfPriceModificationRunning = false;

        } catch (error) {
            console.error('❌ Error in price modifications initialization:', error);
            window.cfPriceModificationRunning = false;
        }
    }, 1500); // Delay to ensure DOM is ready and theme scripts have loaded
}

/**
 * Generate and store consistent hash value in cookies
 */
function storeAbtestHashValue() {
    // Check for preview hash in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const previewHash = urlParams.get('cf_preview_hash');
    const previewTestId = urlParams.get('cf_test_id');

    // Handle encrypted test ID from URL
    if (previewTestId) {
        console.log("🎯 Found preview test ID in URL");
        try {
            // Decrypt the test ID
            const decryptedTestId = decryptValue(previewTestId);
            if (decryptedTestId) {
                console.log("🎯 Using decrypted preview test ID:", decryptedTestId);
                sessionStorage.setItem('abTest_testId', decryptedTestId);

            } else {
                console.error("❌ Failed to decrypt preview test ID");
            }
        } catch (error) {
            console.error("❌ Error processing preview test ID:", error);
        }
    }

    if (previewHash) {
        console.log("🎯 Found preview hash in URL");
        try {
            // Decrypt the hash value
            const decryptedHash = decryptValue(previewHash);
            if (decryptedHash) {
                console.log("🎯 Using decrypted preview hash value:", decryptedHash);
                sessionStorage.setItem('cf_hashValue', decryptedHash);
                return; // Exit early when preview hash is set
            } else {
                console.error("❌ Failed to decrypt preview hash");
            }
        } catch (error) {
            console.error("❌ Error processing preview hash:", error);
        }
    }

    // If no preview hash, check for existing session storage or cookie
    if (sessionStorage.getItem('cf_hashValue') || getCookie('cf_hashValue')) {
        return;
    }

    // Use IP if available
    const ip = getCookie('cf_browserIp');
    if (ip) {
        hashValue = generateConsistentHash(ip);
    } else {
        // Fetch IP and generate hash
        fetchAndStoreIP().then(ip => {
            if (ip) {
                hashValue = generateConsistentHash(ip);
                setCookie('cf_hashValue', hashValue.toString(), 1);
                console.log('🎯 Hash value generated and stored');
            } else {
                // Generate a random hash value as last resort
                hashValue = Math.floor(Math.random() * 100);
                setCookie('cf_hashValue', hashValue.toString(), 1);
                console.log('🎯 Random hash value generated and stored');
            }
        });
        return;
    }

    // Store the hash value in cookies
    setCookie('cf_hashValue', hashValue.toString(), 1);
    console.log('🎯 Hash value stored in cookies');
}

// (function () {


// Try to run immediately
// initializeCFCartAttributes();

// Also attach to DOMContentLoaded as backup
// if (document.readyState === "loading") {
//     document.addEventListener('DOMContentLoaded', initializeCFCartAttributes);
// } else {
//     // DOMContentLoaded has already fired
//     initializeCFCartAttributes();
// }

// Another fallback with window.onload
// window.addEventListener('load', initializeCFCartAttributes);

// Add the direct script injection right away and again on load
// injectPriceMessageScript();
// window.addEventListener('load', injectPriceMessageScript);

// function initializeCFCartAttributes() {

//     saveAbtestIdsToCart();

// }
// })();



// Call this function before initializing price modifications
storeAbtestHashValue();
initializeAbtestPriceModifications();



// Ensure initialization happens after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAbtest);
} else {
    initializeAbtest();
}

// Also add load event listener as backup
window.addEventListener('load', () => {
    initializeAbtest();
});



// Initialize everything when DOM is loaded
function initializeAbtest() {
    // Prevent multiple initializations
    if (window.cfInitialized) {
        return;
    }

    window.cfInitialized = true;

    // Check for config parameters and mark script as detected
    checkConfigParamsAndMarkScriptDetected().catch(error => {
        console.error('Error in checkConfigParamsAndMarkScriptDetected:', error);
    });

    // Store device ID to cart attributes
    saveAbtestIdsToCart();

    // Generate and store hash value
    storeAbtestHashValue();

    // Apply product visibility modifications
    applyABTestProductModifications().catch(error => {
        console.error('Error in applyABTestProductModifications:', error);
    });

    // Initialize analytics tracking
    initializeAnalytics();

    // Set up variant change listener for product pages
    setupVariantChangeListener();
}

// Add cleanup function
function cleanupAbtest() {


    // Clear variant check interval
    if (window.cfVariantCheckInterval) {
        clearInterval(window.cfVariantCheckInterval);
        window.cfVariantCheckInterval = null;
    }

    // Call price modification cleanup
    if (window.cfPriceModificationCleanup) {
        window.cfPriceModificationCleanup();
    }

    // Reset initialization flag
    window.cfInitialized = false;
}

/**
 * Set up listener for variant changes on product pages
 */
function setupVariantChangeListener() {
    // Only set up on product pages
    if (!window.location.pathname.includes('/products/')) {
        return;
    }

    console.log('🔄 Setting up variant change listener for product page');

    // Listen for URL changes (variant parameter changes) and DOM changes
    let currentVariant = new URLSearchParams(window.location.search).get('variant') || getCurrentVariantFromDOM();

    // Check for variant changes periodically
    const checkVariantChange = () => {
        let newVariant = new URLSearchParams(window.location.search).get('variant');

        // If no variant in URL, try to get from DOM (but only if we don't already have a current variant)
        if (!newVariant && !currentVariant) {
            newVariant = getCurrentVariantFromDOM();
        }

        if (newVariant && newVariant !== currentVariant) {
            console.log('🔄 Variant changed from', currentVariant, 'to', newVariant);
            currentVariant = newVariant;

            // Clear existing modifications
            clearExistingPriceModifications();

            // Re-apply price modifications with new variant
            setTimeout(() => {
                applyABTestPriceModifications();
            }, 500);
        }
    };

    // Check every 5 seconds for variant changes (reduced frequency)
    const variantCheckInterval = setInterval(checkVariantChange, 5000);

    // Store interval ID for cleanup
    window.cfVariantCheckInterval = variantCheckInterval;

    // Also listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
        setTimeout(checkVariantChange, 100);
    });

    // Listen for variant selector changes
    document.addEventListener('change', (event) => {
        // Check for various types of variant selectors
        if (event.target.name === 'id' ||
            event.target.classList.contains('variant-selector') ||
            event.target.type === 'radio' ||
            event.target.name.includes('size') ||
            event.target.name.includes('color') ||
            event.target.name.includes('variant')) {
            setTimeout(checkVariantChange, 300);
        }
    });

    // Also listen for form updates that might change the variant
    document.addEventListener('input', (event) => {
        if (event.target.name === 'id' || event.target.classList.contains('product-variant-id')) {
            setTimeout(checkVariantChange, 300);
        }
    });
}

/**
 * Clear existing price modifications to allow re-processing
 */
function clearExistingPriceModifications() {
    console.log('💰 Clearing existing price modifications');

    // Find all elements with cf-modified attribute
    const modifiedElements = document.querySelectorAll('[data-cf-modified]');

    modifiedElements.forEach(element => {
        // Remove the modification attribute
        element.removeAttribute('data-cf-modified');

        // Try to restore original price if possible
        const originalSpan = element.querySelector('span[style*="line-through"]');
        if (originalSpan && originalSpan.textContent) {
            const originalText = originalSpan.textContent.trim();
            if (originalText) {
                element.textContent = originalText;
            }
        }
    });
}



/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}




/**
 * Track add to cart events
 */
function setupCartTracking() {
    console.log('🛒 Setting up cart tracking');

    // Shared function to handle add to cart tracking
    async function handleAddToCartTracking(form, eventType = 'submit') {
        console.log(`🛒 Add to cart ${eventType} detected`);

        try {
            // Get product ID from the hidden input
            let productId = form.querySelector('input[name="product-id"]')?.value;
            const variantId = form.querySelector('input[name="id"]')?.value;

            // If no product ID but we have variant ID, try to get product ID from the form ID
            if (!productId && form.id) {
                const formIdMatch = form.id.match(/product-form-([^-]+)/);
                if (formIdMatch) {
                    productId = formIdMatch[1];
                }
            }

            // Try data-product-id attribute
            if (!productId && form.dataset.productId) {
                productId = form.dataset.productId;
            }

            if (!productId) {
                console.log('❌ No product ID found in form');
                return;
            }

            const cleanProductId = getCleanId(productId);
            console.log(`🛒 Processing add to cart for product ID: ${cleanProductId}, variant ID: ${variantId}`);

            // Get IP from cookies
            const ip = getCookie('cf_browserIp');
            if (!ip) {
                console.log('❌ No IP found in cookies');
                return;
            }

            // Get hash value
            const hashValue = getHashValue();
            if (hashValue < 0) {
                console.log('❌ No valid hash value found');
                return;
            }

            // Get store ID
            const storeId = await getStoreId();

            // Get A/B test data
            const abTestsData = await fetchABTestData();

            if (!abTestsData) {
                console.log('❌ No A/B test data found');
                return;
            }

            // Find tests that include this product
            for (const [testId, test] of Object.entries(abTestsData)) {
                // Skip if test is not active
                if (!test.basicInfo || test.basicInfo.status !== 'active') {
                    continue;
                }

                if (!test.selectedProducts || !test.testGroups) {
                    continue;
                }

                // For price tests, check targeting criteria before tracking
                if (test.basicInfo.type === 'pricing') {
                    const meetsTargeting = await checkTargetingCriteria(test, testId);
                    if (!meetsTargeting) {
                        console.log(`🎯 User does not meet targeting criteria for test ${testId}, skipping cart tracking`);
                        continue;
                    }
                }

                // Get variant for this user
                const userVariant = getVariantForUser(test.testGroups, hashValue);
                if (!userVariant) {
                    continue;
                }

                // Find the variant index
                const variantIndex = test.testGroups.findIndex(group =>
                    group.id.toString() === userVariant.id.toString()
                );

                if (variantIndex === -1) {
                    continue;
                }

                // Check if this product is part of the test
                let foundProduct = false;
                let originalProductId = null;
                let productConfig = null;

                // Check if this product is in the test's selected products
                for (const product of test.selectedProducts) {
                    const testProductId = getCleanId(product.productId);
                    if (testProductId === cleanProductId) {
                        foundProduct = true;
                        originalProductId = testProductId;
                        productConfig = userVariant.products?.[testProductId];
                        break;
                    }
                }

                // For productDetails tests, also check for modified/created products
                if (!foundProduct && test.basicInfo?.type === 'productDetails') {
                    for (const product of test.selectedProducts) {
                        const testProductId = getCleanId(product.productId);
                        const productConfig = userVariant.products?.[testProductId];

                        if (productConfig?.createdProductId) {
                            const modifiedProductId = getCleanId(productConfig.createdProductId);
                            if (modifiedProductId === cleanProductId) {
                                foundProduct = true;
                                originalProductId = testProductId;
                                break;
                            }
                        }
                    }
                }

                if (!foundProduct) {
                    continue;
                }

                // Get product config if not already set
                if (!productConfig) {
                    productConfig = userVariant.products?.[originalProductId];
                }

                if (!productConfig) {
                    continue;
                }

                // Track add to cart event
                try {
                    if (test.basicInfo?.type === 'pricing') {
                        // For pricing tests, determine tracking based on context
                        const isAddToCartFromProductPage = window.location.pathname.includes('/products/');
                        let trackingKey;

                        if (isAddToCartFromProductPage && variantId) {
                            // Product page: Only track variants that are in the test configuration
                            const cleanVariantId = getCleanId(variantId);
                            const variantConfig = productConfig?.variants && productConfig.variants[cleanVariantId];

                            if (variantConfig) {
                                // Variant is in the test configuration, track by variant ID
                                trackingKey = `variantId_${cleanVariantId}`;
                            } else {
                                // Variant not in test configuration, skip analytics tracking
                                continue;
                            }
                        } else {
                            // Collection page or no variant ID: Use product ID
                            trackingKey = `productId_${originalProductId}`;
                        }

                        console.log(`📊 Tracking addToCart for ${trackingKey}`);

                        const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/addToCart`;
                        const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

                        // Fetch current addToCart data
                        const response = await fetch(analyticsUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch addToCart data: ${response.status}`);
                        }

                        let addToCartData = await response.json();

                        // Initialize as object if null or is an array
                        if (!addToCartData || Array.isArray(addToCartData)) {
                            addToCartData = {};
                        }

                        // Initialize the tracking key array if it doesn't exist
                        if (!addToCartData[trackingKey]) {
                            addToCartData[trackingKey] = [];
                        }

                        // Filter out empty strings and ensure it's an array
                        addToCartData[trackingKey] = Array.isArray(addToCartData[trackingKey])
                            ? addToCartData[trackingKey].filter(id => id !== "")
                            : [];

                        // Always add the IP to the array (allow multiple addToCart from same IP)
                        addToCartData[trackingKey].push(ip);

                        // Update Firebase with new addToCart data
                        const updateResponse = await fetch(analyticsUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(addToCartData)
                        });

                        if (!updateResponse.ok) {
                            throw new Error(`Failed to update addToCart data: ${updateResponse.status}`);
                        }

                        console.log(`📊 Successfully tracked add to cart for ${trackingKey}`);
                    } else {
                        // For productDetails tests, keep original simple array tracking
                        const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/addToCart`;
                        const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

                        // Fetch current addToCart data
                        const response = await fetch(analyticsUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch addToCart data: ${response.status}`);
                        }

                        let addToCartData = await response.json();

                        // Initialize array if null or not an array
                        if (!addToCartData || !Array.isArray(addToCartData)) {
                            addToCartData = [];
                        }

                        // Filter out empty strings
                        addToCartData = addToCartData.filter(id => id !== "");

                        // Always add the IP to the array
                        addToCartData.push(ip);

                        // Update Firebase with new addToCart data
                        const updateResponse = await fetch(analyticsUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(addToCartData)
                        });

                        if (!updateResponse.ok) {
                            throw new Error(`Failed to update addToCart data: ${updateResponse.status}`);
                        }

                        console.log(`📊 Successfully tracked add to cart for product ${cleanProductId}`);
                    }
                } catch (error) {
                    console.error('❌ Error updating addToCart analytics:', error);
                }
            }
        } catch (error) {
            console.error('❌ Error handling add to cart:', error);
        }
    }

    // 1. Handle normal form submissions for add to cart
    document.addEventListener('submit', async function (event) {
        // Check if this is an add to cart form
        if (event.target.action && event.target.action.includes('/cart/add')) {
            await handleAddToCartTracking(event.target, 'submit');
        }
    });

    // 2. Handle AJAX add to cart button clicks (for themes using js-ajax-submit or similar)
    document.addEventListener('click', async function (event) {
        // Check if clicked element is an add to cart button
        const isAddToCartButton = event.target.matches('.js-ajax-submit, .AddtoCart, [name="add"], input[value*="Add"], button[type="submit"]') ||
            event.target.closest('.js-ajax-submit, .AddtoCart, [name="add"]');

        if (isAddToCartButton) {
            // Find the closest form
            const form = event.target.closest('form[action*="/cart/add"]');
            if (form) {
                console.log('🛒 AJAX add to cart button clicked');
                // Add a small delay to allow the click to process first
                setTimeout(async () => {
                    await handleAddToCartTracking(form, 'click');
                }, 100);
            }
        }
    });

    // 3. Intercept fetch requests to /cart/add.js (common AJAX endpoint)
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const [resource, config] = args;

        // Check if this is a cart add request
        if (typeof resource === 'string' && resource.includes('/cart/add')) {
            console.log('🛒 AJAX cart add request intercepted');

            // Try to find the form that triggered this request
            const forms = document.querySelectorAll('form[action*="/cart/add"]');
            for (const form of forms) {
                // Look for recently clicked buttons in this form
                const addButton = form.querySelector('.js-ajax-submit, .AddtoCart, [name="add"]');
                if (addButton && addButton.hasAttribute('data-cf-clicked')) {
                    addButton.removeAttribute('data-cf-clicked');
                    await handleAddToCartTracking(form, 'fetch');
                    break;
                }
            }
        }

        return originalFetch.apply(this, args);
    };

    // 4. Mark buttons when clicked for fetch interception
    document.addEventListener('click', function (event) {
        if (event.target.matches('.js-ajax-submit, .AddtoCart, [name="add"]')) {
            event.target.setAttribute('data-cf-clicked', 'true');
            // Remove the attribute after a short delay
            setTimeout(() => {
                event.target.removeAttribute('data-cf-clicked');
            }, 2000);
        }
    });

    console.log('🛒 Cart tracking setup complete');
}



/**
 * Initialize analytics tracking
 */
function initializeAnalytics() {
    setupCartTracking();
    console.log("analytics initialized");
}





/**
 * Fetch and store IP address from geojs.io API
 * @returns {Promise<string>} The IP address
 */
async function fetchAndStoreIP() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const ip = data.ip;

        // Store IP in cookies
        setCookie('cf_browserIp', ip, 1);
        return ip;
    } catch (error) {
        console.error('❌ Error fetching IP:', error);
        return null;
    }
}

// Add cookie utility functions
function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
            const value = c.substring(nameEQ.length, c.length);
            return value;
        }
    }
    return null;
}

/**
 * Find price elements within a product element
 * @param {Element} element - The product element to search within
 * @param {boolean} returnAll - If true, returns all price elements; if false, returns first one
 * @returns {Element[]|Element|null} - Array of price elements, single element, or null
 */
function findPriceElementForProduct(element, returnAll = false) {
    if (!element) return returnAll ? [] : null;

    // Helper function to validate price element
    const isPriceElement = (el) => {
        if (!el) return false;
        const text = el.textContent.trim();
        return text.startsWith('Rs.') || text.startsWith('$') || text.startsWith('£') || text.startsWith('€') || /^\d/.test(text);
    };

    const priceElements = [];

    try {
        // 1. Look specifically for PageLab price elements
        const pageLabPriceElements = element.querySelectorAll('.plb-product-price');
        pageLabPriceElements.forEach(el => {
            if (isPriceElement(el) && !priceElements.includes(el)) {
                priceElements.push(el);
            }
        });

        // 2. Try to find price within a .price__container
        const priceContainer = element.querySelector('.price__container');
        if (priceContainer) {
            // Find all sale prices
            const salePrices = priceContainer.querySelectorAll('.price-item--sale');
            salePrices.forEach(el => {
                if (isPriceElement(el) && !priceElements.includes(el)) {
                    priceElements.push(el);
                }
            });

            // Find all regular prices
            const regularPrices = priceContainer.querySelectorAll('.price-item--regular');
            regularPrices.forEach(el => {
                if (isPriceElement(el) && !priceElements.includes(el)) {
                    priceElements.push(el);
                }
            });
        }

        // 3. Look for price elements with specific classes
        const priceSelectors = [
            '.plb-product-price',
            // Collection page specific selectors
            '.price.price--listing .price-item.price-item--sale',
            '.price.price--listing .price-item.price-item--regular',
            '.price--listing dd .price-item--sale',
            '.price--listing dd .price-item--regular',
            '.collection__page-product .price-item--sale',
            '.collection__page-product .price-item--regular',
            '.js-product-listing .price-item--sale',
            '.js-product-listing .price-item--regular',
            // General selectors
            '.price-item--sale',
            '.price-item--regular',
            '.price__sale .price-item',
            '.price__regular .price-item',
            '.price .price-item',
            '[class*="price"]'
        ];

        for (const selector of priceSelectors) {
            const elements = Array.from(element.querySelectorAll(selector));
            elements.forEach(el => {
                if (isPriceElement(el) && !priceElements.includes(el)) {
                    priceElements.push(el);
                }
            });
        }

        // Return based on returnAll parameter
        if (returnAll) {
            return priceElements;
        } else {
            return priceElements.length > 0 ? priceElements[0] : null;
        }
    } catch (error) {
        console.error('❌ Error in findPriceElementForProduct:', error);
        return returnAll ? [] : null;
    }
}

/**
 * Extract numeric price value from price text and preserve original format
 * @param {string} priceText - The price text to extract from
 * @returns {Object} - Object containing numeric value and format info
 */
function extractPriceFromText(priceText) {
    if (!priceText) return { value: 0, originalFormat: priceText };

    const originalText = priceText.trim();

    // Extract the actual price number more precisely
    // Look for the last occurrence of a number pattern that could be a price
    const priceMatch = originalText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2}|\d+)/);
    if (!priceMatch) return { value: 0, originalFormat: originalText };

    const cleanText = priceMatch[0];

    if (!cleanText) return { value: 0, originalFormat: originalText };

    // Handle different decimal separators
    let numericValue;

    // Check if it's a format like 1,999.99 (comma as thousands separator, dot as decimal)
    if (cleanText.includes(',') && cleanText.includes('.') && cleanText.lastIndexOf('.') > cleanText.lastIndexOf(',')) {
        numericValue = parseFloat(cleanText.replace(/,/g, ''));
    }
    // Check if it's a format like 1.999,99 (dot as thousands separator, comma as decimal) - European format
    else if (cleanText.includes('.') && cleanText.includes(',') && cleanText.lastIndexOf(',') > cleanText.lastIndexOf('.')) {
        numericValue = parseFloat(cleanText.replace(/\./g, '').replace(',', '.'));
    }
    // Check if it's a simple format with comma as decimal separator (like 19,99)
    else if (cleanText.includes(',') && !cleanText.includes('.')) {
        numericValue = parseFloat(cleanText.replace(',', '.'));
    }
    // Default case: assume dot as decimal separator
    else {
        numericValue = parseFloat(cleanText.replace(/,/g, ''));
    }

    return {
        value: isNaN(numericValue) ? 0 : numericValue,
        originalFormat: originalText
    };
}

/**
 * Format modified price to match the original price format
 * @param {string} originalFormat - The original price text with currency symbols
 * @param {number} newPrice - The new price value to format
 * @returns {string} - Formatted price text matching original format
 */
function formatPriceToMatchOriginal(originalFormat, newPrice) {
    if (!originalFormat) return newPrice.toString();

    // Extract the numeric pattern more precisely - look for actual price numbers
    // This regex looks for numbers that may have commas as thousands separators and dots as decimal points
    const numericPattern = originalFormat.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2}|\d+)/);

    if (!numericPattern) return newPrice.toString();

    const originalNumericPart = numericPattern[0]; // The actual numeric part

    // Determine the decimal places from original format
    let decimalPlaces = 2; // default
    if (originalNumericPart.includes('.')) {
        const parts = originalNumericPart.split('.');
        decimalPlaces = parts[parts.length - 1].length;
    } else if (originalNumericPart.includes(',') && originalNumericPart.lastIndexOf(',') > originalNumericPart.length - 4) {
        // If comma is used as decimal separator (like 19,99)
        const parts = originalNumericPart.split(',');
        decimalPlaces = parts[parts.length - 1].length;
    }

    // Format the new price to match original decimal places
    let formattedPrice;

    // Check if original uses comma as decimal separator
    if (originalNumericPart.includes(',') && !originalNumericPart.includes('.')) {
        // Format like 19,99
        formattedPrice = newPrice.toFixed(decimalPlaces).replace('.', ',');
    } else if (originalNumericPart.includes('.') && originalNumericPart.includes(',') &&
        originalNumericPart.lastIndexOf(',') > originalNumericPart.lastIndexOf('.')) {
        // European format like 1.999,99
        const formatted = newPrice.toFixed(decimalPlaces);
        const [integerPart, decimalPart] = formatted.split('.');

        // Add thousands separators with dots and decimal with comma
        const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        formattedPrice = decimalPart ? `${withThousands},${decimalPart}` : withThousands;
    } else {
        // Standard format like 1,999.99 or 19.99
        const formatted = newPrice.toFixed(decimalPlaces);
        const [integerPart, decimalPart] = formatted.split('.');

        // Add thousands separators with commas
        const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formattedPrice = decimalPart ? `${withThousands}.${decimalPart}` : withThousands;
    }

    // Replace only the exact numeric part in the original format with the new formatted price
    return originalFormat.replace(originalNumericPart, formattedPrice);
}

/**
 * Update price element with strikethrough and new price, preserving original format
 * @param {Element} priceElement - The price element to update
 * @param {number} modifiedPrice - The modified price
 * @param {string} originalFormat - The original price format to preserve
 */
function updatePriceElementWithFormat(priceElement, modifiedPrice, originalFormat) {
    if (!priceElement) return;

    // Check if already modified to prevent multiple modifications
    if (priceElement.hasAttribute('data-cf-modified') || priceElement.querySelector('[data-cf-modified]')) {
        return;
    }

    // Keep the exact original price text as displayed on the page
    const originalText = priceElement.textContent;

    // Create simple span for original price with strikethrough
    const originalSpan = document.createElement('span');
    originalSpan.style.textDecoration = 'line-through';
    originalSpan.style.color = '#999';
    originalSpan.style.marginRight = '8px';
    originalSpan.textContent = originalText;

    // Create text node for space
    const space = document.createTextNode(' ');

    // Create simple span for modified price, preserving exact format as original
    const modifiedSpan = document.createElement('span');
    modifiedSpan.style.color = '#333333'; // More subtle gray color
    modifiedSpan.style.fontWeight = 'normal'; // Normal weight, not bold

    // Use the formatPriceToMatchOriginal function to preserve currency symbols and format
    modifiedSpan.textContent = formatPriceToMatchOriginal(originalFormat, modifiedPrice);

    // Clear the original element and add new elements
    priceElement.textContent = '';
    priceElement.appendChild(originalSpan);
    priceElement.appendChild(space);
    priceElement.appendChild(modifiedSpan);

    // Mark as modified to prevent future modifications
    priceElement.setAttribute('data-cf-modified', 'true');
}

/**
 * Get current variant ID from DOM elements on product pages
 * @returns {string|null} The current variant ID or null if not found
 */
function getCurrentVariantFromDOM() {
    try {
        // Method 1: Try to get from product-variant-id class
        const variantIdInput = document.querySelector('.product-variant-id');
        if (variantIdInput && variantIdInput.value) {
            return variantIdInput.value;
        }

        // Method 2: Try to get from hidden input with name="id"
        const hiddenIdInput = document.querySelector('input[type="hidden"][name="id"]');
        if (hiddenIdInput && hiddenIdInput.value) {
            return hiddenIdInput.value;
        }

        // Method 3: Try to get from data-selected-variant JSON script
        const selectedVariantScript = document.querySelector('script[data-selected-variant]');
        if (selectedVariantScript) {
            try {
                const variantData = JSON.parse(selectedVariantScript.textContent);
                if (variantData && variantData.id) {
                    return variantData.id.toString();
                }
            } catch (e) {
                // Silent fail
            }
        }

        // Method 4: Try to get from checked radio button and map to variant
        const checkedRadio = document.querySelector('input[type="radio"]:checked');
        if (checkedRadio) {
            // Look for a form that might contain variant mapping
            const productForm = document.querySelector('form[action*="/cart/add"]');
            if (productForm) {
                const variantInput = productForm.querySelector('input[name="id"], input[class*="variant"]');
                if (variantInput && variantInput.value) {
                    return variantInput.value;
                }
            }
        }

        // Method 5: Try to get from any form with action="/cart/add"
        const cartForms = document.querySelectorAll('form[action="/cart/add"], form[action*="/cart/add"]');
        for (const form of cartForms) {
            const idInput = form.querySelector('input[name="id"]');
            if (idInput && idInput.value) {
                return idInput.value;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting current variant from DOM:', error);
        return null;
    }
}

/**
 * Check if traffic source is paid based on URL parameters
 * @returns {boolean} True if paid traffic, false if organic
 */
function isPaidTraffic() {
    const cf_ppc_list = ['utm_', 'fbclid', 'gclid', 'mc_cid', 'mc_eid', '_ke', 'epik', 'msclkid', '__hstc', 'wbraid'];
    const urlParams = new URLSearchParams(window.location.search);

    for (const param of cf_ppc_list) {
        for (const [key] of urlParams) {
            if (key.startsWith(param)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Check for config query parameters and mark script as detected in Firebase
 */
async function checkConfigParamsAndMarkScriptDetected() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const configParams = ['price_tagging', 'source', 'config', 'debug', 'test_mode'];

        // Check if any config parameters are present
        let hasConfigParam = false;
        for (const param of configParams) {
            if (urlParams.has(param)) {
                hasConfigParam = true;
                console.log(`🔍 Found config parameter: ${param}=${urlParams.get(param)}`);
                break;
            }
        }

        // If no config params found, return early
        if (!hasConfigParam) {
            return;
        }

        console.log('🔍 Config parameters detected, marking script as detected in Firebase');

        // Get the store ID (sanitized domain)
        const storeId = await getStoreId();

        // Firebase URL for isscriptDetected node (same level as querySelectors)
        const firebaseUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/abTests/${storeId}/isScriptDetected.json`;

        // Make the Firebase call to set isscriptDetected to true
        const response = await fetch(firebaseUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(true)
        });

        if (!response.ok) {
            throw new Error(`Failed to update isscriptDetected: ${response.status}`);
        }

        console.log('✅ Successfully marked script as detected in Firebase');

    } catch (error) {
        console.error('❌ Error marking script as detected:', error);
    }
}

/**
 * Check if user is a returning visitor by looking up unique ID in Firebase
 * @returns {Promise<boolean>} True if returning visitor, false if new
 */
async function isReturningVisitor() {
    try {
        // Wait for fingerprinting to complete
        let uniqueId = cf_finalDevId;
        let attempts = 0;
        const maxAttempts = 20; // Wait up to 10 seconds (20 * 500ms)

        // Wait for cf_finalDevId to be set (not dummy value) or fingerprinting to complete
        while (!window.cf_fingerprintComplete && (!uniqueId) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
            uniqueId = cf_finalDevId;
            attempts++;
        }

        console.log("🔍 uniqueIddd", uniqueId);
        console.log('🔍 Using unique ID for visitor check:', uniqueId);

        // If still no valid unique ID, assume new visitor
        if (!uniqueId) {
            console.log('🆕 No unique ID available after waiting - treating as new visitor');
            return false;
        }

        const firebaseUrl = `https://causalfunnel-21-leightworks-prodv1-20jul2022.firebaseio.com/cronuploads/devXbrowserId/${uniqueId}.json`;

        const response = await fetch(firebaseUrl);
        if (!response.ok) {
            console.log('🆕 API call failed - treating as new visitor');
            return false; // New visitor if API call fails
        }

        const data = await response.json();

        // Simple check: if data is null, it's a first time visitor
        // If data exists (any value), it's a returning visitor
        if (data === null) {
            console.log('🆕 API returned null - new visitor');
            return false; // New visitor
        } else {
            console.log('🔄 API returned data - returning visitor');
            return true; // Returning visitor
        }
    } catch (error) {
        console.error('❌ Error checking returning visitor status:', error);
        return false; // Assume new visitor on error
    }
}

/**
 * Check device type (mobile vs desktop)
 * @returns {string} 'mobile' or 'desktop'
 */
function getDeviceType() {
    window.mobileCheck = function () {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    console.log("isMobile ?", window.mobileCheck());
    return window.mobileCheck() ? 'mobile' : 'desktop';
}

/**
 * Check if a test is in preview mode
 * @param {string} testId - The test ID to check
 * @returns {boolean} True if test is in preview mode
 */
function isTestInPreviewMode(testId) {
    const previewTestIdSession = sessionStorage.getItem('abTest_testId');


    return previewTestIdSession && previewTestIdSession === testId;
}

/**
 * Check if user meets targeting criteria for a given test
 * @param {Object} test - The test configuration
 * @param {string} testId - The test ID (optional, for preview override)
 * @returns {Promise<boolean>} True if user meets targeting criteria
 */
async function checkTargetingCriteria(test, testId = null) {
    // Check if this is a preview session for this specific test
    if (testId && isTestInPreviewMode(testId)) {
        console.log('🎯 Preview mode detected for test', testId, '- bypassing targeting criteria');
        return true;
    }

    if (!test.targeting) {
        return true; // No targeting specified, allow all users
    }

    const targeting = test.targeting;
    console.log('🎯 Checking targeting criteria:', targeting);

    // Check traffic source
    if (targeting.trafficSource) {
        const userIspaid = isPaidTraffic();
        const userTrafficType = userIspaid ? 'paid' : 'organic';

        // If targeting is set to "all", allow both paid and organic traffic
        if (targeting.trafficSource === 'all') {
            console.log(`🎯 Traffic source targeting set to "all" - allowing ${userTrafficType}`);
        } else {
            const targetingIsPaid = targeting.trafficSource === 'paid_traffic';
            if (userIspaid !== targetingIsPaid) {
                console.log(`🎯 Traffic source mismatch: user=${userTrafficType}, targeting=${targeting.trafficSource}`);
                return false;
            }
        }
    }

    // Check visitor type
    if (targeting.visitorType) {
        const userIsReturning = await isReturningVisitor();
        const userVisitorType = userIsReturning ? 'returning' : 'new';

        // If targeting is set to "all", allow both new and returning visitors
        if (targeting.visitorType === 'all') {
            console.log(`🎯 Visitor type targeting set to "all" - allowing ${userVisitorType}`);
        } else {
            const targetingIsReturning = targeting.visitorType === 'returning';
            if (userIsReturning !== targetingIsReturning) {
                console.log(`🎯 Visitor type mismatch: user=${userVisitorType}, targeting=${targeting.visitorType}`);
                return false;
            }
        }
    }

    // Check device type
    if (targeting.deviceType) {
        const userDevice = getDeviceType();

        // If targeting is set to "all", allow both mobile and desktop
        if (targeting.deviceType === 'all') {
            console.log(`🎯 Device type targeting set to "all" - allowing ${userDevice}`);
        } else if (userDevice !== targeting.deviceType) {
            console.log(`🎯 Device type mismatch: user=${userDevice}, targeting=${targeting.deviceType}`);
            return false;
        }
    }

    console.log('🎯 User meets all targeting criteria');
    return true;
}

/**
 * Apply A/B test price modifications
 */
async function applyABTestPriceModifications() {
    console.log('💰 Applying price modifications');

    // Fetch active tests
    const activeTests = await fetchABTestData();

    // Get user's hash value
    const hashValue = getHashValue();

    // If no active tests or no hash value, return early
    if (!activeTests || Object.keys(activeTests).length === 0) {
        return;
    }

    if (hashValue < 0) {
        return;
    }

    // Process all products on the page regardless of page type
    await processAllProducts(activeTests, hashValue);
}

/**
 * Process all products for price modifications
 * @param {Object} activeTests - The active tests data
 * @param {number} hashValue - The user's hash value
 */
async function processAllProducts(activeTests, hashValue) {
    // Early return if no tests
    if (!activeTests || Object.keys(activeTests).length === 0) {
        console.log('❌ No active tests to process');
        return;
    }

    const isProductPage = window.location.pathname.includes('/products/');
    const currentVariantId = getCurrentVariantFromDOM();

    // Process each test
    for (const [testId, test] of Object.entries(activeTests)) {
        console.log(`🧪 Processing test: ${testId}`);

        // Validate test data completeness before processing
        if (!isValidTestConfiguration(test)) {
            console.log(`❌ Test ${testId} has incomplete configuration, skipping analytics tracking`);
            continue;
        }

        // Skip if test is not active
        if (!test.basicInfo || test.basicInfo.status !== 'active') {
            console.log(`❌ Test ${testId} is not active, status: ${test.basicInfo?.status || 'unknown'}`);
            continue;
        }

        // Skip if no selected products
        if (!test.selectedProducts || !Array.isArray(test.selectedProducts) || test.selectedProducts.length === 0) {
            console.log(`❌ Test ${testId} has no selected products`);
            continue;
        }

        // Check targeting criteria for price tests
        const meetsTargeting = await checkTargetingCriteria(test, testId);
        if (!meetsTargeting) {
            console.log(`🎯 User does not meet targeting criteria for test ${testId}, skipping modifications but storing in cookies`);

            // Store user info in cookies for potential future targeting but don't apply any modifications
            const ip = getCookie('cf_browserIp');
            if (ip) {
                // Store that this user was evaluated for this test but didn't meet criteria
                setCookie(`cf_test_${testId}_evaluated`, 'true', 1);
                setCookie(`cf_test_${testId}_targeted`, 'false', 1);
            }
            continue;
        }

        // Get user variant for this test
        const testGroups = Array.isArray(test.testGroups) ? test.testGroups : Object.values(test.testGroups);
        const userVariant = getVariantForUser(testGroups, hashValue);

        if (!userVariant) {
            continue;
        }

        for (const product of test.selectedProducts) {
            if (!product || !product.productId) {
                console.error('❌ Invalid product in test:', product);
                continue;
            }

            const productId = getCleanId(product.productId);

            // Get price modification for this product (may be null for control groups)
            const productConfig = userVariant.products && userVariant.products[productId];

            // Determine discount percentage for price modifications (if applicable)
            let discountPercentage = 0;
            let shouldApplyPriceModification = false;

            if (productConfig) {
                if (productConfig.samePrice === true) {
                    // For products with same price across variants, use product-level discount percentage
                    discountPercentage = Number(productConfig.discountPercentage || 0);
                } else if (productConfig.samePrice === false && isProductPage && currentVariantId) {
                    // For products with different variant prices on product page, use variant-specific discount percentage
                    const cleanVariantId = getCleanId(currentVariantId);
                    const variantConfig = productConfig.variants && productConfig.variants[cleanVariantId];

                    if (variantConfig) {
                        discountPercentage = Number(variantConfig.discountPercentage || 0);
                    }
                } else if (productConfig.samePrice === false && !isProductPage) {
                    // For collection pages with different variant prices, skip price modification but still process analytics
                    discountPercentage = 0;
                } else {
                    // Fallback to product-level discount percentage
                    discountPercentage = Number(productConfig.discountPercentage || 0);
                }

                // Only apply price modification if discount percentage is valid and greater than 0
                shouldApplyPriceModification = !isNaN(discountPercentage) && discountPercentage > 0;
            }

            console.log(`🔍 Processing product ${productId} for user variant ${userVariant.name} (discount: ${discountPercentage}%)`);

            // Note: We continue with view tracking even if no productConfig or discountPercentage is 0
            // This ensures control groups are properly tracked

            // Find elements containing this product ID
            let productElements = [];
            const currentHostname = window.location.hostname;

            if (currentHostname === 'qk5ygj-jp.myshopify.com') {
                const variantId = getCleanId(product.variantId);

                const productElement = findProductElementsById(productId);
                const variantElement = findProductElementsById(variantId);
                productElements = [...productElement, ...variantElement];
            } else {
                productElements = findProductElementsById(productId);
            }

            if (productElements.length > 0) {
                // Apply price modification to each found element (only if shouldApplyPriceModification is true)
                if (shouldApplyPriceModification) {
                    for (const element of productElements) {
                        // Skip if already modified
                        if (element.hasAttribute('data-cf-modified') || element.querySelector('[data-cf-modified]')) {
                            continue;
                        }
                        // Find ALL price elements for this product, not just the first one
                        const allPriceElements = findPriceElementForProduct(element, true);

                        if (allPriceElements.length > 0) {
                            console.log(`🔍 Found ${allPriceElements.length} price elements for product ${productId}`);

                            // Apply modification to all price elements
                            allPriceElements.forEach((priceElement, index) => {
                                // Skip if already modified
                                if (priceElement.hasAttribute('data-cf-modified')) {
                                    console.log(`🔍 Price element ${index + 1} already modified, skipping`);
                                    return;
                                }

                                const currentPriceText = priceElement.textContent.trim();
                                const priceInfo = extractPriceFromText(currentPriceText);

                                if (priceInfo.value > 0) {
                                    const modifiedPrice = priceInfo.value * (1 - discountPercentage / 100);
                                    updatePriceElementWithFormat(priceElement, modifiedPrice, priceInfo.originalFormat);
                                    console.log(`💰 Updated price element ${index + 1} for product ${productId}: ${discountPercentage}% discount`);
                                }
                            });
                        } else {
                            console.log(`❌ No price elements found for product ${productId}`);
                        }
                    }
                }

                // Track view for analytics with product/variant specificity - ONLY if product found on page
                if (productElements.length > 0) {
                    try {
                        const ip = getCookie('cf_browserIp');
                        if (ip) {
                            const storeId = await getStoreId();
                            const variantIndex = testGroups.findIndex(group =>
                                group.id && group.id.toString() === userVariant.id.toString()
                            );

                            if (variantIndex !== -1) {
                                // Determine the tracking key based on page type and variant availability
                                let trackingKey;
                                if (isProductPage && currentVariantId) {
                                    // Product page: Check if variants are configured
                                    const cleanVariantId = getCleanId(currentVariantId);
                                    const variantConfig = productConfig && productConfig.variants && productConfig.variants[cleanVariantId];

                                    if (variantConfig || !productConfig) {
                                        // Either variant is configured OR it's a control group without productConfig
                                        // In both cases, track by variant ID
                                        trackingKey = `variantId_${cleanVariantId}`;
                                    } else {
                                        // Variant exists in productConfig but not configured for this specific variant
                                        // This means this variant is not part of the test, skip tracking
                                        continue;
                                    }
                                } else {
                                    // Collection page or no variant ID: Use product ID
                                    trackingKey = `productId_${productId}`;
                                }

                                const firebasePath = `abTests/${storeId}/${testId}/testGroups/${variantIndex}/analytics/views`;
                                const analyticsUrl = `https://abtest-6b299-default-rtdb.firebaseio.com/${firebasePath}.json`;

                                const response = await fetch(analyticsUrl);
                                if (response.ok) {
                                    let views = await response.json();

                                    // Initialize views as object if it's not already
                                    if (!views || Array.isArray(views)) {
                                        views = {};
                                    }

                                    // Initialize the tracking key array if it doesn't exist
                                    if (!views[trackingKey]) {
                                        views[trackingKey] = [];
                                    }

                                    // Filter out empty strings and ensure it's an array
                                    views[trackingKey] = Array.isArray(views[trackingKey])
                                        ? views[trackingKey].filter(v => v !== "")
                                        : [];

                                    // Always add IP for each view (allow multiple views from same IP)
                                    views[trackingKey].push(ip);

                                    await fetch(analyticsUrl, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(views)
                                    });

                                    console.log(`📊 Recorded view for ${trackingKey}`);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error tracking view:', error);
                    }
                } else {
                    console.log(`Product ${productId} not found on page`);
                }
            } else {
                console.log(`Product ${productId} not found on page`);
            }
        }
    }
}

// Add new function to validate test configuration
function isValidTestConfiguration(test) {
    // Check if test has all required fields for proper operation
    if (!test || typeof test !== 'object') {
        return false;
    }

    // Must have basicInfo with required fields
    if (!test.basicInfo ||
        !test.basicInfo.testName ||
        !test.basicInfo.type ||
        !test.basicInfo.status) {
        return false;
    }

    // Must have valid testGroups structure
    if (!test.testGroups) {
        return false;
    }

    // Convert testGroups to array if it's an object
    const testGroupsArray = Array.isArray(test.testGroups) ? test.testGroups : Object.values(test.testGroups);

    // Must have at least one valid test group
    if (!testGroupsArray || testGroupsArray.length === 0) {
        return false;
    }

    // Check that testGroups don't contain null values (which indicates incomplete data)
    const hasNullGroups = testGroupsArray.some(group => group === null || group === undefined);
    if (hasNullGroups) {
        return false;
    }

    // Each test group must have essential properties
    const hasValidGroups = testGroupsArray.every(group =>
        group &&
        typeof group === 'object' &&
        group.id !== undefined &&
        group.name &&
        group.percentage !== undefined
    );

    if (!hasValidGroups) {
        return false;
    }

    // Must have selectedProducts for most test types
    if (test.basicInfo.type !== 'offers' && (!test.selectedProducts || !Array.isArray(test.selectedProducts) || test.selectedProducts.length === 0)) {
        return false;
    }

    // Must have targeting configuration
    if (!test.targeting || typeof test.targeting !== 'object') {
        return false;
    }

    return true;
}

/**
 * LeightWorks-specific product element finder - targets main product section and product listings
 * @param {string} productId - The product ID to search for
 * @returns {Array} Array of DOM elements that should be modified
 */
function findProductElementsByIdLeightWorks(productId) {
    const elements = [];

    try {
        // 1. Target the main product section: <section id="product-{productId}" ... data-product-id="{productId}">
        const mainProductSection = document.querySelector(`section#product-${productId}[data-product-id="${productId}"]`);

        if (mainProductSection) {
            elements.push(mainProductSection);
            console.log('✅ Found main LeightWorks product section:', mainProductSection);
        }

        // 2. Target product listing elements: <div id="product-listing-{productId}" ... data-product-id="{productId}">
        const productListingElements = document.querySelectorAll(`div#product-listing-${productId}[data-product-id="${productId}"]`);

        if (productListingElements.length > 0) {
            productListingElements.forEach(element => {
                elements.push(element);
                console.log('✅ Found LeightWorks product listing element:', element);
            });
        }

        // 3. Target product elements by review widget data-id (for products in recommendation sections)
        const reviewWidgets = document.querySelectorAll(`[data-id="${productId}"]`);

        reviewWidgets.forEach(widget => {
            // Find the parent product container
            const productContainer = widget.closest('.product.product-index, .product-index, .js-product-listing');
            if (productContainer && !elements.includes(productContainer)) {
                elements.push(productContainer);
                console.log('✅ Found LeightWorks product via review widget:', productContainer);
            }
        });

        if (elements.length === 0) {
            console.log('❌ No LeightWorks product elements found for product:', productId);
        }

        return elements;
    } catch (error) {
        console.error('❌ Error in findProductElementsByIdLeightWorks:', error);
        return [];
    }
}

async function manageTestTimers() {
    try {
        console.log('🔄 Starting manageTestTimers function');
        // Fetch active tests
        const testData = await fetchABTestData();
        console.log('📊 Active tests:', testData);

        if (!testData || typeof testData !== 'object') {
            console.log('❌ Invalid test data');
            return;
        }

        // Get current timestamp in the correct timezone
        const now = new Date();
        const currentTime = now.toISOString();
        console.log('⏰ Current time:', {
            iso: currentTime,
            local: now.toString(),
            timestamp: now.getTime()
        });

        // Process each test from the object
        Object.entries(testData).forEach(([testId, testInfo]) => {
            // Skip non-test properties
            if (testId === 'isScriptDetected' || testId === 'querySelectors') {
                return;
            }

            const testType = testInfo?.basicInfo?.type || 'unknown';
            const testTimerKey = `cf_test_timer_${testType}_${testId}`;
            const existingTimer = getCookie(testTimerKey);
            console.log('🔍 Test:', testId, 'Type:', testType, 'Timer key:', testTimerKey, 'Existing timer:', existingTimer);

            // Check if test is active based on basicInfo.status
            const isActive = testInfo?.basicInfo?.status === 'active';
            console.log('📋 Test status:', isActive ? 'active' : 'inactive');

            // If test is active and no timer exists, set it
            if (isActive && !existingTimer) {
                // Ensure we're using a valid current timestamp
                const timestamp = new Date().toISOString();
                setCookie(testTimerKey, timestamp, 3); // Set for 3 days
                console.log('✅ Timer set for test:', {
                    testId,
                    type: testType,
                    timestamp,
                    localTime: new Date().toString()
                });
            }
            // If test is not active and timer exists, remove it
            else if (!isActive && existingTimer) {
                setCookie(testTimerKey, '', -1); // Remove cookie
                console.log('🗑️ Timer removed for inactive test:', testId, 'Type:', testType);
            } else {
                console.log('ℹ️ Timer already exists or test inactive:', {
                    testId,
                    type: testType,
                    existingTimer: existingTimer || 'none'
                });
            }
        });
    } catch (error) {
        console.error('❌ Error managing test timers:', error);
    }
}

// Call the function at top level
(function () {
    console.log('🚀 Initializing test timer management');
    manageTestTimers();
})();

