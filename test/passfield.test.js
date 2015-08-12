/** 
 * Unit tests for Pass*Field
 */
$(function() {
    "use strict";

    /* global PassField */

    module("Main tests", {
        setup: function() {
            if (!$("#qunit-fixture").length)
                $("<div id='qunit-fixture' style='position:absolute;width:1000px;height:1000px;left:-10000px;top:-10000px;'></div>").appendTo("body");
            $("#qunit-fixture")
                .html("");
        }
    });

    // ========================== declarations ==========================

    var fixture,
        wrap,
        passFieldObj,
        clearInput, passInput,
        btnGen, btnMask,
        msgWarn, tip, fakePlaceholder,
        anotherInput,
        isMasked,
        errorWrapClassName,
        valResult,
        supportsPlaceholders,
        ieVersion;

    var ELEMENTS_PREFIX = "a_pf-";
    var STRONG_PASS = "aE4fW4#&";

    // ========================== tests ==========================

    test("init with jQuery", function() {
        prepare();
        runBasicWorkFlow();
    });
    test("init without jQuery", function() {
        prepare(null, {
            isJquery: false
        });
        runBasicWorkFlow();
    });
    test("init with jQuery without id", function() {
        prepare(null, {
            inputAttr: { id: null },
            wrapAttr: { id: null }
        });
        runBasicWorkFlow();
    });
    test("init without jQuery without id", function() {
        prepare(null, {
            inputAttr: { id: null },
            wrapAttr: { id: null },
            isJquery: false
        });
        runBasicWorkFlow();
    });
    test("style is copied", function() {
        var height = "200px";
        var width = "300px";
        var border = "5px solid rgb(250,252,253)";
        var fontSize = "10px";
        var style = "height: " + height + "; width: " + width + "; border: " + border + "; font-size: " + fontSize + ";";

        prepare(null, {
            inputAttr: { style: style }
        });
        runBasicWorkFlow();

        equal(Math.round(parseFloat(passInput.css("height"))) + "px", height, "height assigned to pass input");
        equal(Math.round(parseFloat(passInput.css("width"))) + "px", width, "width assigned to pass input");
        equal(Math.round(parseFloat(passInput.css("border-top-width"))) + "px " + passInput.css("border-left-style") + " " +
            passInput.css("border-right-color").replace(/\s/g, ""), border, "border assigned to pass input");
        equal(passInput.css("font-size"), fontSize, "font-size assigned to pass input");

        if (clearInput) {
            equal(Math.round(parseFloat(clearInput.css("height"))) + "px", height, "height assigned to clear input");
            equal(Math.round(parseFloat(clearInput.css("width"))) + "px", width, "width assigned to clear input");
            equal(Math.round(parseFloat(clearInput.css("border-top-width"))) + "px " + clearInput.css("border-left-style") + " " +
                clearInput.css("border-right-color").replace(/\s/g, ""), border, "border assigned clear input");
            equal(clearInput.css("font-size"), fontSize, "font-size assigned clear input");
        }
    });
    test("pass is set", function() {
        prepare();
        runBasicWorkFlow();
        var pass = "new-pass";
        passFieldObj.setPass(pass);
        equal(passInput.val(), pass, "pass input value changed");
        if (clearInput)
            equal(clearInput.val(), pass, "clear input value changed");
        equal(getWarnMsg(), null, "error is not generated");
        pass = "new-pass-2";
        passInput.setPass(pass);
        equal(passInput.val(), pass, "pass input value changed");
        if (clearInput)
            equal(clearInput.val(), pass, "clear input value changed");
        equal(getWarnMsg(), null, "error is not generated");
    });
    test("empty pass validation", function() {
        prepare({ allowEmpty: false });
        runBasicWorkFlow();
        passInput.setPass("");
        equal(getWarnMsg(), null, "error is not generated");
        ok(!passFieldObj.validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password is required.", "empty password error is generated");
        passInput.setPass(STRONG_PASS);
        ok(passFieldObj.validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "empty password error is removed");
    });
    test("basic pass validation", function() {
        prepare({ allowEmpty: false, pattern: STRONG_PASS, acceptRate: 1, checkMode: PassField.CheckModes.STRICT });
        runBasicWorkFlow();
        passInput.setPass("");
        equal(getWarnMsg(), null, "error is not generated");
        ok(!passInput.validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password is required.", "empty password error is generated");
        ok(!passInput.setPass("ab").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain letters in UPPER case, digits and symbols (@#$%).<br/>" +
            "Password is too short (min. length: 8).", "password uppercase error is generated");
        ok(!passInput.setPass("abCD").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain digits and symbols (@#$%).<br/>Password is too short (min. length: 8).",
            "password digits error is generated");
        ok(!passInput.setPass("abCD12").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain symbols (@#$%).<br/>Password is too short (min. length: 8).",
            "password digits error is generated");
        ok(!passInput.setPass("abCD12!").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is too short (min. length: 8).", "password length is generated");
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "empty password error is removed");
    });
    test("empty pass is allowed", function() {
        prepare({ allowEmpty: true });
        runBasicWorkFlow();
        passInput.setPass("");
        equal(getWarnMsg(), null, "error is not generated");
        ok(passInput.validatePass(), "pass is valid");
        equal(passInput.getPassStrength(), 0, "pass strength is not null");
        equal(getWarnMsg(), null, "error is not generated after validation");
        triggerEvent(passInput[0], "focus");
        passInput.simulate("blur");
        equal(getWarnMsg(), null, "error is not generated after blur");
    });
    test("any chars are not allowed", function() {
        prepare({ allowAnyChars: false });
        runBasicWorkFlow();
        ok(!passInput.setPass("≈").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password contains bad characters: “≈”.", "error is generated");
        equal(passInput.getPassStrength(), null, "pass strength is null");
    });
    test("any chars are allowed", function() {
        prepare({ allowAnyChars: true, pattern: "#", acceptRate: 1 });
        runBasicWorkFlow();
        ok(passInput.setPass("≈").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "error is not generated");
        equal(passInput.getPassStrength(), 1, "pass strength is full");
    });
    test("override char types", function() {
        prepare({ allowAnyChars: false, pattern: "dslu", acceptRate: 1, chars: { digits: "dD", symbols: "sS", letters: "lL", lettersUp: "uU" } });
        runBasicWorkFlow();
        ok(!passInput.setPass("1234").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password contains bad characters: “1234”.", "bad chars error is generated");
        ok(!passInput.setPass("dDdD").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain symbols (sS), letters and letters in UPPER case.", "chars error is generated");
        ok(!passInput.setPass("dDsS").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain letters and letters in UPPER case.", "chars error is generated");
        ok(!passInput.setPass("dlsS").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain letters in UPPER case.", "chars error is generated");
        ok(passInput.setPass("dlsu").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "chars error is removed");
    });
    test("pass strength by length", function() {
        prepare({ pattern: "1234567890", acceptRate: 0.5, validationCallback: function(el, res) { valResult = res; } });
        runBasicWorkFlow();
        ok(!passInput.setPass("5436").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is too short (min. length: 10).", "pass short error is generated");
        equal(valResult.strength, 0.4, "strength is set");
        equal(passInput.getPassStrength(), 0.4, "strength is returned");
        ok(passInput.setPass("43826").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "pass short error is removed");
        equal(valResult.strength, 0.5, "strength is set");
        equal(passInput.getPassStrength(), 0.5, "strength is returned");
    });
    test("pass strength by types", function() {
        prepare({ pattern: "aA1!", acceptRate: 0.75, validationCallback: function(el, res) { valResult = res; } });
        runBasicWorkFlow();
        ok(!passInput.setPass("5436").validatePass(), "pass is not valid");
        ok(getWarnMsg(), "pass error is generated");
        equal(valResult.strength, 0.25, "strength is set");
        ok(!passInput.setPass("a124").validatePass(), "pass is not valid");
        ok(getWarnMsg(), "pass error is generated");
        equal(valResult.strength, 0.5, "strength is set");
        ok(passInput.setPass("aF24").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "pass error is removed");
        equal(valResult.strength, 0.75, "strength is set");
    });
    test("pass strength by all types", function() {
        prepare({ pattern: "aA1!", acceptRate: 1, validationCallback: function(el, res) { valResult = res; } });
        runBasicWorkFlow();
        ok(!passInput.setPass("5436").validatePass(), "pass is not valid");
        equal(valResult.strength, 0.25, "strength is set");
        ok(getWarnMsg(), "pass error is generated");
        ok(!passInput.setPass("a124").validatePass(), "pass is not valid");
        equal(passInput.val(), "a124", "pass saved");
        equal(valResult.strength, 0.5, "strength is set");
        ok(getWarnMsg(), "pass error is generated");
        ok(!passInput.setPass("aF24").validatePass(), "pass is not valid");
        ok(getWarnMsg(), "pass error is generated");
        equal(valResult.strength, 0.75, "strength is set");
        ok(passInput.setPass("aF2#").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "pass error is removed");
        equal(valResult.strength, 1, "strength is set");
    });
    test("pass strength by blacklist", function() {
        prepare({ pattern: "aA1!", acceptRate: 1, blackList: ["bla-bla-bla"], validationCallback: function(el, res) { valResult = res; } });
        runBasicWorkFlow();
        ok(!passInput.setPass("qwerty").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is in list of top used passwords.", "builtin blacklist is working");
        equal(valResult.strength, 0, "strength is 0");
        ok(!passInput.setPass("qWeRtY").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is in list of top used passwords.", "builtin blacklist is working");
        equal(valResult.strength, 0, "strength is 0");
        ok(!passInput.setPass("bla-bla-bla").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is in list of top used passwords.", "custom blacklist is working");
        equal(valResult.strength, 0, "strength is 0");
        ok(passInput.setPass("aF2#").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "pass error is removed");
        equal(valResult.strength, 1, "strength is set");
    });
    test("zero strength", function() {
        prepare({ acceptRate: 0, allowAnyChars: false, allowEmpty: false });
        runBasicWorkFlow();
        ok(passInput.setPass("qwerty").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "no error is generated for blacklisted pass");
        ok(!passInput.setPass("").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password is required.", "error is shown for empty pass");
        ok(!passInput.setPass("∂§").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Password contains bad characters: “∂§”.", "error is shown for bad symbols");
        ok(passInput.setPass("1").validatePass(), "pass is valid");
        equal(getWarnMsg(), null, "no error is generated for simple pass");
    });
    test("extra hard pass strength in strict mode", function () {
        prepare({ pattern: "abcd1234", acceptRate: 1, checkMode: PassField.CheckModes.STRICT });
        runBasicWorkFlow();
        ok(passInput.setPass("abcd1234").validatePass(), "pass is valid");
        equal(passFieldObj.getPassStrength(), 1, "strength is 1");
        ok(!passInput.setPass("abcdefghijklmnop").validatePass(), "long pass is not valid");
        equal(passFieldObj.getPassStrength(), 0.5, "strength is 0.75");
        ok(!passInput.setPass("a@3!").validatePass(), "short pass with extra symbols is not valid");
        equal(passFieldObj.getPassStrength(), 0.5, "strength is 0.5");
    });
    test("extra hard pass strength in moderate mode", function () {
        prepare({ pattern: "abcd1234", acceptRate: 1 });
        runBasicWorkFlow();
        ok(passInput.setPass("abcd1234").validatePass(), "pass is valid");
        equal(passFieldObj.getPassStrength(), 1, "strength is 1");
        ok(!passInput.setPass("abcdefghijkl").validatePass(), "not so long pass is not valid");
        equal(passFieldObj.getPassStrength(), 0.75, "not so long pass is not valid");
        ok(passInput.setPass("abcdefghijklmnop").validatePass(), "long pass is valid");
        equal(passFieldObj.getPassStrength(), 1, "long pass is valid");
        ok(passInput.setPass("a@3!").validatePass(), "short pass with extra symbols is valid");
        equal(passFieldObj.getPassStrength(), 1, "short pass with extra symbols is valid");
    });
    test("long pass with strict min length checking in moderate mode", function () {
        prepare({ pattern: "abcd1234", acceptRate: 0.5, length: { min: 7 } });
        runBasicWorkFlow();
        ok(!passInput.setPass("a@3!").validatePass(), "short pass with extra symbols is not valid");
        equal(passFieldObj.getPassStrength(), 0, "short pass with extra symbols is not valid");
        ok(!passInput.setPass("aBc12#").validatePass(), "short pass is not valid");
        equal(passFieldObj.getPassStrength(), 0, "short pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is too short (min. length: 8).", "correct length is generated in error");
        ok(passInput.setPass("abcd123").validatePass(), "minlength pass is valid");
        equal(passFieldObj.getPassStrength(), 0.875, "minlength pass is valid");
        ok(passInput.setPass("abcd1234").validatePass(), "long pass is valid");
        equal(passFieldObj.getPassStrength(), 1, "long pass is valid");
        ok(passInput.setPass("abcdefghijklmnop").validatePass(), "longer pass is valid");
        equal(passFieldObj.getPassStrength(), 1, "longer pass is valid");
    });
    test("character repetitions strength", function () {
        prepare({ pattern: "abcd", acceptRate: 0.1 });
        runBasicWorkFlow();
        ok(!passInput.setPass("aaaaaaaaaaaaaaa").validatePass(), "pass is not valid");
        equal(passFieldObj.getPassStrength(), 0, "pass is weak");
        equal(getWarnMsg(), "This password is weak: password consists of repeating characters.", "pass msg is assigned");
    });
    test("immediate validation on char deleting", function () {
        prepare({ pattern: "abcd", acceptRate: 1 });
        runBasicWorkFlow();
        var delKeys = ["{backspace}", "{del}"];
        for (var ix in delKeys) {
            if (delKeys.hasOwnProperty(ix)) {
                var delKey = delKeys[ix];
                ok(passInput.setPass("abcd").validatePass(), "pass is valid");
                getMainInput().simulate("key-sequence", {sequence: delKey});
                equal(passInput.val(), "abc", "last symbol is deleted");
                equal(getWarnMsg(), "This password is weak: password is too short (min. length: 4).", "pass msg is assigned after " + delKey + " key");
                ok(!passInput.validatePass(), "pass is not valid");
            }
        }
    });
    test("custom validation", function() {
        var valReturn = null;
        prepare({ validationCallback: function(el, res) { valResult = res; return valReturn; } });
        runBasicWorkFlow();

        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid and strong");

        valReturn = {};
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid and strong");
        ok(!getWarnMsg(), "pass msg not assigned");

        valReturn = { strength: null };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid but no message is provided");
        equal(getWarnMsg(), null, "pass msg not assigned");

        valReturn = { strength: null, messages: [] };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid but no message is provided");
        equal(getWarnMsg(), null, "pass msg not assigned");

        valReturn = { strength: null, messages: ["hello"] };
        ok(!passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Hello.", "pass msg assigned");

        valReturn = { strength: 0.1 };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is weak but no message is provided");
        equal(getWarnMsg(), null, "pass msg not assigned");

        valReturn = { strength: 0.1, messages: [] };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is weak but no message is provided");
        equal(getWarnMsg(), null, "pass msg not assigned");

        valReturn = { strength: 0.1, messages: ["hello"] };
        ok(!passInput.setPass(STRONG_PASS).validatePass(), "pass is weak");
        equal(getWarnMsg(), "This password is weak: hello.", "pass msg assigned");

        valReturn = { strength: 1 };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid and strong");
        ok(!getWarnMsg(), "pass msg not assigned");

        valReturn = { strength: 1, messages: ["ok"] };
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid and strong");
        ok(!getWarnMsg(), "pass msg not assigned");
    });
    test("with login field by id", function() {
        $("<input type=\"text\" id=\"my-login\" />").val(STRONG_PASS).appendTo("#qunit-fixture");
        prepare({
            nonMatchField: "my-login"
        });
        runBasicWorkFlow();
        ok(!passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is equal to login.", "pass msg assigned");
    });
    test("with login field by element", function() {
        var loginEl = $("<input type=\"text\" id=\"my-login\" />").val(STRONG_PASS).appendTo("#qunit-fixture")[0];
        prepare({
            nonMatchField: loginEl
        });
        runBasicWorkFlow();
        ok(!passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is equal to login.", "pass msg assigned");
    });
    test("with login field by jQuery selector", function() {
        var loginEl = $("<input type=\"text\" id=\"my-login\" />").val(STRONG_PASS).appendTo("#qunit-fixture");
        prepare({
            nonMatchField: loginEl
        });
        runBasicWorkFlow();
        ok(!passInput.setPass(STRONG_PASS).validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password is equal to login.", "pass msg assigned");
    });
    test("toggle pass masking", function() {
        prepare();
        runBasicWorkFlow();
        ok(getMainInput(), "pass input is visible");
        passInput.togglePassMasking();
        isMasked = !isMasked;
        ok(getMainInput(), "clear input is visible");
        passFieldObj.toggleMasking();
        isMasked = !isMasked;
        ok(getMainInput(), "pass input is visible");

        passInput.togglePassMasking(true);
        ok(getMainInput(),  "pass input is visible");

        isMasked = false;
        passInput.togglePassMasking(false);
        ok(getMainInput(), "clear input is visible");
        passInput.togglePassMasking(false);
        ok(getMainInput(), "clear input is visible");
    });
    test("custom wrap error class", function() {
        prepare({ errorWrapClassName: "my-cls-wrap" });
        runBasicWorkFlow();
        ok(!passInput.setPass("qwerty").validatePass(), "pass is not valid");
        ok(getWarnMsg(), "pass error is generated");
        ok(passInput.setPass(STRONG_PASS).validatePass(), "pass is valid");
        ok(!getWarnMsg(), "pass error is removed");
    });
    test("custom warn msg class", function() {
        prepare({ warnMsgClassName: "my-cls-warn" });
        runBasicWorkFlow();
    });
    test("disable rand btn", function() {
        prepare({ showGenerate: false });
        triggerEvent(passInput[0], "focus");
        ok(!btnGen, "rand btn is not visible");
        ok(btnMask && btnMask.is(":visible"), "mask btn is visible");
        runBasicWorkFlow();
    });
    test("disable rand and mask btns", function() {
        prepare({ showGenerate: false, showToggle: false });
        ok(!btnMask, "mask btn is not visible");
        ok(!btnGen, "rand btn is not visible");
        runBasicWorkFlow();
    });
    test("disable mask btn but enable rand btn", function() {
        prepare({ showGenerate: true, showToggle: false });
        triggerEvent(passInput[0], "focus");
        isMasked = true;
        ok(getMainInput(), "mode switched to clear input");
        ok(!btnMask, "mask btn is not visible");
        ok(btnGen && btnGen.is(":visible"), "rand btn is visible");
        runBasicWorkFlow();
    });
    test("disable warn msg", function() {
        prepare({ showWarn: false });
        runBasicWorkFlow();
        ok(!msgWarn, "msg warn is absent");
    });
    test("disable tip", function() {
        prepare({ showTip: false });
        runBasicWorkFlow();
        ok(!tip, "tip is absent");
    });
    test("clear by default", function() {
        var pass = "123";
        prepare({ isMasked: false }, {
            inputAttr: { value: pass }
        });
        isMasked = false;
        ok(getMainInput(), "mode switched to clear input");
        equal(getMainInput().val(), pass, "pass written to clear input");
    });
    test("locale override", function() {
        prepare({ locale: "de", localeMsg: { passTooShort: "bla-bla-bla" }, checkMode: PassField.CheckModes.STRICT });
        runBasicWorkFlow();
        ok(!passInput.setPass("1").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Dieses Passwort ist schwach: Passwort muss Buchstaben enthalten.<br/>Bla-bla-bla.", "localized error is generated");
        ok(!passInput.setPass("1aA!").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "Dieses Passwort ist schwach: bla-bla-bla.", "custom error is generated");
    });
    test("neutral locale when locale not found", function() {
        prepare({ locale: "xx", localeMsg: { passTooShort: "bla-bla-bla" }, checkMode: PassField.CheckModes.STRICT });
        runBasicWorkFlow();
        ok(!passInput.setPass("1").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: password must contain letters.<br/>Bla-bla-bla.", "localized error is generated");
        ok(!passInput.setPass("1aA!").validatePass(), "pass is not valid");
        equal(getWarnMsg(), "This password is weak: bla-bla-bla.", "custom error is generated");
    });
    test("autofocus attr check", function() {
        prepare(null, {
            inputAttr: {
                autofocus: ""
            }
        });
        ok(btnGen.is(":visible"), "rand btn is visible");
        ok(btnMask.is(":visible"), "mask btn is visible");
        runBasicWorkFlow();
    });
    test("max length is set", function() {
        prepare({ length: { max: 10 } });
        runBasicWorkFlow();
    });
    test("buttons are hidden when the pass is long", function() {
        prepare();
        passInput.setPass("***");
        triggerEvent(passInput[0], "focus");
        ok(btnMask.is(":visible"), "mask btn is visible when the pass is not long");
        ok(btnGen.is(":visible"), "mask btn is visible when the pass is not long");
        passInput.setPass("").simulate("key-sequence", { sequence: "*************************************************" });
        ok(!btnMask.is(":visible"), "mask btn is hidden when the pass is long");
        ok(!btnGen.is(":visible"), "mask btn is hidden when the pass is long");
        passInput.setPass("").simulate("key-sequence", { sequence: "***" });
        ok(btnMask.is(":visible"), "mask btn is visible again");
        ok(btnGen.is(":visible"), "mask btn is visible again");
        passInput.setPass("");
        runBasicWorkFlow();
    });
    test("events are triggered", function() {
        var evGeneratedSimple = [];
        var evGeneratedJquery = [];
        var evSwitchedSimple = [];
        var evSwitchedJquery = [];
        prepare({
            events: {
                generated: function(pass) { evGeneratedSimple.push(pass); },
                switched: function(isMasked) { evSwitchedSimple.push(isMasked); }
            }
        });
        passInput.on({
            "pass:generated": function(e, pass) { evGeneratedJquery.push(pass); },
            "pass:switched": function(e, isMasked) { evSwitchedJquery.push(isMasked); }
        });

        triggerEvent(passInput[0], "focus");
        ok(btnGen && btnGen.is(":visible"), "rand btn is visible");
        ok(btnMask && btnMask.is(":visible"), "mask btn is visible");

        btnMask.click();

        isMasked = false;
        ok(getMainInput(), "mode switched to clear input");
        equal(evSwitchedSimple.length, 1, "simple switched event is triggered");
        equal(evSwitchedSimple[0], false, "simple switched event is valid");
        equal(evSwitchedJquery.length, 1, "jQuery switched event is triggered");
        equal(evSwitchedJquery[0], false, "jQuery switched event is valid");

        btnGen.click();

        equal(evGeneratedSimple.length, 1, "simple generated event is triggered");
        equal(evGeneratedSimple[0], passInput.val(), "simple generated event is valid");
        equal(evGeneratedJquery.length, 1, "jQuery generated event is triggered");
        equal(evGeneratedJquery[0], passInput.val(), "jQuery generated event is valid");

        passInput.setPass("");

        runBasicWorkFlow();
    });
    test("error in events", function() {
        prepare({
            events: {
                generated: function() { throw "error"; },
                switched: function() { throw "error"; }
            }
        });
        passInput.on({
            "pass:generated": function() { throw "error"; },
            "pass:switched": function() { throw "error"; }
        });
        runBasicWorkFlow();
    });

    // ========================== init ==========================

    function prepare(options, testOptions) {
        testOptions = $.extend(true, {
            inputAttr: {
                id: "mypass",
                placeholder: "plch",
                maxlength: 32
            },
            wrapAttr: {
                id: "wrap"
            },
            isJquery: true
        }, testOptions);
        isMasked = !options || options.isMasked === undefined ? true : options.isMasked;
        errorWrapClassName = !options || options.errorWrapClassName === undefined ? "error" : options.errorWrapClassName;
        ieVersion = getVersionIE();

        fixture = $("#qunit-fixture");
        wrap = $("<div/>").attr(testOptions.wrapAttr).appendTo(fixture);
        passInput = $("<input type='password'/>").attr(testOptions.inputAttr).appendTo(wrap);
        anotherInput = $("<input/>").appendTo(fixture);
        supportsPlaceholders = "placeholder" in anotherInput[0];
        ok(supportsPlaceholders || ieVersion > 0 && ieVersion < 10, "placeholder is present or this is IE9");
        if (testOptions.isJquery) {
            passInput.passField(options);
            passFieldObj = passInput.data("PassField.Field");
        } else {
            passFieldObj = new PassField.Field(testOptions.inputAttr.id ? passInput.attr("id") : passInput[0], options);
        }
        ok(passFieldObj, "PassField object created");

        checkWrap(testOptions.wrapAttr, testOptions.inputAttr);
        checkPassInput(testOptions.inputAttr, options && options.length && options.length.max || null);
        checkClearInput(testOptions.inputAttr, options && options.length && options.length.max || null);
        checkBtnGen(options, testOptions.inputAttr);
        checkBtnMask(options, testOptions.inputAttr);
        checkMsgWarn(options);
        checkTip(options);
        checkPlaceholder(testOptions.inputAttr);
    }

    // ========================== initial checks ==========================

    function checkWrap(wrapAttr) {
        equal(wrap.attr("class"), addPrefix("wrap") +
            (ieVersion === 6 || ieVersion === 7 ? " a_pf-wrap-no-ib" : ""), "wrap class assigned to wrap");
        if (!wrapAttr.id)
            ok(!wrap.attr("id"), "wrap has not been assigned any id");
    }

    function checkPassInput(inputAttr, maxlength) {
        ok(passInput, "password input found");
        equal(passInput.attr("class"), addPrefix("txt-pass"), "class assigned to pass input");
        if (inputAttr.placeholder && supportsPlaceholders)
            equal(passInput.attr("placeholder"), inputAttr.placeholder, "placeholder assigned to pass input");
        if (inputAttr.maxlength)
            equal(passInput.attr("maxlength"), maxlength || inputAttr.maxlength, "maxlength assigned to pass input");
        ok(passInput.attr("id"), "pass input has id");
    }

    function checkClearInput(inputAttr, maxlength) {
        clearInput = $("input[type=text]", wrap);
        if (!clearInput.length || clearInput.attr("id") === passInput.attr("id")) {
            clearInput = null;
            return;
        }
        equal(clearInput.length, 1, "clear input found");
        equal(clearInput.attr("class"), addPrefix("txt-clear"), "class assigned to clear input");
        if (inputAttr.placeholder && supportsPlaceholders)
            equal(clearInput.attr("placeholder"), inputAttr.placeholder, "placeholder assigned to clear input");
        if (inputAttr.maxlength)
            equal(clearInput.attr("maxlength"), maxlength || inputAttr.maxlength, "maxlength assigned to clear input");
        ok(clearInput.attr("id"), "clear input has id");
    }

    function checkBtnGen(options, inputAttr) {
        btnGen = $("." + addPrefix("btn-gen"), wrap);
        equal(options && options.showGenerate !== undefined ? options.showGenerate : true, !!btnGen.length, "gen button as in options");
        if (!btnGen.length) {
            btnGen = null;
            return;
        }
        if (inputAttr.hasOwnProperty("autofocus"))
            ok(btnGen.is(":visible"), "gen button is not visible");
        else
            ok(!btnGen.is(":visible"), "gen button is visible");
    }

    function checkBtnMask(options, inputAttr) {
        btnMask = $("." + addPrefix("btn-mask"), wrap);
        equal(options && options.showToggle !== undefined ? options.showToggle : true, !!btnMask.length, "mask button as in options");
        if (!btnMask.length) {
            btnMask = null;
            return;
        }
        if (inputAttr.hasOwnProperty("autofocus"))
            ok(btnMask.is(":visible"), "mask button is not visible");
        else
            ok(!btnMask.is(":visible"), "mask button is visible");
    }

    function checkMsgWarn(options) {
        msgWarn = $("." + addPrefix("warn"), wrap);
        equal(options && options.showWarn !== undefined ? options.showWarn : true, !!msgWarn.length, "warn msg as in options");
        if (!msgWarn.length) {
            msgWarn = null;
            return;
        }
        var cls = "help-inline";
        if (options && options.warnMsgClassName !== undefined)
            cls = options.warnMsgClassName;
        if (cls)
            ok(msgWarn.hasClass(cls), "warn msg class assigned: " + cls);
        else
            ok(!msgWarn.hasClass(cls), "warn msg class not assigned");
        ok(!msgWarn.is(":visible") || !msgWarn.html(), "warn msg is not visible");
        equal(getWarnMsg(), null, "warn msg is not assigned");
    }

    function checkTip(options) {
        tip = $("." + addPrefix("tip"), wrap);
        equal(options && options.showTip !== undefined ? options.showTip : true, !!tip.length, "tip as in options");
        if (!tip.length) {
            tip = null;
            return;
        }
        ok(!tip.is(":visible"), "tip is not visible");
    }

    function checkPlaceholder(inputAttr) {
        fakePlaceholder = $("." + addPrefix("placeholder"));
        if (!fakePlaceholder.length) {
            fakePlaceholder = null;
        }
        if (fakePlaceholder)
            ok(!supportsPlaceholders, "fake placeholder if no placeholder support detected");
        if (inputAttr.placeholder && !supportsPlaceholders)
            ok(fakePlaceholder && fakePlaceholder.is(":visible"), "fake placeholder is present and visible");
    }

    // ========================== simple workflow for all cases ==========================

    function runBasicWorkFlow() {
        var input = getMainInput();

        triggerEvent(input[0], "focus");
        if (btnGen) {
            ok(btnGen.is(":visible"), "gen button is visible");
        }
        if (btnMask) {
            ok(btnMask.is(":visible"), "mask button is visible");
        }
        if (fakePlaceholder) {
            ok(fakePlaceholder.is(":visible"), "fake placeholder is visible on focus with no text");
        }

        var pass = "test-pass";
        input.simulate("key-sequence", { sequence: pass });
        equal(passInput.val(), pass, "pass input value changed");
        if (clearInput)
            equal(clearInput.val(), pass, "clear input value changed");

        if (btnMask) {
            var oldInputType = getMainInput().attr("type");
            isMasked = !isMasked;
            btnMask.simulate("click");
            ok(getMainInput().attr("type") !== oldInputType, "input switched");

            isMasked = !isMasked;
            btnMask.simulate("click");
            ok(getMainInput().attr("type") === oldInputType, "input switched back");
        }

        if (btnGen) {
            var wasMasked = isMasked;

            btnGen.simulate("click");
            isMasked = false;
            ok(getMainInput(), "clear input active after generation");
            equal(passInput.getPassValidationMessage(), null, "generated valid password");
            equal(passInput.getPassStrength(), 1, "generated valid password strength");

            if (wasMasked !== isMasked) {
                isMasked = wasMasked;
                passInput.togglePassMasking();
                equal(getMainInput().attr("id"), input.attr("id"), "switched back as before generation");
            }
        }
        if (fakePlaceholder) {
            ok(!fakePlaceholder.is(":visible"), "fake placeholder is hidden with text");
        }

        passInput.setPass("");
        equal(passInput.val(), "", "pass input value cleared");
        if (clearInput)
            ok(!clearInput.val(), "clear input value cleared");

        if (fakePlaceholder) {
            ok(fakePlaceholder.is(":visible"), "fake placeholder is visible on pass clear");
        }
    }

    // ========================== utility functions ==========================

    function getMainInput() {
        var input = $("input:visible", wrap);
        equal(input.length, 1, "only 1 input is visible");
        equal(input.attr("type"), isMasked ? "password" : "text", "visible input type is correct");
        return input;
    }

    function getWarnMsg() {
        var msg = passInput.getPassValidationMessage() || null;
        if (passFieldObj)
            equal(passFieldObj.getPassValidationMessage() || null, msg || null, "validation messages in dom and object are equal");
        if (msgWarn) {
            var msgWarnVisibleText = msgWarn.is(":visible") ? msgWarn.attr("title") || null : null;
            equal(msgWarnVisibleText, msg, "warning msg title is set");
            if (msg) {
                ok(msgWarnVisibleText, "warning msg is visible");
                if (errorWrapClassName)
                    ok(wrap.hasClass(errorWrapClassName), "wrap has error class: " + errorWrapClassName);
                if (tip)
                    ok(tip.is(":visible"), "tip is visible");
            } else {
                ok(!msgWarnVisibleText, "warning msg is not visible");
                if (errorWrapClassName)
                    ok(!wrap.hasClass(errorWrapClassName), "wrap has not error class: " + errorWrapClassName);
                if (tip)
                    ok(!tip.is(":visible"), "tip is not visible");
            }
        }
        return msg || null;
    }

    function getVersionIE() {
        var rv = -1;
        if (navigator.appName === "Microsoft Internet Explorer") {
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            var match = re.exec(navigator.userAgent);
            if (match !== null) {
                rv = parseFloat(match[1]);
            }
        }
        return rv;
    }

    function addPrefix(cls) {
        return ELEMENTS_PREFIX + cls;
    }

    function triggerEvent(el, eventName) {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else if (document.createEventObject) {// IE < 9
            event = document.createEventObject();
            event.eventType = eventName;
        }
        event.eventName = eventName;
        if (el.dispatchEvent) {
            el.dispatchEvent(event);
        } else if (el.fireEvent) {// IE < 9
            el.fireEvent("on" + event.eventType, event);// can trigger only real event (e.g. 'click')
        } else if (el[eventName]) {
            el[eventName]();
        } else if (el["on" + eventName]) {
            el["on" + eventName]();
        }
    }
});
