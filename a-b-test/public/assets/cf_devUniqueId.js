function rv_callbody() {

    var rv_debugGen = false;
    var rv_finalDevId = "dummy_devid";
    var rv_finalBrowserId = "dummy_browserid";
    var rv_finalBrowserIdV2 = "dummy_browseridV2";
    var rv_browserIdStr = "dummy_browseridStr";
    var rv_browserIdStrV2 = "dummy_browseridStrV2";
    var rv_browserIdStrV2part = "dummy_rv_browserIdStrV2part";
    var rv_browserIndStr = "dummy_browserIndStr";

  
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
  
        rv_platform = navigator.platform;
        window.rv_browser = browser;
  
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
  
      window.rv_jscd = {
        mobile: mobile,
        os: os,
        //osVersion: osVersion,
        platform: rv_platform
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
  
    (function initrv_PrintJS() {
  
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
        var rv_canvasDataURL = null;
        var rv_resultPrecision = [];
        if (gl.canvas != null) { rv_canvasDataURL = gl.canvas.toDataURL(); }
        //if (gl.canvas != null) { result.push(gl.canvas.toDataURL()); }
        if (gl.canvas != null) { result_device.push(rv_canvasDataURL); }
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
        rv_resultPrecision.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision);
        rv_resultPrecision.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision);
        rv_resultPrecision.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).precision);
        rv_resultPrecision.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision);
        rv_resultPrecision.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision);
        rv_resultPrecision.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).precision);
        rv_resultPrecision.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMax);
        rv_resultPrecision.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).precision);
        rv_resultPrecision.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMax);
        rv_resultPrecision.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).precision);
        rv_resultPrecision.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMax);
        rv_resultPrecision.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).precision);
        rv_resultPrecision.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMin);
        rv_resultPrecision.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).precision);
        rv_resultPrecision.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).precision);
        rv_resultPrecision.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMax);
        rv_resultPrecision.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).precision);
        rv_resultPrecision.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMin);
        rv_resultPrecision.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMax);
  
        // NOTE: browser ind
        device_webglSpecs = rv_resultPrecision.join("_")
  
        result.push(rv_canvasDataURL)
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

  
  

      var visitorIdCan = x64hash128(`'canvasData':${canvasData}`)
      if (rv_debugGen) 
  

      var visitorIdWebGL = x64hash128(`'webGLData':${webGLData}`)

  
      var rv_browserInd = [];
      var rv_browserIdV2 = [];
      var rv_browserIdLog = [];
  
      // NOTE: browser ind -- not ind for new MacOS 

      //rv_browserInd.push(`'webGLVendor':${webGLVendor}`)
      var visitorIdWebGLV = x64hash128(`'webGLVendor':${webGLVendor}`)

  
      // NOTE: browser ind -- not ind for new MacOS

      //rv_browserInd.push(`'webGLRenderer':${webGLRenderer}`)
      var visitorIdWebGLR = x64hash128(`'webGLRenderer':${webGLRenderer}`)

  
      // NOTE: browser ind

      rv_browserInd.push(`'device_webglSpecs':${device_webglSpecs}`)
      var visitorIdWebGLSpecs = x64hash128(`'device_webglSpecs':${device_webglSpecs}`)

  
      var visitorIdWebGL_device = x64hash128(`'webGLData_device':${webGLData_device}`)

  
      // NOTE: browser ind
      var audioFprint = audioFPrinting();

      rv_browserInd.push(`'audio_device':${audioFprint}`)
      var audio_device = x64hash128(`'audio_device':${audioFprint}`)

  
      // NOTE: browser ind
      var resFprint = getResolution();

      rv_browserInd.push(`'res_device':${resFprint}`)
      var res_device = x64hash128(`'res_device':${resFprint}`)

  
      var rv_cpuCores = "-1";
      if (navigator.hardwareConcurrency)
        rv_cpuCores = navigator.hardwareConcurrency;

      rv_browserIdV2.push(`'cpu_device':${rv_cpuCores}`);
      var cpu_device = x64hash128(`'cpu_device':${rv_cpuCores}`);

  
      var langFprint = get_writing_scripts();

      rv_browserIdV2.push(`'lang_device':${langFprint}`);
      var lang_device = x64hash128(`'lang_device':${langFprint}`);

  
      // NOTE: browser ind
      var timeFprint = new Date().getTimezoneOffset();
  
      rv_browserInd.push(`'time_device':${timeFprint}`)
      var time_device = x64hash128(`'time_device':${timeFprint}`)

  
      // NOTE: browser ind
      var osFprint = JSON.stringify(rv_jscd);

      rv_browserInd.push(`'os_device':${osFprint}`);
      var os_device = x64hash128(`'os_device':${osFprint}`);
      rv_browserIdLog.push(`'os_device':${osFprint}`);

  
      // NOTE: browser ind
      var osLangFprint = getOSlanguage();

      rv_browserInd.push(`'osLang_device':${osLangFprint}`);
      var osLang_device = x64hash128(`'osLang_device':${osLangFprint}`);
      rv_browserIdLog.push(`'osLang_device':${osLangFprint}`);

  
      rv_browserIdV2.push(`'browser_device':${rv_browser}`);
      rv_browserIdLog.push(`'browser_device':${rv_browser}`);
  
      var rv_ipstring = "null";
  
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
            rv_ipstring = /c=IN IP4 ([^\n]*)\n/.exec(local_sdp)[1].trim();

            //sdp_ipstring2 = /a=candidate([^\n]*)\n/.exec(local_sdp)[0]
            sdp_ipstring2 = /[^\n]*? ((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)) [^\n]*? typ srflx raddr [^\n]*\n/.exec(local_sdp)[0]
            rv_ipstring2 = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/.exec(sdp_ipstring2)[0];

            if (rv_debugGen) 
            if (rv_ipstring.trim() === '0.0.0.0') {

              rv_ipstring = rv_ipstring2;
            } else {

            }
            // NOTE: browser ind
            var deviceIdIp = x64hash128(`'rv_ip':${rv_ipstring}`);
            //var deviceIdIp = x64hash128(`'canvasData':${rv_ipstring2}'`)
            rv_browserInd.push(`'rv_ip':${rv_ipstring}`);
            rv_browserIdLog.push(`'rv_ip':${rv_ipstring}`);

            rv_browserIndStr = rv_browserInd.join("_");
            rv_browserIdLogStr = rv_browserIdLog.join("_");
            rv_finalDevId = x64hash128(rv_browserIndStr);


            //$("#browser_fingerprint").html(rv_browserIndStr);
            //document.getElementById("rv_demoDeepIDdevIdDebug").innerHTML = rv_browserIndStr;
            if (rv_debugGen) document.getElementById("rv_demoDeepIDdevId").innerHTML = rv_finalDevId;
            rv_browserIdStr = `'canvasData':${canvasData}|'webGLData':${webGLData}|'webGLVendor':${webGLVendor}|'webGLRenderer':${webGLRenderer}|'rv_browserIndStr':${rv_browserIndStr}`;
            rv_finalBrowserId = x64hash128(rv_browserIdStr);

  
            rv_browserIdStrV2part = rv_browserIdV2.join("_");
            rv_browserIdStrV2 = `'rv_browserIdStrV2part':${rv_browserIdStrV2part}|'rv_browserIdStr':${rv_browserIdStr}`;
            rv_finalBrowserIdV2 = x64hash128(rv_browserIdStrV2);
        
  

          }
        };
      } else {
        // Inform user that webrtc fetch failed

        rv_browserIndStr = rv_browserInd.join("_");
        rv_finalDevId = x64hash128(rv_browserIndStr);


        //$("#browser_fingerprint").html(rv_browserIndStr);
        //document.getElementById("rv_demoDeepIDdevIdDebug").innerHTML = rv_browserIndStr;
        if (rv_debugGen) document.getElementById("rv_demoDeepIDdevId").innerHTML = rv_finalDevId;
        rv_browserIdStr = `'canvasData':${canvasData}|'webGLData':${webGLData}|'webGLVendor':${webGLVendor}|'webGLRenderer':${webGLRenderer}|'rv_browserIndStr':${rv_browserIndStr}`;
        rv_finalBrowserId = x64hash128(rv_browserIdStr);

  
        rv_browserIdStrV2part = rv_browserIdV2.join("_");
        rv_browserIdStrV2 = `'rv_browserIdStrV2part':${rv_browserIdStrV2part}|'rv_browserIdStr':${rv_browserIdStr}`;
        rv_finalBrowserIdV2 = x64hash128(rv_browserIdStrV2);



      }
  
  
    })()
  };
  if (document.readyState !== 'loading') {
    rv_callbody();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      rv_callbody();
    });
  }