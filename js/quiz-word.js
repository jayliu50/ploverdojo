$(document).ready(function () {


// DECLARE GLOBAL VARIABLES

    /** This object will store the key codes of the keys that are currently being pressed down. Used an object to store the list since we will be removing items by value frequently. */
    var downKeys = {};

    /** This object will store the keys that are within a single chord. Used an object to store the list since we will be removing items by value frequently. */
    var chordKeys = {};

    /** This array will store all the chords. Used an array to store the list since we want the items ordered. */
    var chords = [];

    /** This array will store all the consolidated chords (multistroke words). Used an array to store the list since we want the items ordered. */
    var words = [];

    /** This array will store all the vertical notes. Used an array to store the list since we want the items ordered. */
    var verticalNotes = [];

    /** This boolean will determine if the current chord is valid steno. If the current chord contains a non-steno key, this becomes false. Used so the user can use hotkeys to select all (ctrl-a) and copy (ctrl-c). */
    var isSteno = true;

    /** This string will store the final translated string. */
    var translatedString = '';

    /** The item in the array to ask the user to input */
    var currentQuizIndex = -1;

    /** This is used to keep track of the response time */
    var stopwatch = new Stopwatch(null, 1); // usage: http://www.seph.dk/blog/projects/javascript-stopwatch-class/

    /** keeps track of how well the user is doing in each keystroke, with each keystroke as the key, and a list of response times in ms as the value */
    var responseLog = null;

    /** the past N responses that will be evaluated to see whether user is ready to move on (if the last N entries fit the criteria, the user moves on from current quiz) */
    var EVALUATED_RECORD_LENGTH = 2;

    /** the acceptable response time */
    var RESPONSE_TIME_STANDARD = 1500;

    /** as the learner goes through the word list, add these to the ones that they have mastered */
    var masteredList = {};

// IMPORT ASSETS

    /**
     * This object will store the mapping between binary numbers and steno flags with data imported from an external json file. There is a problem where chrome won't load local json files, so the files must be hosted for the data to be imported in chrome.
     * @see jQuery's <a href="http://api.jquery.com/jQuery.getJSON/">getJSON documentaion</a>.
     * @see MDN's <a href="https://developer.mozilla.org/en/JavaScript/Reference/Operators/Bitwise_Operators">documentation on bitwise operators</a>.
     * @see The <a href="http://code.google.com/p/chromium/issues/detail?id=40787">chrome bug report</a>.
     */
    var binaryToSteno = {};

    $.ajax({
        url: 'assets/binaryToSteno.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            binaryToSteno = data;
        }
    });

    var binaryToPseudoSteno = {};

    $.ajax({
        url: 'assets/binaryToPseudoSteno.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            binaryToPseudoSteno = data;
        }
    });

    /**
     * This object will store the mapping between rtf/cre formatted steno words and english words with data imported from an external json file. There is a problem where chrome won't load local json files, so the files must be hosted for the data to be imported in chrome.
     * @see jQuery's <a href="http://api.jquery.com/jQuery.getJSON/">getJSON documentaion</a>.
     * @see The <a href="http://code.google.com/p/chromium/issues/detail?id=40787">chrome bug report</a>.
     */
    var dictionary = {};

    $.ajax({
        url: 'assets/dict.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            dictionary = data;
        }
    });

    /**
     * This object will store the mapping between key codes and qwerty characters with data imported from an external json file. There is a problem where chrome won't load local json files, so the files must be hosted for the data to be imported in chrome.
     * @see jQuery's <a href="http://api.jquery.com/jQuery.getJSON/">getJSON documentaion</a>.
     * @see The <a href="http://code.google.com/p/chromium/issues/detail?id=40787">chrome bug report</a>.
     */
    var keyCodeToQwerty = {};

    $.ajax({
        url: 'assets/keyCodeToQwerty.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            keyCodeToQwerty = data;
        }
    });

    /**
     * This object will store the mapping betweeen key codes and steno characters with data imported from an external json file. There is a problem where chrome won't load local json files, so the files must be hosted for the data to be imported in chrome.
     * @see jQuery's <a href="http://api.jquery.com/jQuery.getJSON/">getJSON documentaion</a>.
     * @see The <a href="http://code.google.com/p/chromium/issues/detail?id=40787">chrome bug report</a>.
     */
    var keyCodeToSteno = {};

    $.ajax({
        url: 'assets/keyCodeToSteno.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            keyCodeToSteno = data;
        }
    });

    /**
     * This object will store the mapping between steno keys and steno numbers with data imported from an external json file. There is a problem where chrome won't load local json files, so the files must be hosted for the data to be imported in chrome.
     * @see jQuery's <a href="http://api.jquery.com/jQuery.getJSON/">getJSON documentaion</a>.
     * @see The <a href="http://code.google.com/p/chromium/issues/detail?id=40787">chrome bug report</a>.
     */
    var stenoKeyNumbers = {};

    $.ajax({
        url: 'assets/stenoKeyNumbers.json',
        async: false,
        dataType: 'json',
        success: function (data) {
            stenoKeyNumbers = data;
        }
    });


// GRAB COOKIES

    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
        var cookieName = cookies[i].split('=')[0].trim();
        var cookieValue = cookies[i].split('=')[1].trim();
        if (cookieName === 'quiz_config') {
            $.ajax({
                url: 'quiz/data' + cookies[i].substring(cookies[i].indexOf("=") + 1).trim(),
                async: false,
                dataType: 'json',
                success: function (data) {
                    testdata = data;
                }
            });
        }
        else if (cookieName === 'testdata') {
            try {
                testdata = JSON.parse(cookieValue);
            }
            catch (SyntaxError) {
                // angular js must have encoded it
                testdata = JSON.parse(decodeURIComponent(cookieValue));
            }
        }
    }

