/** 
 * @license Pass*Field v1.1.0 | (c) 2013 Antelle | https://github.com/antelle/passfield/blob/master/MIT-LICENSE.txt
 */

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Entry point
 * Initializes PassField
 * If jQuery is present, sets jQuery plugin ($.passField)
 */
(function($, document, window, undefined) {
    "use strict";

    // ========================== definitions ==========================

    var PassField = window.PassField = {};
    PassField.Config = {};

    PassField.CharTypes = {
        DIGIT: "digits",
        LETTER: "letters",
        LETTER_UP: "letters_up",
        SYMBOL: "symbols",
        UNKNOWN: "unknown"
    };

    /**
     * Password checking mode
     * @readonly
     * @enum {number}
     */
    PassField.CheckModes = {
        /** more user friendly: if a password is better than the pattern (e.g. longer), its strength is increased and it could match even not containing all char types */
        MODERATE: 0,
        /** more strict: it a password is longer than expected length, this makes no difference; all rules must be satisfied */
        STRICT: 1
    }

    // ========================== defaults ==========================

    PassField.Config = {
        defaults: {
            pattern: "abcdef1", // pattern for password (for strength calculation)
            acceptRate: 0.8, // threshold (of strength conformity with pattern) under which the password is considered weak
            allowEmpty: true, // allow empty password (will show validation errors if not)
            isMasked: true, // is the password masked by default 
            showToggle: true, // show toggle password masking button
            showGenerate: true, // show generation button
            showWarn: true, // show short password validation warning
            showTip: true, // show password validation tooltips
            strengthCheckTimeout: 500, // timeout before automatic strength checking if no key is pressed (in ms; 0 = disable this feature)
            validationCallback: null, // function which will be called when password strength is validated
            blackList: [], // well-known bad passwords (very weak), e.g. qwerty or 12345
            locale: "", // selected locale (null to auto-detect)
            localeMsg: {}, // overriden locale messages
            warnMsgClassName: "help-inline", // class name added to the waring control (empty or null to disable the feature)
            errorWrapClassName: "error", // class name added to wrapping control when validation fails (empty or null to disable the feature)
            allowAnyChars: true, // suppress validation errors if password contains characters not from list (chars param)
            checkMode: PassField.CheckModes.MODERATE, // password checking mode (how the strength is calculated)
            chars: {
                // symbol sequences for generation and checking
                digits: "1234567890",
                letters: "abcdefghijklmnopqrstuvwxyzßабвгедёжзийклмнопрстуфхцчшщъыьэюяґєåäâáàéèêíìїóòöüúùý",
                letters_up: "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГЕДЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯҐЄÅÄÂÁÀÉÈÊÍÌЇÓÒÖÜÚÙÝ",
                symbols: "@#$%^&*()-_=+[]{};:<>/?!"
            }
        },

        locales: {
            en: {
                lower: true,
                msg: {
                    pass: "password",
                    showPass: "Show password",
                    hidePass: "Hide password",
                    genPass: "Random password",
                    passTooShort: "password is too short",
                    noDigits: "password must contain digits",
                    noLetters: "password must contain letters",
                    noLetters_up: "password must contain letters in UPPER case",
                    noSymbols: "password must contain symbols ({})",
                    inBlackList: "password is in list of top used passwords",
                    passRequired: "password is required",
                    badChars: "password contains bad characters: “{}”",
                    weakWarn: "weak",
                    invalidPassWarn: "*",
                    weakTitle: "This password is weak",
                    generateMsg: "To generate a strong password, click {} button."
                }
            },
            de: {
                lower: false,
                msg: {
                    pass: "Passwort",
                    showPass: "Passwort anzeigen",
                    hidePass: "Passwort verbergen",
                    genPass: "Zufallspasswort",
                    passTooShort: "Passwort ist zu kurz",
                    noDigits: "Passwort muss Ziffern enthalten",
                    noLetters: "Passwort muss Buchstaben enthalten",
                    noLetters_up: "Passwort muss Buchstaben in GROSSSCHRIFT enthalten",
                    noSymbols: "Passwort muss Symbole ({}) enthalten",
                    inBlackList: "Passwort steht auf der Liste der beliebtesten Passwörter",
                    passRequired: "Passwort wird benötigt",
                    badChars: "Passwort enthält ungültige Zeichen: “{}”",
                    weakWarn: "Schwach",
                    invalidPassWarn: "*",
                    weakTitle: "Dieses Passwort ist schwach",
                    generateMsg: "Klicken Sie auf den {}-Button, um ein starkes Passwort zu generieren."
                }
            },
            fr: {
                lower: true,
                msg: {
                    pass: "mot de passe",
                    showPass: "Montrer le mot de passe",
                    hidePass: "Cacher le mot de passe",
                    genPass: "Mot de passe aléatoire",
                    passTooShort: "le mot de passe est trop court",
                    noDigits: "le mot de passe doit contenir des chiffres",
                    noLetters: "le mot de passe doit contenir des lettres",
                    noLetters_up: "le mot de passe doit contenir des lettres en MAJUSCULES",
                    noSymbols: "le mot de passe doit contenir des symboles ({})",
                    inBlackList: "le mot de passe est dans la liste des plus utilisés",
                    passRequired: "le mot de passe est requis",
                    badChars: "le mot de passe contient des caractères incorrects: “{}”",
                    weakWarn: "faible",
                    invalidPassWarn: "*",
                    weakTitle: "Ce mot de passe est faible",
                    generateMsg: "Pour créer un mot de passe fort cliquez sur le bouton."
                }
            },
            it: {
                lower: false,
                msg: {
                    pass: "password",
                    showPass: "Mostra password",
                    hidePass: "Nascondi password",
                    genPass: "Password casuale",
                    passTooShort: "la password è troppo breve",
                    noDigits: "la password deve contenere numeri",
                    noLetters: "la password deve contenere lettere",
                    noLetters_up: "la password deve contenere lettere in MAIUSCOLO",
                    noSymbols: "la password deve contenere simboli ({})",
                    inBlackList: "la password è nella lista delle password più usate",
                    passRequired: "è necessaria una password",
                    badChars: "la password contiene caratteri non accettati: “{}”",
                    weakWarn: "debole",
                    invalidPassWarn: "*",
                    weakTitle: "Questa password è debole",
                    generateMsg: "Per generare una password forte, clicca sul tasto {}."
                }
            },
            ru: {
                lower: true,
                msg: {
                    pass: "пароль",
                    showPass: "Показать пароль",
                    hidePass: "Скрыть пароль",
                    genPass: "Случайный пароль",
                    passTooShort: "пароль слишком короткий",
                    noDigits: "в пароле должны быть цифры",
                    noLetters: "в пароле должны быть буквы",
                    noLetters_up: "в пароле должны быть буквы в ВЕРХНЕМ регистре",
                    noSymbols: "в пароле должны быть символы ({})",
                    inBlackList: "этот пароль часто используется в Интернете",
                    badChars: "в пароле есть недопустимые символы: «{}»",
                    weakWarn: "слабый",
                    passRequired: "пароль обязателен",
                    invalidPassWarn: "*",
                    weakTitle: "Пароль слабый, его легко взломать",
                    generateMsg: "Чтобы сгенерировать пароль, нажмите кнопку {}."
                }
            },
            ua: {
                lower: true,
                msg: {
                    pass: "пароль",
                    showPass: "Показати пароль",
                    hidePass: "Сховати пароль",
                    genPass: "Випадковий пароль",
                    passTooShort: "пароль є занадто коротким",
                    noDigits: "пароль повинен містити цифри",
                    noLetters: "пароль повинен містити букви",
                    noLetters_up: "пароль повинен містити букви у ВЕРХНЬОМУ регістрі",
                    noSymbols: "пароль повинен містити cимволи ({})",
                    inBlackList: "пароль входить до списку паролей, що використовуються найчастіше",
                    passRequired: "пароль є обов'язковим",
                    badChars: "пароль містить неприпустимі символи: «{}»",
                    weakWarn: "слабкий",
                    invalidPassWarn: "*",
                    weakTitle: "Цей пароль є слабким",
                    generateMsg: "Щоб ​​створити надійний пароль, натисніть кнопку {}."
                }
            },
            es: {
                lower: true,
                msg: {
                    pass: "contraseña",
                    showPass: "Mostrar contraseña",
                    hidePass: "Ocultar contraseña",
                    genPass: "Contraseña aleatoria",
                    passTooShort: "contraseña demasiado corta",
                    noDigits: "la contraseña debe contener dígitos",
                    noLetters: "la contraseña debe contener letras",
                    noLetters_up: "la contraseña debe contener letras en MAYÚSCULAS",
                    noSymbols: "la contraseña debe contener símbolos ({})",
                    inBlackList: "la contraseña está en la lista de las contraseñas más usadas",
                    passRequired: "se requiere contraseña",
                    badChars: "la contraseña contiene caracteres no permitidos: “{}”",
                    weakWarn: "débil",
                    invalidPassWarn: "*",
                    weakTitle: "Esta contraseña es débil",
                    generateMsg: "Para generar una contraseña segura, haga clic en el botón de {}."
                }
            },
            el: {
                lower: true,
                msg: {
                    pass: "πρόσβασης",
                    showPass: "Προβολή κωδικού πρόσβασης",
                    hidePass: "Απόκρυψη κωδικού πρόσβασης",
                    genPass: "Τυχαίος κωδικός πρόσβασης",
                    passTooShort: "ο κωδικός πρόσβασης είναι πολύ μικρός",
                    noDigits: "ο κωδικός πρόσβασης πρέπει να περιέχει ψηφία",
                    noLetters: "ο κωδικός πρόσβασης πρέπει να περιέχει λατινικά γράμματα",
                    noLetters_up: "ο κωδικός πρόσβασης πρέπει να περιέχει λατινικά γράμματα με ΚΕΦΑΛΑΙΑ",
                    noSymbols: "ο κωδικός πρόσβασης πρέπει να περιέχει σύμβολα ({})",
                    inBlackList: "ο κωδικός πρόσβασης βρίσκεται σε κατάλογο δημοφιλέστερων κωδικών",
                    passRequired: "απαιτείται κωδικός πρόσβασης",
                    badChars: "ο κωδικός περιέχει μη επιτρεπτούς χαρακτήρες: “{}”",
                    weakWarn: "αδύναμος",
                    invalidPassWarn: "*",
                    weakTitle: "Αυτός ο κωδικός πρόσβασης είναι αδύναμος",
                    generateMsg: "Για να δημιουργήσετε δυνατό κωδικό πρόσβασης, κάντε κλικ στο κουμπί {}."
                }
            }
        },

        blackList: [
            "password", "123456", "12345678", "abc123", "qwerty", "monkey", "letmein", "dragon", "111111", "baseball",
            "iloveyou", "trustno1", "1234567", "sunshine", "master", "123123", "welcome", "shadow", "ashley", "football",
            "jesus", "michael", "ninja", "mustang", "password1", "p@ssw0rd", "miss", "root", "secret"
        ],

        generationChars: {
            digits: "1234567890",
            letters: "abcdefghijklmnopqrstuvwxyz",
            letters_up: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        },

        dataAttr: "PassField.Field"
    };

    // ========================== initialization ==========================

    /**
     * Encapsulates PassField logic
     * @param {object|string} el - input for which the field is initizlized (or ID of the input)
     * @param {object} opts - options to override defaults
     */
    PassField.Field = function(el, opts) {
        var _conf = PassField.Config;
        var _dom = {};
        var _opts = utils.extend({}, _conf.defaults, opts);
        var _isMasked = true;
        var _locale;
        var _id;
        var _validateTimer;
        var _blurTimer;
        var _blurMaskTimer;
        var _warningShown = false;
        var _validationResult = null;
        var _ieVersion;
        var _isBrowserSupported;
        var _features;

        var ELEMENTS_PREFIX = "a_pf-";

        // exports
        this.toggleMasking = function(isMasked) { toggleMasking(isMasked); };
        this.setPass = setPass;
        this.validatePass = validatePassword;
        this.getPassValidationMessage = getPassValidationMessage;
        this.getPassStrength = getPassStrength;

        init.call(this);

        /**
         * Initizlizes the password field
         */
        function init() {
            fillBrowserVersion();
            if (!_isBrowserSupported)
                return;
            fixErrorsAndFillOptions();
            if (!setMainEl())
                return;
            setLocale();
            defineId();
            detectFeatures();
            createNodes();
            addClassForIE();
            bindEvents();
            toggleMasking(_opts.isMasked, false);
            doAutofocus();
            assignDataObject(PassField.Config.dataAttr, this);
        }

        // ========================== logic ==========================

        /**
         * Corrects user errors in options
         * Fills blackList
         */
        function fixErrorsAndFillOptions() {
            if (_opts.showGenerate && !_opts.showToggle)
                _opts.isMasked = false; // cannot generate hidden passwords
            _opts.blackList = (_opts.blackList || []).concat(PassField.Config.blackList);
        }

        /**
         * Sets mainEl to the actual element (it can be string)
         */
        function setMainEl() {
            if (typeof el == "string") {
                el = document.getElementById(el);
            }
            _dom.mainInput = el;
            return !!_dom.mainInput;
        }

        /**
         * Fills _locale from setting defined in _opts 
         * Locale will be merged from default locale and user-defined messages
         */
        function setLocale() {
            var neutralLocale = "en";

            var loc = _opts.locale;
            if (!loc && navigator.language)
                loc = navigator.language.replace(/\-.*/g, "");
            if (loc)
                _locale = _conf.locales[loc];
            if (_locale)
                _locale = utils.extend({}, _conf.locales[neutralLocale], _locale);
            if (!_locale)
                _locale = utils.extend({}, _conf.locales[neutralLocale]);
            if (_opts.localeMsg)
                utils.extend(_locale.msg, _opts.localeMsg);
        }

        /**
         * Sets password value in field
         * @param {String} val - value to set
         */
        function setPass(val) {
            _dom.mainInput.value = val;
            _dom.clearInput.value = val;
            handleInputKeyup();
        }

        /**
         * Defines _id
         * This will be id of the main input or random id (if main input doesn't have id)
         */
        function defineId() {
            _id = _dom.mainInput.id;
            if (!_id) {
                _id = ("i" + Math.round(Math.random() * 100000));
                _dom.mainInput.id = _id;
            }
        }

        /**
         * Inserts DOM nodes to the tree
         * Fills _dom with created objects
         */
        function createNodes() {
            var mainInputRect = getRect(_dom.mainInput);
            mainInputRect.top += cssFloat(_dom.mainInput, "marginTop");
            var cls = _dom.mainInput.className;

            var heightStr = mainInputRect.height + "px";
            addClass(_dom.mainInput, "txt-pass");

            _dom.wrapper = _dom.mainInput.parentNode;
            addClass(_dom.wrapper, "wrap");
            if (css(_dom.wrapper, "position") == "static") {
                _dom.wrapper.style.position = "relative";
            }

            _dom.clearInput = newEl("input", { type: "text", id: "txt-clear", className: "txt-clear",
                    placeholder: _dom.mainInput.placeholder, value: _dom.mainInput.value });
            if (cls) {
                addClass(_dom.clearInput, cls, true);
            }
            var inputStyle = _dom.mainInput.style.cssText;
            if (inputStyle) {
                _dom.clearInput.style.cssText = inputStyle;
            }
            var maxlength = _dom.mainInput.getAttribute("maxLength");
            if (maxlength) {
                _dom.clearInput.setAttribute("maxLength", maxlength);
            }
            var size = _dom.mainInput.getAttribute("size");
            if (size) {
                _dom.clearInput.setAttribute("size", size);
            }
            _dom.clearInput.style.display = "none";
            insertAfter(_dom.mainInput, _dom.clearInput);

            if (_opts.showWarn) {
                // password warning label
                _dom.warnMsg = newEl("div", { id: "warn", className: "warn" },
                    { margin: "0 0 0 3px" });
                if (_opts.warnMsgClassName)
                    addClass(_dom.warnMsg, _opts.warnMsgClassName, true);
                insertAfter(_dom.clearInput, _dom.warnMsg);
            }

            if (_opts.showToggle) {
                // toggle password masking button
                _dom.maskBtn = newEl("div", { id: "btn-mask", className: "btn-mask", title: _locale.msg.showPass },
                    { position: "absolute", margin: "0", padding: "0" });
                addClass(_dom.maskBtn, "btn");
                setHtml(_dom.maskBtn, "abc");
                insertAfter(_dom.clearInput, _dom.maskBtn);
            }

            if (_opts.showGenerate) {
                // password generation button
                _dom.genBtn = newEl("div", { id: "btn-gen", className: "btn-gen", title: _locale.msg.genPass },
                    { position: "absolute", margin: "0", padding: "0" });
                addClass(_dom.genBtn, "btn");
                insertAfter(_dom.clearInput, _dom.genBtn);

                _dom.genBtnInner = newEl("div", { id: "btn-gtn-i", className: "btn-gen-i", title: _locale.msg.genPass });
                _dom.genBtn.appendChild(_dom.genBtnInner);
            }

            if (_opts.showTip) {
                // password tooltip below the field
                _dom.tip = newEl("div", { id: "tip", className: "tip" },
                    { position: "absolute", margin: "0", padding: "0", width: mainInputRect.width + "px" });
                insertAfter(_dom.clearInput, _dom.tip);

                var arrWrap = newEl("div", { id: "tip-arr-wrap", className: "tip-arr-wrap" });
                _dom.tip.appendChild(arrWrap);
                arrWrap.appendChild(newEl("div", { id: "tip-arr", className: "tip-arr" }));
                arrWrap.appendChild(newEl("div", { id: "tip-arr-in", className: "tip-arr-in" }));

                _dom.tipBody = newEl("div", { id: "tip-body", className: "tip-body" });
                _dom.tip.appendChild(_dom.tipBody);
            }

            if (!_features.placeholders) {
                var placeholderText = _dom.mainInput.getAttribute("placeholder") || _dom.mainInput.getAttribute("data-placeholder");
                if (placeholderText) {
                    _dom.placeholder = newEl("div", { id: "placeholder", className: "placeholder" },
                        { position: "absolute", margin: "0", padding: "0", height: heightStr, lineHeight: heightStr });
                    setHtml(_dom.placeholder, placeholderText);
                    insertAfter(_dom.clearInput, _dom.placeholder);
                }
            } else if (!_dom.mainInput.getAttribute("placeholder") && _dom.mainInput.getAttribute("data-placeholder")) {
                _dom.mainInput.setAttribute("placeholder", _dom.mainInput.getAttribute("data-placeholder"));
            }

            setTimeout(resizeControls, 30);
        }

        /**
         * Resizes controls (for window.onresize event)
         */
        function resizeControls() {
            var rect = getRect(_isMasked ? _dom.mainInput : _dom.clearInput);
            var left = 5;
            if (_dom.maskBtn) {
                left += cssFloat(_dom.maskBtn, "width");
                setRect(_dom.maskBtn, { top: rect.top, left: rect.left + rect.width - left, height: rect.height });
            }
            if (_dom.genBtn) {
                left += cssFloat(_dom.genBtn, "width");
                setRect(_dom.genBtn, { top: rect.top, left: rect.left + rect.width - left, height: rect.height });
                _dom.genBtnInner.style.marginTop = Math.max(0, Math.round((rect.height - 19) / 2)) + "px";
            }
            if (_dom.placeholder) {
                setRect(_dom.placeholder, { top: rect.top, left: rect.left + 7, height: rect.height });
            }
            if (_dom.tip) {
                setRect(_dom.tip, { left: rect.left, top: rect.top + rect.height, width: rect.width });
            }
        }

        /**
         * Fills in _ieVersion and _isBrowserSupported
         */
        function fillBrowserVersion() {
            _ieVersion = getVersionIE();
            _isBrowserSupported = isBrowserSupported();
        }

        /**
         * Checks whether we support this browser
         * @return {boolean} - should we contibue execution.
         */
        function isBrowserSupported() {
            return _ieVersion < 0 || _ieVersion >= 6;
        }

        /**
         * Applies style to the wrapper if the browser is IE
         */
        function addClassForIE() {
            if (_ieVersion < 0)
                return;
            if (_ieVersion < 7) {
                addClass(_dom.wrapper, "ie6");
            } else if (_ieVersion < 8) {
                addClass(_dom.wrapper, "ie7");
            }
        }

        /**
         * Detects browser features support
         * Fills in _features variable
         */
        function detectFeatures() {
            var supportsPlaceholder = true;
            var test = document.createElement("input");
            if (!("placeholder" in test)) {
                supportsPlaceholder = false;
            }

            var box = document.createElement("div");
            box.style.paddingLeft = box.style.width = "1px";
            document.body.appendChild(box);
            var isBoxModel = box.offsetWidth == 2;
            document.body.removeChild(box);

            _features = {
                placeholders: supportsPlaceholder,
                boxModel: isBoxModel
            };
        }

        /**
         * returns IE version
         * @return {Number} - IE version (-1 if this is another browser).
         */
        function getVersionIE() {
            var rv = -1;
            if (navigator.appName == "Microsoft Internet Explorer") {
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                var match = re.exec(navigator.userAgent);
                if (match != null) {
                    rv = parseFloat(match[1]);
                }
            }
            return rv;
        }

        /**
         * Binds handler events to DOM nodes
         */
        function bindEvents() {
            utils.attachEvent(_dom.mainInput, "onkeyup", handleInputKeyup);
            utils.attachEvent(_dom.mainInput, "onfocus", handleInputFocus);
            utils.attachEvent(_dom.mainInput, "onblur", handleInputBlur);
            if (_dom.placeholder) {
                utils.attachEvent(_dom.mainInput, "onkeyup", handleInputKeydown);
            }

            utils.attachEvent(_dom.clearInput, "onkeyup", handleInputKeyup);
            utils.attachEvent(_dom.clearInput, "onfocus", handleInputFocus);
            utils.attachEvent(_dom.clearInput, "onblur", handleInputBlur);
            if (_dom.placeholder) {
                utils.attachEvent(_dom.clearInput, "onkeyup", handleInputKeydown);
            }

            utils.attachEvent(_dom.wrapper, "onmouseover", function() { setTimeout(resizeControls, 0); });
            utils.attachEvent(window, "onresize", resizeControls);

            if (_dom.maskBtn) {
                _dom.maskBtn.onclick = function() { toggleMasking(); };
            }

            if (_dom.genBtn) {
                _dom.genBtn.onclick = function() { generatePassword(); };
            }

            if (_dom.placeholder) {
                _dom.placeholder.onclick = function() { (_isMasked ? _dom.mainInput : _dom.clearInput).focus(); }
            }
        }

        /**
         * If the element has autofocus attribute, we'll check it and focus if necessary
         */
        function doAutofocus() {
            if (typeof _dom.mainInput.hasAttribute === "function" && _dom.mainInput.hasAttribute("autofocus")
                || _dom.mainInput.getAttribute("autofocus")) {
                _dom.mainInput.focus();
                handleInputFocus();
            }
        }

        /**
         * Input received keyup
         */
        function handleInputKeyup() {
            var val;
            if (_isMasked) {
                val = _dom.clearInput.value = _dom.mainInput.value;
            } else {
                val = _dom.mainInput.value = _dom.clearInput.value;
            }
            if (_opts.strengthCheckTimeout > 0 && !_warningShown) {
                if (_validateTimer) {
                    clearTimeout(_validateTimer);
                }
                _validateTimer = setTimeout(validatePassword, _opts.strengthCheckTimeout);
            } else {
                validatePassword();
            }
            if (_dom.placeholder && !val) {
                _dom.placeholder.style.display = "block";
            }
        }

        /**
         * Input received KeyDown
         */
        function handleInputKeydown() {
            // Here we support old browsers and remove placeholder
            if (_dom.placeholder) {
                _dom.placeholder.style.display = "none";
            }
        }

        /**
         * Input is focused
         */
        function handleInputFocus() {
            if (_blurTimer) {
                clearTimeout(_blurTimer);
                _blurTimer = null;
            }
            if (_blurMaskTimer) {
                clearTimeout(_blurMaskTimer);
                _blurMaskTimer = null;
            }
            addClass(_dom.wrapper, "focused");
            setTimeout(resizeControls, 0);
        }

        /**
         * Input is blurred
         */
        function handleInputBlur() {
            _blurTimer = setTimeout(function() {
                _blurTimer = null;
                removeClass(_dom.wrapper, "focused");
                // if the password has not been masked my default, toggle mode after inactivity
                if (_opts.isMasked && !_blurMaskTimer) {
                    _blurMaskTimer = setTimeout(function() {
                        _blurMaskTimer = null;
                        toggleMasking(true, false);
                    }, 1500);
                }
            }, 100);
        }

        /**
         * Toggles masking state
         * @param  {Boolean} [isMasked] - should we display the password masked (undefined or null = change masking)
         * @param {Boolean} [needFocus] - should we focus the field after changing
         */
        function toggleMasking(isMasked, needFocus) {
            if (needFocus === undefined)
                needFocus = true;

            if (isMasked === undefined)
                isMasked = !_isMasked;
            else
                isMasked = !!isMasked;

            var currentDisplayMode = css(_isMasked ? _dom.mainInput : _dom.clearInput, "display") || "block";
            if (isMasked) {
                _dom.mainInput.style.display = currentDisplayMode;
                _dom.clearInput.style.display = "none";
                _dom.mainInput.value = _dom.clearInput.value;
                if (_dom.maskBtn) {
                    setHtml(_dom.maskBtn, "abc");
                    _dom.maskBtn.title = _locale.msg.showPass;
                }
                if (needFocus)
                    _dom.mainInput.focus();
            } else {
                _dom.clearInput.style.display = currentDisplayMode;
                _dom.mainInput.style.display = "none";
                _dom.clearInput.value = _dom.mainInput.value;
                if (_dom.maskBtn) {
                    setHtml(_dom.maskBtn, "&bull;&bull;&bull;");
                    _dom.maskBtn.title = _locale.msg.hidePass;
                }
                if (needFocus)
                    _dom.clearInput.focus();
            }

            // jQuery.validation can isert error laber right after our input, so we'll handle it here
            if (_dom.mainInput.nextSibling != _dom.clearInput) {
                insertAfter(_dom.mainInput, _dom.clearInput);
            }

            _isMasked = isMasked;
        }

        /**
         * Generates random password and inserts it to the field
         */
        function generatePassword() {
            var pass = createRandomPassword();
            _dom.clearInput.value = _dom.mainInput.value = pass;
            toggleMasking(false);

            if (_validateTimer) {
                clearTimeout(_validateTimer);
                _validateTimer = null;
            }
            validatePassword();

            if (_dom.placeholder) {
                _dom.placeholder.style.display = "none";
            }
        }

        /**
         * Validates the password and shows an alert if need
         * @return {Boolean} - is the password valid.
         */
        function validatePassword() {
            if (!_isBrowserSupported) {
                // otherwise unwanted error will be generated while validation
                return true;
            }
            if (_validateTimer) {
                clearTimeout(_validateTimer);
                _validateTimer = null;
            }
            var pass = _isMasked ? _dom.mainInput.value : _dom.clearInput.value;
            var checkResult = calculateStrength(pass);

            if (pass.length == 0) {
                checkResult = { strength: _opts.allowEmpty ? 0 : null, messages: [_locale.msg.passRequired] };
            } else {
                // check: contains bad chars
                if (!_opts.allowAnyChars && checkResult.charTypes[PassField.CharTypes.UNKNOWN]) {
                    checkResult = { strength: null, messages: [_locale.msg.badChars.replace("{}", checkResult.charTypes[PassField.CharTypes.UNKNOWN])] };
                }
                delete checkResult.charTypes;

                // check: blacklist
                var isInBlackList = false;
                utils.each(_opts.blackList, function(el) {
                    if (el == pass) {
                        isInBlackList = true;
                        return false;
                    }
                    return true;
                });
                if (isInBlackList) {
                    checkResult = { strength: 0, messages: [_locale.msg.inBlackList] };
                }
            }
            // check: external (if present)
            if (typeof _opts.validationCallback === "function") {
                var externalResult = _opts.validationCallback(_dom.mainInput, checkResult);
                var returnedMessages;
                var returnedStrength;
                if (externalResult && externalResult.messages && utils.isArray(externalResult.messages)) {
                    returnedMessages = externalResult.messages;
                }
                if (externalResult && Object.prototype.hasOwnProperty.call(externalResult, "strength")
                        && ((typeof externalResult.strength === "number") || (externalResult.strength === null))) {
                    returnedStrength = externalResult.strength;
                }
                if (returnedMessages && returnedMessages.length) {
                    // both messages and strength are replaced with custom messages
                    checkResult.messages = returnedMessages;
                    checkResult.strength = returnedStrength;
                } else {
                    // no message is provided; strength can only be increased
                    if (returnedStrength && returnedStrength > checkResult.strength) {
                        checkResult.strength = returnedStrength;
                    }
                    // else:
                    //      We have been told: "the password is invalid/weak".
                    //      But why? There's no explanation given (in messages) and we can't guess the reason.
                    //      We'll not show such unknown errors to the user and disregard returned strength.
                }
            }

            if (pass.length == 0 && _opts.allowEmpty) {
                // empty but ok
                hidePasswordWarning();
                _validationResult = { strength: 0 };
                return true;
            } else if (checkResult.strength === null || checkResult.strength < _opts.acceptRate) {
                showPasswordWarning(checkResult.strength, checkResult.messages);
                return false;
            } else { // ok
                hidePasswordWarning();
                _validationResult = { strength: checkResult.strength };
                return true;
            }
        }

        /**
         * Calculates password strength according to pattern
         * @param  {string} pass - password
         * @return {object} - { strength: 0..1 (null for non-valid pass), messages: ["please add numbers"] }.
         */
        function calculateStrength(pass) {
            var charTypesPattern = splitToCharTypes(_opts.pattern, PassField.CharTypes.SYMBOL);
            var charTypesPass = splitToCharTypes(pass, _opts.allowAnyChars ? PassField.CharTypes.SYMBOL : PassField.CharTypes.UNKNOWN);

            var messages = [];

            var charTypesPatternCount = 0;

            utils.each(charTypesPattern, function(charType) {
                charTypesPatternCount++;
                if (!charTypesPass[charType]) {
                    var msgName = "no" + charType.charAt(0).toUpperCase() + charType.substring(1);
                    var msg = _locale.msg[msgName];
                    if (msg.indexOf("{}") >= 0) {
                        var symbolsCount = 4;
                        var charsExample = _opts.chars[charType];
                        if (charsExample.length > symbolsCount)
                            charsExample = charsExample.substring(0, symbolsCount);
                        msg = msg.replace("{}", charsExample);
                    }
                    messages.push(msg);
                }
            });
            var strength = 1 - messages.length / charTypesPatternCount;

            if (_opts.checkMode == PassField.CheckModes.MODERATE) {
                utils.each(charTypesPass, function(charType) {
                    if (!charTypesPattern[charType]) {
                        // cool: the user entered char of type which was not in pattern; +strength!
                        strength += 1 / charTypesPatternCount;
                    }
                });
            }

            var lengthRatio = pass.length / _opts.pattern.length - 1;
            if (lengthRatio < 0) {
                strength += lengthRatio;
                messages.push(_locale.msg.passTooShort);
            } else {
                if (_opts.checkMode == PassField.CheckModes.MODERATE) {
                    strength += lengthRatio / charTypesPatternCount;
                }
            }

            if (strength < 0) {
                strength = 0;
            }

            var x = 1;
            var msgs = [];
            var obj = { letters: "1", digits: "!" };
            obj.letters_up = "2";
            $.each({ letters: 1, digits: 2, letters_up: 3, symbols: 4 }, function(k) {
                if (!obj[k]) {
                    x -= .25;
                    msgs.push(1);
                }
            });

             // MODERATE checking mode could produce positive results for extra long passwords
            if (strength > 1)
                strength = 1;

            return { strength: strength, messages: messages, charTypes: charTypesPass };
        }

        /**
         * Shows password warning
         * @param  {Number} strength - password strength (null if the password is not valid)
         * @param  {String[]} messages - validation messages
         */
        function showPasswordWarning(strength, messages) {
            var shortErrorText = "";
            var errorText = "";

            if (strength === null) {
                shortErrorText = _locale.msg.invalidPassWarn;
                errorText = messages[0].charAt(0).toUpperCase() + messages[0].substring(1);
            } else {
                shortErrorText = _locale.msg.weakWarn;
                if (messages && messages.length) {
                    var firstLetter = messages[0].charAt(0);
                    if (_locale.lower)
                        firstLetter = firstLetter.toLowerCase();
                    errorText = _locale.msg.weakTitle + ": " + firstLetter + messages[0].substring(1);
                }
            }
            if (errorText && errorText[errorText.length - 1] != ".")
                errorText += ".";
            _validationResult = { strength: strength, message: errorText };

            if (_dom.warnMsg) {
                setHtml(_dom.warnMsg, shortErrorText);
                _dom.warnMsg.title = errorText;
                if (_opts.errorWrapClassName) {
                    addClass(_dom.wrapper, _opts.errorWrapClassName, true);
                }
            }
            if (_dom.tip) {
                addClass(_dom.tip, "tip-shown");
                var html = errorText;
                if (_dom.genBtn) {
                    html += " " + _locale.msg.generateMsg.replace("{}", '<div class="' + formatClass("btn-gen-help") + '"></div>');
                }
                setHtml(_dom.tipBody, html);
                setTimeout(resizeControls, 0);
            }

            _warningShown = true;
        }

        /**
         * Hides password warning
         */
        function hidePasswordWarning() {
            if (_dom.warnMsg) {
                setHtml(_dom.warnMsg, "");
                _dom.warnMsg.title = "";
                if (_opts.errorWrapClassName) {
                    removeClass(_dom.wrapper, _opts.errorWrapClassName, true);
                }
            }
            if (_dom.tip) {
                removeClass(_dom.tip, "tip-shown");
            }
            _warningShown = false;
        }

        /**
         * Gets message for last password validation
         * @return {String} - last validation message.
         */
        function getPassValidationMessage() {
            return _validationResult ? _validationResult.message : null;
        }

        /**
         * Gets strength measured during last password validation
         * @return {Number|Object} - last measured strength: -1 = not measured; null = pass not valid, Number = strength [0..1].
         */
        function getPassStrength() {
            return _validationResult ? _validationResult.strength : -1;
        }

        /**
         * Creates random sequence by pattern
         * @return {string} - generated password.
         */
         function createRandomPassword() {
            var result = "";
            var charTypes = splitToCharTypes(_opts.pattern, PassField.CharTypes.SYMBOL);
            // We're creating an array of charTypes and shuffling it.
            // In such way, generated password will contain exactly the same number of character types as was defined in pattern
            var charTypesSeq = [];
            utils.each(charTypes, function(charType, chars) {
                for (var j = 0; j < chars.length; j++) {
                    charTypesSeq.push(charType);
                }
            });
            charTypesSeq.sort(function() { return 0.7 - Math.random(); });
            utils.each(charTypesSeq, function(charType) {
                var sequence = _conf.generationChars[charType];
                if (sequence) {
                    if (_opts.chars[charType] && _opts.chars[charType].indexOf(sequence) < 0)
                        sequence = _opts.chars[charType]; // overriden without default letters - ok, generate from given chars
                } else {
                    sequence = _opts.chars[charType];
                }
                result += utils.selectRandom(sequence);
            });
            return result;
        }

        /**
         * Determines character types in string
         * @param  {string} str - input string
         * @param  {string} defaultCharType - default character type (if not found in chars)
         * @return {object} - PassField.CharType => chars.
         */
        function splitToCharTypes(str, defaultCharType) {
            var result = {};
            for (var i = 0; i < str.length; i++) {
                var ch = str.charAt(i);
                var type = defaultCharType;
                utils.each(_opts.chars, function(charType, seq) {
                    if (seq.indexOf(ch) >= 0) {
                        type = charType;
                        return false;
                    }
                    return true;
                });
                result[type] = (result[type] || "") + ch;
            }
            return result;
        }

        // ========================== DOM-related functions ==========================

        /**
         * Formats class for this element by adding common prefix
         * Need to ensure there are no conflicts
         * @param  {string} id - class name or id
         * @return {string} - formatted class name or id.
         */
        function formatId(id) {
            return ELEMENTS_PREFIX + id + "-" + _id;
        }

        /**
         * Formats class for this element by adding common prefix
         * Need to ensure there are no conflicts
         * @param  {string} cls - class name or id
         * @return {string} - formatted class name or id.
         */
        function formatClass(cls) {
            return ELEMENTS_PREFIX + cls;
        }

        /**
         * Invokes utils.newEl but adds common prefixes to class and id
         * @param  {string} tagName - tag name of the inserted element
         * @param  {object} attr - attributes of the inserted element
         * @param  {object} [css] - CSS properties to apply
         * @return {object} - created DOM element.
         */
        function newEl(tagName, attr, css) {
            if (attr.id)
                attr.id = formatId(attr.id);
            if (attr.className)
                attr.className = formatClass(attr.className);
            return utils.newEl(tagName, attr, css);
        }

        /**
         * Gets bound rect safely
         * @param {Object} el - DOM element
         * @return {Object} - rect: { top: Number, left: Number }.
         */
        function getBoundingRect(el) {
            try {
                return el.getBoundingClientRect();
            } catch (err) {
                return { top: 0, left: 0 }
            }
        }

        /**
         * Gets element offset
         * @param {Object} el - DOM element
         * @return {Object} - offset: { top: Number, left: Number }.
         */
        function offset(el) {
            var doc = el.ownerDocument;
            if (!doc) {
                return { top: 0, left: 0 };
            }
            var box = getBoundingRect(el);
            return {
                top: box.top + (window.pageYOffset || 0) - (doc.documentElement.clientTop || 0),
                left: box.left + (window.pageXOffset || 0) - (doc.documentElement.clientLeft || 0)
            };
        }

        /**
         * Gets offset parent for element
         * @param {Object} el - DOM element
         * @return {Function|HTMLElement|Element|Element} - offset parent.
         */
        function offsetParent(el) {
            var op;
            try { op = el.offsetParent; }
            catch (e) { }
            if (!op)
                op = document.documentElement;
            while (op && (op.nodeName.toLowerCase() != "html") && css(op, "position") === "static") {
                op = op.offsetParent;
            }
            return op || document.documentElement;
        }

        /**
         * Gets element position
         * @param {Object} el - DOM element
         * @return {Object} - offset: { top: Number, left: Number }.
         */
        function position(el) {
            var offs, parentOffset = { top: 0, left: 0 };
            if (css(el, "position") === "fixed") {
                offs = getBoundingRect(el);
            } else {
                var op = offsetParent(el);
                offs = offset(el);
                if (op.nodeName.toLowerCase() != "html") {
                    parentOffset = offset(op);
                }
                parentOffset.top += cssFloat(op, "borderTopWidth");
                parentOffset.left += cssFloat(op, "borderLeftWidth");
            }
            return {
                top: offs.top - parentOffset.top - cssFloat(el, "marginTop"),
                left: offs.left - parentOffset.left - cssFloat(el, "marginLeft")
            };
        }

        /**
         * Get outer width and height for DOM element
         * @param {Object} el - DOM element
         * @return {Object} - bounds: { width: Number, height: Number }.
         */
        function getBounds(el) {
            return { width: el.offsetWidth, height: el.offsetHeight };
        }

        /**
         * Get bounds and position for DOM element
         * @param {Object} el - DOM element
         * @return {Object} - bounds and offset combined.
         */
        function getRect(el) {
            return utils.extend(offset(el), getBounds(el));
        }

        /**
         * Sets bounds and offset
         * @param {Object} el - DOM element
         * @param {Object} rect - coords to set
         */
        function setRect(el, rect) {
            if (rect.height && !isNaN(rect.height)) {
                el.style.height = rect.height + "px";
                el.style.lineHeight = rect.height + "px";
            }
            if (rect.width && !isNaN(rect.width)) {
                el.style.width = rect.width + "px";
            }
            if (rect.top || rect.left) {
                if (css(el, "display") == "none") {
                    el.style.top = rect.top + "px";
                    el.style.left = rect.left + "px";
                    return;
                }
                var curLeft, curTop, curOffset;

                curOffset = offset(el);
                curTop = css(el, "top") || 0;
                curLeft = css(el, "left") || 0;

                if ((curTop + curLeft + "").indexOf("auto") > -1) {
                    var pos = position(el);
                    curTop = pos.top;
                    curLeft = pos.left;
                } else {
                    curTop = parseFloat(curTop) || 0;
                    curLeft = parseFloat(curLeft) || 0;
                }

                if (rect.top) {
                    el.style.top = ((rect.top - curOffset.top) + curTop) + "px";
                }
                if (rect.left) {
                    el.style.left = ((rect.left - curOffset.left) + curLeft) + "px";
                }
            }
        }

        /**
         * Gets CSS property (including inherited)
         * @param {Object} el - DOM element
         * @param {String} prop - CSS property name
         * @return {String} - property value.
         */
        function css(el, prop) {
            var st = typeof window.getComputedStyle === "function" ? window.getComputedStyle(el) : el.currentStyle;
            return st ? st[prop] : null;
        }

        /**
         * Gets CSS property and parses the value as float
         * @param {Object} el - DOM element
         * @param {String} prop - CSS property name
         * @return {Number} - parsed property value.
         */
        function cssFloat(el, prop) {
            var v = css(el, prop);
            if (!v)
                return 0;
            var parsed = parseFloat(v);
            return isNaN(parsed) ? 0 : parsed;
        }

        /**
         * Inserts DOM node after another
         * @param {Object} target - target node
         * @param {Node} el - new node
         */
        function insertAfter(target, el) {
            if (target.parentNode)
                target.parentNode.insertBefore(el, target.nextSibling);
        }

        /**
         * Sets innerHTML in element
         * @param {Object} el - DOM element
         * @param {String} html - HTML to set
         */
        function setHtml(el, html) {
            try {
                el.innerHTML = html;
            } catch (err) {
                // browser doesn't support innerHTML or it's readonly
                var newNode = document.createElement();
                newNode.innerHTML = html;
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
                el.appendChild(newNode);
            }
        }

        /**
         * Adds class to element
         * @param {object} el - element
         * @param {string} cls - class name
         * @param {Boolean} [raw=false] - is given class name raw (without prefix)
         */
        function addClass(el, cls, raw) {
            if (hasClass(el, cls, raw))
                return;
            el.className = el.className + (el.className ? " " : "") + (raw === true ? cls : formatClass(cls));
        }

        /**
         * Removes class from element
         * @param  {object} el - element
         * @param  {string} cls - class name
         * @param {Boolean} [raw=false] - is given class name raw (without prefix)
         */
        function removeClass(el, cls, raw) {
            if (!hasClass(el, cls, raw))
                return;
            el.className = (" " + el.className + " ").replace((raw === true ? cls : formatClass(cls)) + " ", "").replace(/^\s+|\s+$/g, "");
        }

        /**
         * Checks whether element has class
         * @param  {object} el - element
         * @param  {string} cls - class name
         * @param {Boolean} [raw=false] - is given class name raw (without prefix)
         * @return {Boolean} - whether the element has the class.
         */
        function hasClass(el, cls, raw) {
            cls = " " + (raw === true ? cls : formatClass(cls)) + " ";
            return (" " + el.className + " ").replace(/[\n\t]/g, " ").indexOf(cls) > -1;
        }

        /**
         * Assigns data attribute for jQuery
         */
        function assignDataObject(prop, obj) {
            if ($) {
                $(_dom.mainInput).data(prop, obj);
            }
        }
    };

    // ========================== utility ==========================

    /**
     * Internal utility functions
     */
    var utils = {};

    /**
     * Almost the same as jQuery extend
     * @return {object} first arg, extended with others.
     */
    utils.extend = function() {
        var arg = arguments;
        for (var i = 1; i < arg.length; i++) {
            utils.each(arg[i], function (key, value) {
                if (utils.isArray(arg[0][key]) || utils.isArray(value)) {
                    arg[0][key] = arg[0][key] ? arg[0][key].concat(value || []) : value;
                } else if (typeof arg[0][key] === "object" && typeof value === "object") {
                    arg[0][key] = utils.extend({}, arg[0][key], value);
                } else if (typeof value === "object") {
                    arg[0][key] = utils.extend({}, value);
                } else {
                    arg[0][key] = value;
                }
            });
        }
        return arg[0];
    };

    /**
     * Creates DOM element
     * @param  {string} tagName - tag name of the inserted element
     * @param  {object} [attr] - attributes of the inserted element
     * @param  {object} [css] - CSS properties to apply
     * @return {object} - created DOM element.
     */
    utils.newEl = function(tagName, attr, css) {
        var el = document.createElement(tagName);
        if (attr) {
            utils.each(attr, function(key, value) {
                if (value)
                    el[key] = value;
            });
        }
        if (css) {
            utils.each(css, function(key, value) {
                if (value)
                    el.style[key] = value;
            });
         }
        return el;
    };

    /**
     * Attaches event to element
     * @param  {object} el - DOM element
     * @param  {string} event - event name
     * @param  {function} handler - handler to attach
     */
    utils.attachEvent = function(el, event, handler) {
        var oldHandler = el[event];
        el[event] = function() {
            handler(el);
            if (typeof oldHandler === "function") {
                oldHandler(el);
            }
        };
    };

    /**
     * Iterates the collection or object attrs
     * @param  {object|object[]|string[]} obj - object or collection to iterate
     * @param  {function} fn - function to invoke on each element
     */
    utils.each = function(obj, fn) {
        if (utils.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                if (fn(obj[i]) === false)
                    return;
            }
        } else {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (fn(key, obj[key]) === false)
                        return;
                }
            }
        }
    };

    /**
     * Check whether the object is array
     * @param  {object}  obj - object to check
     * @return {Boolean} - array or not.
     */
    utils.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    /**
     * Selects random element from collection
     * @param  {object} arr - collection
     * @return {object} - random element.
     */
    utils.selectRandom = function(arr) {
        var pos = Math.floor(Math.random() * arr.length);
        return utils.isArray(arr) ? arr[pos] : arr.charAt(pos);
    };

    /**
     * Checks whether array contains item
     * @param  {Array} arr - array
     * @param  {object} item - item to check (strictly)
     * @return {Boolean} - contains or not.
     */
    utils.contains = function(arr, item) {
        if (!arr)
            return false;
        var result = false;
        utils.each(arr, function (el) {
            if (el === item) {
                result = true;
                return false;
            }
            return true;
        });
        return result;
    };

    // ========================== jQuery plugin ==========================

    if ($) {
        /**
         * passField jQuery plugin. Usage: $(selector).passField(options);
         * @param  {object} [opts] - options
         * @return {object} - jQuery object.
         */
        $.fn.passField = function(opts) {
            return this.each(function() {
                new PassField.Field(this, opts);
            });
        };

        
        /**
         * Toggles masking state
         * @param  {Boolean} [isMasked] - should we display the password masked (undefined or null = change masking)
         * @return {object} - jQuery object.
         */
        $.fn.togglePassMasking = function(isMasked) {
            return this.each(function() {
                var pf = $(this).data(PassField.Config.dataAttr);
                if (pf) {
                    pf.toggleMasking(isMasked);
                }
            });
        };

        /**
         * Sets password value in field
         * @param {String} val - value to set
         * @return {object} - jQuery object.
         */
        $.fn.setPass = function(val) {
            return this.each(function() {
                var pf = $(this).data(PassField.Config.dataAttr);
                if (pf) {
                    pf.setPass(val);
                }
            });
        };

        /**
         * Validates the password
         * @return {Boolean} - is the password valid.
         */
        $.fn.validatePass = function() {
            var isValid = true;
            this.each(function() {
                var pf = $(this).data(PassField.Config.dataAttr);
                if (pf && !pf.validatePass()) {
                    isValid = false;
                }
            });
            return isValid;
        };

        /**
         * Gets message for last password validation
         * @return {String} - last validation message.
         */
        $.fn.getPassValidationMessage = function() {
            var el = this.first();
            if (el) {
                var pf = el.data(PassField.Config.dataAttr);
                if (pf) {
                    return pf.getPassValidationMessage();
                }
            }
            return null;
        }

        /**
         * Gets message for last password validation
         * @return {String} - last validation message.
         */
        $.fn.getPassStrength = function () {
            var el = this.first();
            if (el) {
                var pf = el.data(PassField.Config.dataAttr);
                if (pf) {
                    return pf.getPassStrength();
                }
            }
            return null;
        }
    }

    // ========================== jQuery.Validation plugin ==========================

    if ($ && $.validator) {
        jQuery.validator.addMethod("passfield", function(val, el) {
            $(el).validatePass(); // this will set validation message
        }, function(val, el) { return $(el).getPassValidationMessage(); });
    }
})(window.jQuery, document, window);
