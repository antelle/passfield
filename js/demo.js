var refreshTimeout = null;
var helpMsgs = {
    pattern: "<code>pattern</code> is used to calculare password strength and is also used for password generation. Example: <br/>" +
        "<em>abc123</em> &ndash; good password must contain letters and numbers and be 6 characters long;<br/>" +
        "<em>aA</em> &ndash; it must contain letters and UPPERcase letters and be 2 characters long.",
    acceptRate: "<code>acceptRate</code> is used for password “weakness” checking. Password is considered “weak” if its rating is less.<br/>" +
        "Rating is calculated based on password length and characters in password.",
    allowEmpty: "<code>allowEmpty</code> defines whether validation error will be shown if the password field is blank.",
    allowAnyChars: "<code>allowAnyChars</code> controls whether the it is allowed to enter characters that are neigher letters, nor digits, nor symbols (try to enter <code>.</code> or <code>,</code> in this example).",
    isMasked: "Password will be initially masked if <code>isMasked</code> is true; otherwise it will be shown as cleartext.",
    showToggle: "<code>showToggle</code> enables user to toggle password masking with “&bull;&bull;&bull;/abc” button.",
    showGenerate: "<code>showGenerate</code> adds <div id='help-gen-btn'></div> button for random password generation. When the user clicks this button, password will be automatically shown in cleartext.",
    showWarn: "Warning (red text to the right of the field) is only shown if <code>showWarn</code> option is set to true. Otherwise it's your responsibility to show warnings.",
    showTip: "<code>showTip</code> enables help balloon with tips how to create a strong password. Tips are visible only when the field is focused. " +
        "If password generation is enabled, user will see the explanation, how to generate a password.",
    strengthCheckTimeout: "Passwords are checked not immediately but with after small timeout: <code>strengthCheckTimeout</code> milliseconds. " +
        "This ensures that if the user is typing a password, he will not see the warning until he has stopped typing. The user is less annoyed in such way.",
    blackList: "You can specify list of unwanted passwords in <code>blackList</code> parameter. User will see a warning that it's not the best idea to use this password. " +
        "By default, the list of top passwords is provided but can add additional items here.",
    locale: "All messages used in Pass*Field are defined in locales. You can select locale using <code>locale</code> parameter (2-letter ISO code, e.g. “en”). " +
        "By default (if you pass null or empty) the locale is read from browser settings but you can specify certain locale here. If the locale is not found, neutral language (English) will be used. Supported: en, de, fr, it, ru, ua, es, el, pt."
};
var oldSettings = "(none)";

$(function() {
    $("#frm-settings input").change(function() {
            if (refreshTimeout)
                clearTimeout(refreshTimeout);
            recreatePasswordField(readSettings());
        }).keyup(function() {
            if (refreshTimeout)
                clearTimeout(refreshTimeout);
            recreatePasswordField(readSettings());
        });
    $("#nav-code a").click(function(e) {
        e.preventDefault();
        $("#nav-code li").removeClass("active");
        $(this).closest("li").addClass("active");
        switchCode();
    });
    $(".help-inline[rel=tooltip]").popover({
        trigger: "hover",
        placement: function(pop, el) {
            if ($("#col-right").width() >= 500)
                return "right";
            var top = $(el).position().top - $(window).scrollTop();
            var spaceBelow = $(window).height() - top;
            if (spaceBelow > 300)
                return "bottom";
            return spaceBelow > top ? "bottom" : "top";
        },
        html: true,
        title: function(el) {
            return $(this).attr("for").substring(2);
        },
        content: function(el) {
            return helpMsgs[$(this).attr("for").substring(2)];
        }
    });

    fillDefaults();
    recreatePasswordField();
    switchCode();
});

function fillDefaults() {
    var def = PassField.Config.defaults;
    $.each(def, function (k, v) {
        var el = $("#s-" + k);
        if (el.is(":checkbox")) {
            el.prop("checked", !!v);
        } else {
            el.val(v);
        }
    });
}

function readSettings() {
    var result = {};
    var def = PassField.Config.defaults;
    $("#frm-settings input").each(function(k, el) {
        var settingName = $(el).attr("id").substr(2);
        var val = $(el).is(":checkbox") ? $(el).is(":checked") : $(el).val();
        if ($(el).attr("type") == "number")
            val = +val;
        result[settingName] = val;
        if (settingName == "blackList") {
            result[settingName] = val ? val.split(",") : null;
        }
    });
    return result;
}

function recreatePasswordField(settings) {
    var settingsStr = toJs(settings || {});
    if (oldSettings == settingsStr)
        return;
    oldSettings = settingsStr;

    var tpl = '<div id="mypass-wrap" class="control-group">\n' +
        '    <input type="password" id="mypass" \n' +
        '        placeholder="{}" />\n' +
        '</div>';
    var locale = settings && settings.locale || navigator.language && navigator.language.replace(/\-.*/g, "") || "en";
    var placeholder = (PassField.Config.locales[locale] || PassField.Config.locales["en"]).msg.pass;
    tpl = tpl.replace("{}", placeholder);

    $("#mypass-frm").html(tpl);
    $("#mypass").width(210);
    showScript(settingsStr);
    showHtml(tpl);
    prettyPrint();

    settings = $.extend({}, settings, {
        validationCallback: function(el, validateResult) {
            if (window.console && console.log)
                console.log("Validate. Strength = " + validateResult.strength, validateResult.messages)
            if ($(el).val() == "hello")
                return { strength: 0.5, messages: ["Hello! This is a custom error message"] };
            if ($(el).val() == "bad")
                return { strength: null, messages: ["Really bad password! This is a custom error message"] };
        }
    });

    $("#mypass").passField(settings);
    $("#mypass").on("pass:generated", function(e, pass) {
        console.log("pass:generated pass=" + pass);
    });
    $("#mypass").on("pass:switched", function(e, isMasked) {
        console.log("pass:switched isMasked=" + isMasked);
    });
    refreshTimeout = setTimeout(function() {
        refreshTimeout = null;
        $("#mypass-wrap input:visible").focus();
    }, 500);
}

function toJs(settings) {
    var settingsText = "";
    if (settings) {
        settingsText += "{\n";
        $.each(settings, function (k, v) {
            var hasValue = true;
            if ($.isArray(v)) {
                v = "[\"" + v.join("\", \"") + "\"]";
                hasValue = v != "[]";
            } else if (typeof v == "string") {
                hasValue = v != PassField.Config.defaults[k];
                v = "\"" + v + "\"";
            } else {
                hasValue = v != PassField.Config.defaults[k];
            }
            if (k == "blackList" && !v) {
                hasValue = false;
            }
            if (hasValue) {
                settingsText += "    " + k + ": " + v + "\n";
            }
        });
        settingsText += "}";
        if (settingsText == "{\n}")
            settingsText = "";
    }
    return settingsText;
}

function showScript(settingsText) {
    var text = '$("#mypass").passField(' + settingsText + ');'
    $("#pre-code-js-jq").text(text);
    text = 'var passField = \n        new PassField.Field("mypass"' + (settingsText ? ", " : "") + settingsText + ');'
    $("#pre-code-js-nojq").text(text);
}

function showHtml(template) {
    var text = '<script src="passfield.js"></script>\n' +
        '<link rel="stylesheet" href="passfield.css"/>\n' +
        '\n' +
        '<...>\n' +
        template;
    $("#pre-code-html").text(text);
}

function switchCode() {
    var type = $("#nav-code li.active").data("code")
    $("#pre-code pre").hide();
    $("#pre-code pre[data-code=" + type + "]").show();
}