// CREATE GLOBAL FUNCTIONS

    /**
     * This function will take in a list of keys and color code the steno keyboard.
     * @param {Object} keys Pass in a list of Key objects.
     * @see jQuery's <a href="http://api.jquery.com/css/">css documentation</a>.
     * @see <a href="http://stenoknight.com/stengrid.png">Mirabai's color chart</a>.
     * @see Key class.
     */
    function colorCode(keys) {
        // Make a list of steno keys from the list of Key objects.
        var stenoKeys = {};
        for (var i in keys) {
            stenoKeys[keys[i].toSteno()] = true; // use the conversion function in the Key class to get a steno representation of the Key.
        }

        // Color code the letters that use only 1 steno key.

        // #
        if ('#' in stenoKeys) {
            $('#steno-key-number-bar').css('background-color', '#822259');
        }

        // *
        if ('*' in stenoKeys) {
            $('#steno-key-asterisk-1').css('background-color', '#822259');
            $('#steno-key-asterisk-2').css('background-color', '#822259');
        }

        // Initial S
        if ('S-' in stenoKeys) {
            $('#steno-key-s-1').css('background-color', '#00ff00');
            $('#steno-key-s-2').css('background-color', '#00ff00');
        }

        // Final S
        if ('-S' in stenoKeys) {
            $('#steno-key--s').css('background-color', '#00ff00');
        }

        // Initial T
        if ('T-' in stenoKeys) {
            $('#steno-key-t-').css('background-color', '#8000ff');
        }

        // Final T
        if ('-T' in stenoKeys) {
            $('#steno-key--t').css('background-color', '#8000ff');
        }

        // Initial P
        if ('P-' in stenoKeys) {
            $('#steno-key-p-').css('background-color', '#0080ff');
        }

        // Final P
        if ('-P' in stenoKeys) {
            $('#steno-key--p').css('background-color', '#0080ff');
        }

        // Initial R
        if ('R-' in stenoKeys) {
            $('#steno-key-r-').css('background-color', '#00ff80');
        }

        // Final R
        if ('-R' in stenoKeys) {
            $('#steno-key--r').css('background-color', '#00ff80');
        }

        // Final B
        if ('-B' in stenoKeys) {
            $('#steno-key--b').css('background-color', '#800000');
        }

        // Final D
        if ('-D' in stenoKeys) {
            $('#steno-key--d').css('background-color', '#808000');
        }

        // Final F
        if ('-F' in stenoKeys) {
            $('#steno-key--f').css('background-color', '#008000');
        }

        // Final G
        if ('-G' in stenoKeys) {
            $('#steno-key--g').css('background-color', '#008080');
        }

        // Initial K
        if ('K-' in stenoKeys) {
            $('#steno-key-k-').css('background-color', '#800080');
        }

        // Final L
        if ('-L' in stenoKeys) {
            $('#steno-key--l').css('background-color', '#80ffff');
        }

        // Final V
        if ('-F' in stenoKeys) {
            $('#steno-key--f').css('background-color', '#808080');
        }

        // Final Z
        if ('-Z' in stenoKeys) {
            $('#steno-key--z').css('background-color', '#ff0000');
        }

        // Initial A
        if ('A-' in stenoKeys) {
            $('#steno-key-a-').css('background-color', '#9df347');
        }

        // Final E
        if ('-E' in stenoKeys) {
            $('#steno-key--e').css('background-color', '#f0a637');
        }

        // Initial H
        if ('H-' in stenoKeys) {
            $('#steno-key-h-').css('background-color', '#c558d3');
        }

        // Initial O
        if ('O-' in stenoKeys) {
            $('#steno-key-o-').css('background-color', '#485771');
        }

        // Final U
        if ('-U' in stenoKeys) {
            $('#steno-key--u').css('background-color', '#bcf3ed');
        }

        // Initial W
        if ('W-' in stenoKeys) {
            $('#steno-key-w-').css('background-color', '#f26abf');
        }

        // Color code the letters that use 2 Steno Keys.

        // Initial B
        if ('P-' in stenoKeys && 'W-' in stenoKeys) {
            $('#steno-key-p-').css('background-color', '#800000');
            $('#steno-key-w-').css('background-color', '#800000');
        }

        // Initial D
        if ('T-' in stenoKeys && 'K-' in stenoKeys) {
            $('#steno-key-t-').css('background-color', '#808000');
            $('#steno-key-k-').css('background-color', '#808000');
        }

        // Initial F
        if ('T-' in stenoKeys && 'P-' in stenoKeys) {
            $('#steno-key-t-').css('background-color', '#008000');
            $('#steno-key-p-').css('background-color', '#008000');
        }

        // Final K
        if ('-B' in stenoKeys && '-G' in stenoKeys) {
            $('#steno-key--b').css('background-color', '#800080');
            $('#steno-key--b').css('background-color', '#800080');
        }

        // Initial L
        if ('H-' in stenoKeys && 'R-' in stenoKeys) {
            $('#steno-key-h-').css('background-color', '#80ffff');
            $('#steno-key-r-').css('background-color', '#80ffff');
        }

        // Initial M
        if ('P-' in stenoKeys && 'H-' in stenoKeys) {
            $('#steno-key-p-').css('background-color', '#804000');
            $('#steno-key-h-').css('background-color', '#804000');
        }

        // Final M
        if ('-P' in stenoKeys && '-L' in stenoKeys) {
            $('#steno-key--p').css('background-color', '#804000');
            $('#steno-key--l').css('background-color', '#804000');
        }

        // Final N
        if ('-P' in stenoKeys && '-B' in stenoKeys) {
            $('#steno-key--p').css('background-color', '#ff0080');
            $('#steno-key--b').css('background-color', '#ff0080');
        }

        // Initial V
        if ('S-' in stenoKeys && 'R-' in stenoKeys) {
            $('#steno-key-s-1').css('background-color', '#808080');
            $('#steno-key-s-2').css('background-color', '#808080');
            $('#steno-key-r-').css('background-color', '#808080');
        }

        // Initial X
        if ('K-' in stenoKeys && 'P-' in stenoKeys) {
            $('#steno-key-k-').css('background-color', '#ffff00');
            $('#steno-key-p-').css('background-color', '#ffff00');
        }

        // Initial C
        if ('K-' in stenoKeys && 'R-' in stenoKeys) {
            $('#steno-key-k-').css('background-color', '#af3630');
            $('#steno-key-r-').css('background-color', '#af3630');
        }

        // I
        if ('-E' in stenoKeys && '-U' in stenoKeys) {
            $('#steno-key--e').css('background-color', '#575a14');
            $('#steno-key--u').css('background-color', '#575a14');
        }

        // Initial Q
        if ('K-' in stenoKeys && 'W-' in stenoKeys) {
            $('#steno-key-k-').css('background-color', '#511151');
            $('#steno-key-w-').css('background-color', '#511151');
        }

        // Color code the letters that use 3 Steno Keys.

        // Initial N
        if ('T-' in stenoKeys && 'P-' in stenoKeys && 'H-' in stenoKeys) {
            $('#steno-key-t-').css('background-color', '#ff0080');
            $('#steno-key-p-').css('background-color', '#ff0080');
            $('#steno-key-h-').css('background-color', '#ff0080');
        }

        // Final X
        if ('-B' in stenoKeys && '-G' in stenoKeys && '-S' in stenoKeys) {
            $('#steno-key--b').css('background-color', '#ffff00');
            $('#steno-key--g').css('background-color', '#ffff00');
            $('#steno-key--s').css('background-color', '#ffff00');
        }

        // Initial Y
        if ('K-' in stenoKeys && 'W-' in stenoKeys && 'R-' in stenoKeys) {
            $('#steno-key-k-').css('background-color', '#732cad');
            $('#steno-key-w-').css('background-color', '#732cad');
            $('#steno-key-r-').css('background-color', '#732cad');
        }

        // Color code the letters that contain 4 Steno Keys.

        // Initial G
        if ('T-' in stenoKeys && 'K-' in stenoKeys && 'P-' in stenoKeys && 'W-' in stenoKeys) {
            $('#steno-key-t-').css('background-color', '#008080');
            $('#steno-key-k-').css('background-color', '#008080');
            $('#steno-key-p-').css('background-color', '#008080');
            $('#steno-key-w-').css('background-color', '#008080');
        }

        // Initial J
        if ('S-' in stenoKeys && 'K-' in stenoKeys && 'W-' in stenoKeys && 'R-' in stenoKeys) {
            $('#steno-key-s-1').css('background-color', '#000080');
            $('#steno-key-s-2').css('background-color', '#000080');
            $('#steno-key-k-').css('background-color', '#000080');
            $('#steno-key-w-').css('background-color', '#000080');
            $('#steno-key-r-').css('background-color', '#000080');
        }

        // Final J
        if ('-P' in stenoKeys && '-B' in stenoKeys && '-L' in stenoKeys && '-G' in stenoKeys) {
            $('#steno-key--p').css('background-color', '#000080');
            $('#steno-key--b').css('background-color', '#000080');
            $('#steno-key--l').css('background-color', '#000080');
            $('#steno-key--g').css('background-color', '#000080');
        }

        // Color code the letters that contain use 5 Steno Keys.

        // Final J
        if ('S-' in stenoKeys && 'T-' in stenoKeys && 'K-' in stenoKeys && 'P-' in stenoKeys && 'W-' in stenoKeys) {
            $('#steno-key-s-1').css('background-color', '#ff0000');
            $('#steno-key-s-2').css('background-color', '#ff0000');
            $('#steno-key-t-').css('background-color', '#ff0000');
            $('#steno-key-k-').css('background-color', '#ff0000');
            $('#steno-key-p-').css('background-color', '#ff0000');
            $('#steno-key-w-').css('background-color', '#ff0000');
        }
    }

    /**
     * This function takes in a string containing meta commands and converts them.
     * @param {string} translationString Pass in a string with meta commands.
     * @return {string} The string with all the meta commands translated.
     * @see MDN's <a href="https://developer.mozilla.org/en/JavaScript/Guide/Regular_Expressions">guide on regular expressions</a>.
     * @see Josh's <a href="http://launchpadlibrarian.net/81275523/plover_guide.pdf">plover guide</a>.
     */
    function demetafy(translationString) {
        // Sentence stops
        translationString = translationString.replace(/\s*{(\.|!|\?)}\s*(\w?)/g, function (matchString, punctuationMark, nextLetter) {
            return punctuationMark + ' ' + nextLetter.toUpperCase();
        });

        // Sentence breaks
        translationString = translationString.replace(/\s*{(,|:|;)}\s*/g, function (matchString, punctuationMark) {
            return punctuationMark + ' ';
        });

        // Simple suffixes (pure javascript translation from the Python code base)
        translationString = translationString.replace(/(\w*)\s*{(\^ed|\^ing|\^er|\^s)}/g, simpleSuffix);
        function simpleSuffix() {
            var matchString = arguments[0];
            var prevWord = arguments[1];
            var suffix = arguments[2];
            var returnString = '';

            var CONSONANTS = {'b': true, 'c': true, 'd': true, 'f': true, 'g': true, 'h': true, 'j': true, 'k': true, 'l': true, 'm': true, 'n': true, 'p': true, 'q': true, 'r': true, 's': true, 't': true, 'v': true, 'w': true, 'x': true, 'z': true, 'B': true, 'C': true, 'D': true, 'F': true, 'G': true, 'H': true, 'J': true, 'K': true, 'L': true, 'M': true, 'N': true, 'P': true, 'Q': true, 'R': true, 'S': true, 'T': true, 'V': true, 'W': true, 'X': true, 'Z': true};
            var VOWELS = {'a': true, 'e': true, 'i': true, 'o': true, 'u': true, 'A': true, 'E': true, 'I': true, 'O': true, 'U': true};
            var W = {'w': true, 'W': true};
            var Y = {'y': true, 'Y': true};
            var PLURAL_SPECIAL = {'s': true, 'x': true, 'z': true, 'S': true, 'X': true, 'Z': true};
            prepForSimpleSuffix = function (wordParam) {
                var numChars = wordParam.length;
                if (numChars < 2) {
                    return wordParam;
                }
                if (numChars >= 3) {
                    thirdToLast = wordParam.slice(-3, -2);
                } else {
                    thirdToLast = '';
                }
                secondToLast = wordParam.slice(-2, -1);
                last = wordParam.slice(-1);
                if (secondToLast in VOWELS || secondToLast in CONSONANTS) {
                    if (last in VOWELS) {
                        if (thirdToLast && (thirdToLast in VOWELS || thirdToLast in CONSONANTS)) {
                            return wordParam.slice(0, -1);
                        }
                    } else if (last in CONSONANTS && !(last in W) && secondToLast in VOWELS && thirdToLast && !(thirdToLast in VOWELS)) {
                        return wordParam + last;
                    } else if (last in Y && secondToLast in CONSONANTS) {
                        return wordParam.slice(0, -1) + 'i';
                    }
                }
                return wordParam;
            }

            if (suffix === '^s') {
                if (prevWord.length < 2) {
                    return prevWord + 's';
                }
                var a = prevWord.slice(-2, -1);
                var b = prevWord.slice(-1);

                if (b in PLURAL_SPECIAL) {
                    return prevWord + 'es';
                } else if (b in Y && a in CONSONANTS) {
                    return prevWord.slice(0, -1) + 'ies';
                }
                return prevWord + 's';
            }
            if (suffix === '^ed') {
                return prepForSimpleSuffix(prevWord) + 'ed';
            }
            if (suffix === '^er') {
                return prepForSimpleSuffix(prevWord) + 'er';
            }
            if (suffix === '^ing') {
                if (prevWord && prevWord.slice(-1) in Y) {
                    return prevWord + 'ing';
                }
                return prepForSimpleSuffix(prevWord) + 'ing';
            }
        }

        // Capitalize
        translationString = translationString.replace(/\s*{-\|}\s*(\w?)/g, function (matchString, nextLetter) {
            return nextLetter.toUpperCase();
        });

        // Glue flag
        translationString = translationString.replace(/(\s*{&[^}]+}\s*)+/g, glue);
        function glue() {
            var testString = '';
            for (i = 0; i < arguments.length; i++) {
                testString += arguments[i] + ', ';
            }
            var matchString = arguments[0];
            matchString = matchString.replace(/\s*{&([^}]+)}\s*/g, function (a, p1) {
                return p1;
            });
            return ' ' + matchString + ' ';
        }

        // Attach flag
        translationString = translationString.replace(/\s*{\^([^}]+)\^}\s*/g, function (matchString, attachString) {
            return attachString;
        });
        translationString = translationString.replace(/\s*{\^([^}]+)}(\s*)/g, function (matchString, attachString, whitespace) {
            return attachString + whitespace;
        });
        translationString = translationString.replace(/(\s*){([^}]+)\^}\s*/g, function (matchString, whitespace, attachString) {
            return whitespace + attachString;
        });

        // Key Combinations
        translationString = translationString.replace(/\s*{#Return}\s*/g, '\n');
        translationString = translationString.replace(/\s*{#Tab}\s*/g, '\t');

        return translationString;
    }

    /**
     * This function resets the keys to how they were before any user interaction.
     */
    function resetKeys() {
        // Clear the list of keys currently being pressed down.
        for (var key in downKeys) {
            delete downKeys[key];
        }

        // Clear the list of keys in the current chord.
        for (var key in chordKeys) {
            delete chordKeys[key];
        }

        // Assume the next stroke is valid steno.
        isSteno = true;

        // Clear keyboard colors
        $('.standard-key').css('background-color', '#FFFFFF');
        $('.steno-key').css('background-color', '#FFFFFF');

        // Clear user input
        $('#user-response').hide();

    }

    /**
     * This function resets the keys and global variables to how they were before any user interaction.
     */
    function resetAll() {
        resetKeys();

        chords.length = 0;
        words.length = 0;
        verticalNotes.length = 0;

        translatedString = '';
    }

    /**
     * This function trims a string of leading and trailing whitespace.
     * @return {String} The string stripped of whitespace from both ends.
     * @see MDN's <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim">trim documentation</a>.
     */
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    /**
     * This function will zero-fill a number.
     * @param {integer} number The number to be zero-filled.
     * @param {integer} width The width of the zero-filled number.
     * @return {string} A string of a zero-filled number.
     * @see The <a href="http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript">question on Stack Overflow</a>.
     */
    function zeroFill(number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
        }
        return number;
    }

    function timer(time, update, complete) {
        var start = new Date().getTime();
        var interval = setInterval(function () {
            var now = time - (new Date().getTime() - start);
            if (now <= 0) {
                clearInterval(interval);
                complete();
            }
            else update(Math.floor(now / 1000));
        }, 100); // the smaller this number, the more accurate the timer will be
    }

    function getReadyDialog(message) {

        $('#countdown-dialog-modal').dialog({
            height: 140,
            modal: true,
            resizable: false,
            closeOnEscape: false,
            open: function (event, ui) {
                $('.ui-dialog-titlebar-close').hide();
            }
        });

        timer(
            3000,
            function (timeLeft) {
                $('#countdown').html(timeLeft + 1);
            },
            function () {
                $("#countdown-dialog-modal").dialog('destroy');

                // commence with the initialization of the rest of it
                stopwatch.start();
                nextQuizQuestion();

                // lay out the words
                var innerHtml = '';
                for (item in testdata) {
                    innerHtml += '<li class="target-word-' + testdata[item][0] + '" title="' + testdata[item][1] + '">' + testdata[item][0] + '</li> '; // don't forget the space
                }

                $('#progress').html(innerHtml);

                // center

                $('#quiz-prompt').css("left", Math.max(0, (($(window).width() - $('#quiz-prompt').outerWidth()) / 2) +
                    $(window).scrollLeft()) + "px").css('display', 'block');
            }
        );

    }


    function nextQuizQuestion() {

        // if there are only two questions to choose from, be random but turn off uniqueness
        if (testdata.length === 2 || testdata.length === Object.keys(masteredList).length + 2) {
            do {
                currentQuizIndex = Math.floor(Math.random() * testdata.length);
            } while (masteredList.hasOwnProperty(testdata[currentQuizIndex][0]));
        }

        // be random without repeating if there are more than three left
        else if (testdata.length > 2 && testdata.length > Object.keys(masteredList).length + 1) {
            var candidateIndex = 0;
            do {
                candidateIndex = Math.floor(Math.random() * testdata.length);
            } while (candidateIndex === currentQuizIndex || masteredList.hasOwnProperty(testdata[candidateIndex][0]));
            currentQuizIndex = candidateIndex;
        }

        // well, it's going to be a very boring quiz
        else if (testdata.length === 1) {
            currentQuizIndex = 0;
        }

        // just repeat the one they haven't mastered. not sure what else to do
        else if (testdata.length === Object.keys(masteredList).length + 1) {
            // find the one they haven't mastered
            for (var i in testdata) {
                if (!masteredList.hasOwnProperty(testdata[i][0])) {
                    currentQuizIndex = i;
                    break;
                }
            }
        }

        var newQuestion = testdata[currentQuizIndex][0];  // random question, has to be a different one than the one before


        console.log("newQuestion is " + newQuestion);
        //$('#quiz-prompt-text').html(quizChord.toHTMLTable());

        quizChord = new Chord();

        var stroke = testdata[currentQuizIndex][1];
        if (stroke) {
            quizChord.fromRTFCRE(stroke);
            $('#quiz-prompt-text').html(newQuestion);
        }
    }

    function match(conversion) {

        var correct = false;
        var key = null;
        var record = null;
        if (responseLog === null) {
            responseLog = {};
        }
        var bChord = null;

        bChord = chords[chords.length - 1];

        key = testdata[currentQuizIndex][0];

        if (!responseLog.hasOwnProperty(key)) {
            responseLog[key] = [];
        }

        record = responseLog[key];

        correct = dictionary[bChord.toRTFCRE()] === key; // not sure what to use here


        if (correct) {
            var encouragement = '';

            stopwatch.stop();
            var time = stopwatch.getElapsedInMs();

            record.push(time);
            if (record.length > EVALUATED_RECORD_LENGTH) record.shift();

            if (testdata.length === Object.keys(masteredList).length + 1) {
                encouragement = 'FINISH HIM!!!';
            }
            else if (time > RESPONSE_TIME_STANDARD) {
                encouragement = 'Correct! You are getting it';
            }
            else {

                switch (record.length) {
                    case EVALUATED_RECORD_LENGTH:
                        encouragement = 'You have it down. Keep it up!';
                        break;
                    case EVALUATED_RECORD_LENGTH - 1:
                        encouragement = 'Good job';
                        break;
                }

            }


            $('#user-response-input-text').css('display', 'none');
            $('#feedback-text').html(encouragement);
            $('#feedback-text').attr('class', 'correct');

            if (!readyToMoveOn()) {
                resetAll();
                stopwatch.reset();
                stopwatch.start();
                nextQuizQuestion();
            }
            else {
                advanceQuiz();
            }
        }
        else {
            // extend the number of correct responses needed
            // makes it tough!
            // record = quizChord.toBinary();
            // if (record.length > 1) record.pop();
            $('#user-response-input-text').html(bChord.toRTFCRE()).css('display', 'block');
            $('#quiz-prompt-text').html(key + ' <aside>' + testdata[currentQuizIndex][1] + '</aside>');

            $('#feedback-text').html('Sorry, try again');
            $('#feedback-text').attr('class', 'incorrect');
        }
    }


    function advanceQuiz() {
        var link;
        var data = {};
        var updateMastery = [];

        for (var r in responseLog) {
            updateMastery.push(r);
        }

        data.update_mastery = JSON.stringify(Object.keys(masteredList));

        link = '/main';


        $.ajax({
            type: "POST",
            url: '/disciple/profile/mastery',
            data: data,
            success: function () {
                window.location.href = link;
            }
        });

        $('#finished-dialog-modal').dialog({
            height: 140,
            modal: true,
            resizable: false,
            closeOnEscape: true,
            open: function (event, ui) {
            },
            close: function () {
                link = "/main";
                window.location.href = link;
            }
        });

    }

// todo: remove this in production
    $('#debug-advance-quiz').click(advanceQuiz);

    function readyToMoveOn() {
        // is ready if the past N tries in responding to each key was done in T milliseconds or less
        for (var key in responseLog) {
            // haven't proven yourself
            if (responseLog.length === testdata.length && responseLog[key] === null && responseLog[key].length < EVALUATED_RECORD_LENGTH) {
                return false;
            }

            // if you have enough records, then make sure that they are all within the milliseconds
            var wordReady = true;
            for (var r in responseLog[key]) {
                wordReady &= responseLog[key][r] < RESPONSE_TIME_STANDARD;
                if (!wordReady) break;
            }

            if (wordReady) {
                $('#progress .target-word-' + key).removeClass('tried').addClass('mastered');
                masteredList[key] = true;
            }
            else {
                if (!masteredList[key]) {
                    $('#progress .target-word-' + key).addClass('tried');
                }
            }
        }

        return Object.keys(masteredList).length >= testdata.length;
    }

    function showUserInput() {
        // show words
        var userInputHTML = "";
        for (var i = 0; i < words.length; i++) {
            userInputHTML += words[i].toHTMLTable();
        }
        $('#uiWords').html(userInputHTML);

        // show chords
        userInputHTML = "";
        for (var key in chordKeys) {
            userInputHTML += chordKeys[key].toHTMLTable();
        }
        $('#uiKeys').html(userInputHTML);

        // show keys
        userInputHTML = "";
        for (var i in chords) {
            userInputHTML += chords[i].toHTMLTable();
        }
        $('#uiChords').html(userInputHTML);

        // scroll to reveal latest
        document.getElementById('uiWords').scrollLeft = document.getElementById('uiWords').scrollWidth;
        document.getElementById('uiChords').scrollLeft = document.getElementById('uiChords').scrollWidth;
        document.getElementById('uiKeys').scrollLeft = document.getElementById('uiKeys').scrollWidth;
    }


// launch! 
    getReadyDialog();

// CREATE 'CLASSES'

    /**
     * Creates a new Key.
     * @class Represents a key.
     * @param {number} keyCodeParam The key code of the key.
     */
    function Key(keyCodeParam) {
        /** @private */
        var keyCode = keyCodeParam;

        /**
         * Custom toString function to create unique identifier.
         * @return {string}
         */
        this.toString = function () {
            return keyCode;
        };

        /**
         * Accessor that gets the key code.
         * @return {integer} The key code.
         */
        this.getKeyCode = function () {
            return keyCode;
        };

        /**
         * Mutator that sets the key code.
         * @param {integer} newKeyCode A new key code.
         */
        this.setKeyCode = function (newKeyCode) {
            keyCode = newKeyCode;
        };

        /**
         * Converts the key code to the qwerty character.
         * @return {string} The qwerty character.
         */
        this.toQwerty = function () {
            return keyCodeToQwerty[keyCode];
        };

        /**
         * Converts the key code from a new qwerty character.
         * @return {string} A new qwerty character.
         */
        this.fromQwerty = function (newQwerty) {
            for (i in keyCodeToQwerty) { // go through each key code in the imported key code to qwerty mapping
                if (keyCodeToQwerty[i] === newQwerty) { // if the qwerty mapping associated with the current key code is strictly equal to the new qwerty mapping
                    keyCode = i; // set the private keyCode property to the current key code
                    break; // and stop looping
                }
            }
        };

        /**
         * Converts the key code to the steno character.
         * @return {string} The steno character.
         */
        this.toSteno = function () {
            return keyCodeToSteno[keyCode];
        };

        /**
         * Converts the key code from a new steno character.
         * @return {string} A new steno character.
         */
        this.fromSteno = function (newSteno) {
            for (i in keyCodeToSteno) { // go through each key code in the imported key code to steno mapping
                if (keyCodeToSteno[i] === newSteno) { // if the steno mapping associated with the current key code is strictly equal to the new steno mapping
                    keyCode = i; // set the private keyCode property to the current key code
                    break; // and stop looping
                }
            }
        };

        this.toHTMLTable = function () {
            var htmlTable = "<table class='tablekey'><thead>{{header}}</thead><tbody>{{keycodeRow}}{{qwertyRow}}{{stenoRow}}</tbody></table>";
            htmlTable = htmlTable.replace("{{header}}", "<tr><th colspan=2>key</th></tr>");
            htmlTable = htmlTable.replace("{{keycodeRow}}", "<tr><th>keycode</th><td>" + keyCode + "</td></tr>");
            htmlTable = htmlTable.replace("{{qwertyRow}}", "<tr><th>qwerty</th><td>" + this.toQwerty() + "</td></tr>");
            htmlTable = htmlTable.replace("{{stenoRow}}", "<tr><th>steno</th><td>" + this.toSteno() + "</td></tr>");
            return htmlTable;
        };
    }

    /**
     * Creates a new Chord.
     * @class Represents a steno chord.
     * @param {Object} A list of Keys.
     */
    function Chord(keysParam) {
        /** @private */
        var keys = keysParam;

        /**
         * Custom toString function to create unique identifier.
         * @return {string}
         */
        this.toString = function () {
            var returnString = 'A Stroke with the steno keys ';
            for (key in keys) {
                returnString += keys[key].toSteno() + ', '
            }
            returnString = returnString.slice(0, -2) + '.';
            return returnString;
        };

        /**
         * Accessor that gets the list of Keys.
         * @return The list of Keys.
         */
        this.getKeys = function () {
            return keys;
        };

        /**
         * Mutator that sets the list of Keys.
         * @param newKeys A new list of Keys.
         */
        this.setKeys = function (newKeys) {
            keys = newKeys;
        };

        /**
         * This is a function that will take in a string and see if that string is in the key code, qwerty characters, or steno characters.
         * @param {string} keyParam
         */
        this.contains = function (keyParam) {
            for (var key in keys) {
                if (keys[key].getKeyCode() === keyParam || keys[key].toQwerty() === keyParam || keys[key].toSteno() === keyParam) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Converts the list of Keys to binary.
         * @return {number} The binary representation of the stroke.
         */
        this.toBinary = function () {
            var flags = parseInt('00000000000000000000000000000000', 2);
            for (var i = parseInt('00000000000000000000001', 2); i <= parseInt('10000000000000000000000', 2); i <<= 1) {
                if (this.contains(binaryToSteno[i])) {
                    flags |= i;
                }
            }
            return flags;
        }

        /**
         * Converts the list of Keys from binary.
         * @param newBinary A new binary representation for the list of Keys.
         */
        this.fromBinary = function (newBinary) {
            newKeys = {};
            for (var i = parseInt('00000000000000000000001', 2); i <= parseInt('10000000000000000000000', 2); i <<= 1) {
                if (i & newBinary) {
                    newkey = new Key();
                    newkey.fromSteno(binaryToSteno[i]);
                    newKeys[newkey] = newkey;
                }
            }

            keys = jQuery.extend({}, newKeys);
        }

        /**
         * Converts the list of Keys to RTF/CRE format.
         * @return {string} The RTF/CRE representation of the stroke.
         */
        this.toRTFCRE = function () {
            var rtfcre = '';
            for (var i = parseInt('00000000000000000000001', 2); i <= parseInt('10000000000000000000000', 2); i <<= 1) {
                if (this.contains(binaryToSteno[i]) && binaryToSteno[i] != '#') {
                    if (this.contains('#') && stenoKeyNumbers[binaryToSteno[i]]) {
                        rtfcre += stenoKeyNumbers[binaryToSteno[i]];
                    } else {
                        rtfcre += binaryToSteno[i];
                    }
                }
            }
            if (this.contains('A-') || this.contains('O-') || this.contains('-E') || this.contains('-U') || this.contains('*')) {
                return rtfcre.replace(/-/g, '');
            }
            if (rtfcre[0] === '-') {
                return '-' + rtfcre.replace('--', '.').replace(/-/g, '').replace('.', '-');
            } else {
                return rtfcre.replace('--', '.').replace(/-/g, '').replace('.', '-');
            }
        }

        /**
         * Converts the list of Keys from RTF/CRE format.
         * @param newRTFCRE A new RTFCRE representation for the list of Keys.
         */
        this.fromRTFCRE = function (rtfcre) {
            var newKeys = {};

            for (var i = parseInt('00000000000000000000001', 2); i <= parseInt('10000000000000000000000', 2); i <<= 1) {
                if (this.contains(binaryToSteno[i]) && binaryToSteno[i] != '#') {
                    if (this.contains('#') && stenoKeyNumbers[binaryToSteno[i]]) {
                        rtfcre += stenoKeyNumbers[binaryToSteno[i]];
                    } else {
                        rtfcre += binaryToSteno[i];
                    }
                }
            }
            if (this.contains('A-') || this.contains('O-') || this.contains('-E') || this.contains('-U') || this.contains('*')) {
                return rtfcre.replace(/-/g, '');
            }
            if (rtfcre[0] === '-') {
                return '-' + rtfcre.replace('--', '.').replace(/-/g, '').replace('.', '-');
            } else {
                return rtfcre.replace('--', '.').replace(/-/g, '').replace('.', '-');
            }
        }


        /**
         * Converts the list of Keys to a list of key codes.
         * @return The list of key codes.
         */
        this.toKeyCodes = function () {
            var keyCodes = {};
            for (var i in keys) {
                keyCodes[keys[i].getKeyCode()] = true;
            }
            return keyCodes;
        }

        /**
         * Converts the list of Keys from a list of key codes.
         * @param newKeyCodes A list of key codes.
         */
        this.fromKeyCodes = function (newKeyCodes) {
            var newKeys = {};
            for (var keyCode in newKeyCodes) {
                newKey = new Key();
                newKey.fromKeyCode(keyCode);
                newKeys[newKey] = newKey;
            }

            keys = jQuery.extend({}, newKeys);
        }

        /**
         * Converts the list of Keys to a list of qwerty characters.
         * @return The list of qwerty characters.
         */
        this.toQwertyKeys = function () {
            var qwertyKeys = {};
            for (var i in keys) {
                qwertyKeys[keys[i].toQwerty()] = true;
            }
            return qwertyKeys;
        }

        /**
         * Converts the list of Keys from a list of qwerty keys.
         * @param newQwertyKeys A list of qwerty keys.
         */
        this.fromQwertyKeys = function (newQwertyKeys) {
            var newKeys = {};
            for (var key in newQwertyKeys) {
                newKey = new Key();
                newKey.fromQwerty(key);
                newKeys[newKey] = newKey;
            }

            keys = jQuery.extend({}, newKeys);
        }

        /**
         * Converts the list of Keys to a list of steno characters.
         * @return The list of steno characters.
         */
        this.toStenoKeys = function () {
            var stenoKeys = {};
            for (var i in keys) {
                stenoKeys[keys[i].toSteno()] = true;
            }
            return stenoKeys;
        }

        /**
         * Converts the list of Keys from a list of steno keys.
         * @param newStenoKeys A list of steno keys.
         */
        this.fromStenoKeys = function (newStenoKeys) {
            var newKeys = {};
            for (var key in newStenoKeys) {
                newKey = new Key();
                newKey.fromSteno(key);
                newKeys[newKey] = newKey;
            }

            keys = jQuery.extend({}, newKeys);
        }

        /**
         * Converts from binary to pseudo steno, if applicable.
         * Note: Not to be used for word output (since that would depend on the dictionary being used.
         * @returns the pseudo steno letter
         */
        this.toPseudoSteno = function (binary) {
            var result = binaryToPseudoSteno[binary];
            return result;
        }

        /**
         * Adds a key to the stroke.
         */
        this.addKey = function (key) {
            keys[key] = key;
        }

        /**
         * Removes a key from the stroke.
         */
        this.removeKey = function (key) {
            if (key in keys) {
                delete keys[key];
            }
        }

        this.toHTMLTable = function () {
            var binary = this.toBinary();
            var htmlTable = "<table class='tablechord'><thead>{{header}}</thead><tbody>{{binaryRow}}{{rtfcreRow}}{{pseudostenoRow}}{{keycodesRow}}{{qwertysRow}}{{stenosRow}}</tbody></table>";
            htmlTable = htmlTable.replace("{{header}}", "<tr><th colspan=2>chord</th></tr>");
            htmlTable = htmlTable.replace("{{binaryRow}}", "<tr><th>binary</th><td>" + binary + "</td></tr>");
            htmlTable = htmlTable.replace("{{rtfcreRow}}", "<tr><th>rtfcre</th><td>" + this.toRTFCRE() + "</td></tr>");
            htmlTable = htmlTable.replace("{{pseudostenoRow}}", "<tr><th>pseudo steno</th><td>" + this.toPseudoSteno(binary) + "</td></tr>");
            htmlTable = htmlTable.replace("{{keycodesRow}}", "<tr><th>keycodes</th><td>" + JSON.stringify(this.toKeyCodes()) + "</td></tr>");
            htmlTable = htmlTable.replace("{{qwertysRow}}", "<tr><th>qwerty keys</th><td>" + JSON.stringify(this.toQwertyKeys()) + "</td></tr>");
            htmlTable = htmlTable.replace("{{stenosRow}}", "<tr><th>steno keys</th><td>" + JSON.stringify(this.toStenoKeys()) + "</td></tr>");
            return htmlTable;
        };
    }

    /**
     * Creates a new Word.
     * @class Represents a word.
     */
    function Word(strokesParam) {
        /** @private */
        var strokes = strokesParam;

        var string = '';
        if (strokes.length > 0) {
            for (var i = 0; i < strokes.length; i++) {
                string += strokes[i].toRTFCRE() + '/';
            }
            string = string.slice(0, -1);
        }

        /**
         * Custom toString function to create unique identifier.
         * @return {string}
         */
        this.toString = function () {
            return string;
        }

        /**
         * Accessor that gets the list of strokes.
         * @return The list of strokes.
         */
        this.getStrokes = function () {
            return strokes;
        }

        /**
         * Mutator that sets the list of strokes.
         * @param {Object} newStrokes A list of strokes.
         * @return The list of strokes.
         */
        this.setStrokes = function (newStrokes) {
            strokes = newStrokes;
        }

        /**
         * Adds a stroke to the word.
         * @param {Object} strokeParam A stroke object.
         */
        this.addStroke = function (strokeParam) {
            strokes.push(strokeParam);
            string += '/' + strokeParam.toRTFCRE();
        }

        /**
         * Removes a stroke from the word.
         */
        this.removeStroke = function () {
            //console.log(strokes.length);
            strokes.pop();
            //console.log(strokes.length);
            var stringArray = string.split('/');
            string = '';
            if (strokes.length > 0) {
                for (var i = 0; i < stringArray.length - 1; i++) {
                    string += stringArray[i] + '/';
                }
                string = string.slice(0, -1);
            }
        }

        /**
         * Converts the strokes to English.
         * @return {string} The English translation.
         */
        this.toEnglish = function () {
            if (dictionary[string]) { // if there exists a translation
                return dictionary[string];
            } else { // else, return the RTF/CRE formatted strokes.
                return string;
            }
        }

        this.toHTMLTable = function () {
            var htmlTable = "<table class='tableword'><thead>{{header}}</thead><tbody>{{stringRow}}{{englishRow}}</tbody></table>";
            htmlTable = htmlTable.replace("{{header}}", "<tr><th colspan=2>word</th></tr>");
            htmlTable = htmlTable.replace("{{stringRow}}", "<tr><th>string</th><td>" + this.toString() + "</td></tr>");
            htmlTable = htmlTable.replace("{{englishRow}}", "<tr><th>english</th><td>" + this.toEnglish() + "</td></tr>");
            return htmlTable;
        };
    }

    /**
     * Creates a new VerticalNote.
     * @class Represents a vertical note.
     * @param {Object} timestampParam A Date object.
     * @param {Object} strokeParam A Chord object.
     */
    function VerticalNote(timestampParam, strokeParam) {
        /** @private */
        var timestamp = timestampParam;

        /** @private */
        var stroke = strokeParam;

        var string = zeroFill(timestamp.getHours(), 2) + ':' + zeroFill(timestamp.getMinutes(), 2) + ':' + zeroFill(timestamp.getSeconds(), 2) + '.' + zeroFill(timestamp.getMilliseconds(), 3) + ' ';
        for (var i = parseInt('00000000000000000000001', 2); i <= parseInt('10000000000000000000000', 2); i <<= 1) {
            if (stroke.toBinary() & i) {
                string += binaryToSteno[i].replace(/-/g, '');
            } else {
                string += ' ';
            }
        }
        string = string.trim();
        string += '\n';

        /**
         * Custom toString function to create unique identifier.
         * @return {string}
         */
        this.toString = function () {
            return string;
        }

        /**
         * Accessor that gets the timestamp.
         * @return The timestamp.
         */
        this.getTimestamp = function () {
            return timestamp;
        }

        /**
         * Accessor that gets the chord.
         * @return The chord.
         */
        this.getStroke = function () {
            return stroke;
        }

        /**
         * Mutator that sets the timestamp.
         * @param {Object} newTimestamp A new Date object.
         */
        this.setTimestamp = function (newTimestamp) {
            timestamp = newTimestamp;
        }

        /**
         * Mutator that sets the chord.
         * @param {Object} newStroke A new Chord object.
         */
        this.setStroke = function (newStroke) {
            stroke = newStroke;
        }
    }


// EVENT HANDLERS

    /**
     * This will handle the key down event.
     * @event
     * @see keydown method: http://api.jquery.com/keydown/
     * @see event.preventDefault method: http://api.jquery.com/event.preventDefault/
     * @see event.stopPropagation method: http://api.jquery.com/event.stopPropagation/
     * @see jQuery.isEmptyObjecy method: http://api.jquery.com/jQuery.isEmptyObject/
     */
    $(document).keydown(function (event) {
        // Check to see if this is the start of a new stroke.
        if ($.isEmptyObject(downKeys)) { // if no keys were being pressed down before, this is the start of a new stroke.
            resetKeys(); // so clear the keys before processing the event.
        }

        // Create a new Key Object based on the event.
        var key = new Key(event.which);

        // Update the appropriate lists
        downKeys[key] = key; // add key to the list of keys currently being pressed down
        chordKeys[key] = key; // add key to the list of keys in this stroke

        // Update the display
        $('.code-' + key.getKeyCode()).css('background-color', '#ff0000'); // color the qwerty keyboard
        colorCode(chordKeys); // color the steno keyboard

        // See if this key is a valid steno key
        if (!keyCodeToSteno[key.getKeyCode()]) { // if the key code does not have a steno tranlation
            isSteno = false;
        }

        //showUserInput();

        if (isSteno) {
            // Handle potential conflicts
            event.preventDefault(); // will prevent potential conflicts with browser hotkeys like firefox's hotkey for quicklinks (')
            //event.stopPropagation();
        }
    });

    /**
     * This will handle the key up event.
     * @event
     * @see keydown method: http://api.jquery.com/keyup/
     * @see event.preventDefault method: http://api.jquery.com/event.preventDefault/
     * @see event.stopPropagation method: http://api.jquery.com/event.stopPropagation/
     * @see jQuery.isEmptyObjecy method: http://api.jquery.com/jQuery.isEmptyObject/
     */
    $(document).keyup(function (event) {
        // Create a new Key Object based on the event.
        var key = new Key(event.which);

        // Update the appropriate lists
        delete downKeys[key]; // remove key from the list of keys currently being pressed down

        // Update the display
        $('.standard-key.code-' + event.which).css('background-color', '#FFFFFF'); // color the qwerty keyboard

        if (isSteno) {
            // Check to see if this is the end of the stroke.
            if ($.isEmptyObject(downKeys)) { // if no more keys are being pressed down, this is the end of the stroke.
                var timestamp = new Date();
                var cloneObj = jQuery.extend({}, chordKeys); // need to clone so future changes to chordKeys won't affect chord
                var chord = new Chord(cloneObj);
                var verticalNote = new VerticalNote(timestamp, chord);
                var word = new Word([chord]);

                chords.push(chord);
                verticalNotes.push(verticalNote);

                //$('#verticalNotes').append(verticalNote.toString());
                //document.getElementById('verticalNotes').scrollTop = document.getElementById('verticalNotes').scrollHeight; // scroll the textarea to the bottom

                if (words.length > 0 && chord.toRTFCRE() !== '*' && dictionary[words[words.length - 1].toString() + '/' + chord.toRTFCRE()]) {
                    words[words.length - 1].addStroke(chord);
                } else if (words.length > 0 && chord.toRTFCRE() === '*') {
                    words[words.length - 1].removeStroke();
                    if (words[words.length - 1].toString() === '') {
                        words.pop();
                    }
                } else {
                    words.push(word);
                }

                translatedString = '';
                for (i = 0; i < words.length; i++) {
                    translatedString += words[i].toEnglish() + ' ';
                }

                $('#user-response-output-text').html(word.toEnglish());

                //$('#output').html(demetafy(translatedString));
                //document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight; //scroll the textarea to the bottom

                //showUserInput();
                console.log("keyup event fired!");
                match("chord-binary");

            }


            // Handle potential conflicts
            event.preventDefault(); // will prevent potential conflicts with browser hotkeys like firefox's hotkey for quicklinks (')
            //event.stopPropagation();

            $('#user-response').show();
            delay(function () {
                $('#user-response').fadeOut();
            }, 5000);

        }
    });

    var delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    /**
     * This will handle the event when the window loses focus.
     * @event
     * @see jQuery's <a href="http://api.jquery.com/blur/">blur method</a>
     */
    $(window).blur(function () {
        resetKeys();
    });

    /**
     * This will handle the event when the window gains focus.
     * @event
     * @see jQuery's <a href="http://api.jquery.com/focus/">focus method</a>
     */
    $(window).focus(function () {
        resetKeys();
    });


})
;