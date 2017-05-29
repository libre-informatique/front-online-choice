app.register({
    core: {
        utils: {
            init: function () {

                // -----------------------------------------------------------------
                // HANDLEBAR MISSING IF
                // -----------------------------------------------------------------

                Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

                    switch (operator) {
                        case '==':
                            return (v1 == v2) ? options.fn(this) : options.inverse(this);
                        case '===':
                            return (v1 === v2) ? options.fn(this) : options.inverse(this);
                        case '!=':
                            return (v1 != v2) ? options.fn(this) : options.inverse(this);
                        case '!==':
                            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                        case '<':
                            return (v1 < v2) ? options.fn(this) : options.inverse(this);
                        case '<=':
                            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                        case '>':
                            return (v1 > v2) ? options.fn(this) : options.inverse(this);
                        case '>=':
                            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                        case '&&':
                            return (v1 && v2) ? options.fn(this) : options.inverse(this);
                        case '||':
                            return (v1 || v2) ? options.fn(this) : options.inverse(this);
                        case 'null':
                            return (v1 === null) ? v2.fn(this) : v2.inverse(this);
                        case 'not null':
                            return (v1 !== null) ? v2.fn(this) : v2.inverse(this);
                        default:
                            return options.inverse(this);
                    }
                });

                // -----------------------------------------------------------------
                // RENDER DATE / DATETIME
                // -----------------------------------------------------------------

                Handlebars.registerHelper('formatDate', function (dateStr, format) {
                    var date = moment(dateStr);
                    return date.format(format);
                });

                // -----------------------------------------------------------------
                // RENDER YES / NO BADGE
                // -----------------------------------------------------------------

                Handlebars.registerHelper('ouiNon', function (boolean) {
                    return (boolean ? '<span class="teal badge white-text">Oui</span>' : '<span class="red badge">Non</span>');
                });

                // -----------------------------------------------------------------
                // EXPOSE CONFIG OBJECT
                // -----------------------------------------------------------------

                Handlebars.registerHelper('config', function (path) {
                    return app.core.utils.deepFind(app.config, path);
                });

            },

            // ---------------------------------------------------------------------
            // CONVERT FORM (AFTER .serializeArray() ) TO OBJECT
            // ---------------------------------------------------------------------

            formToObject: function (formArray) {

                var returnArray = {};
                for (var i = 0; i < formArray.length; i++) {
                    var value = formArray[i]['value'];

                    if (value == "true" || value == "false")
                        value = (value == "true");

                    returnArray[formArray[i]['name']] = value;
                }
                return returnArray;
            },

            // ---------------------------------------------------------------------
            // PUTS FIRST LETTER OF STRING IN UPPER CASE
            // ---------------------------------------------------------------------

            ucfirst: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },

            // ---------------------------------------------------------------------
            // WRAPPER FOR MOMENT JS PARSE DATE
            // ---------------------------------------------------------------------

            parseApiDate: function (string) {
                return moment(string).toDate();
            },

            // ---------------------------------------------------------------------
            // TOOLS TO LOAD IMAGES VIA AJAX
            // ---------------------------------------------------------------------

            loadImageAjax: function () {
                $('*[data-image]:not(img)').each(function () {
                    $.ajax({
                        url: $(this).attr('data-image'),
                        success: function (res) {
                            $(this).css('background-image', 'url(' + $(this).attr('data-image') + ')');
                            $(this).attr('data-imageLoaded', true);
                        }
                    });
                });
            },

            // ---------------------------------------------------------------------
            // HELPER TO QUERY OBJECT WITH XPATH LIKE
            // ---------------------------------------------------------------------

            deepFind: function (obj, path) {
                var paths = path.split('.')
                    , current = obj
                    , i;

                for (i = 0; i < paths.length; ++i) {
                    if (current[paths[i]] === 'undefined' || current[paths[i]] === null) {
                        return null;
                    } else {
                        current = current[paths[i]];
                    }
                }
                return current;
            }
        }
    }
});

// ---------------------------------------------------------------------
// HELPER FUNCTION TO AVOID « typeof var !== 'undefined' » EVERY WHERE
// ---------------------------------------------------------------------

function isDefined(variable) {
    return typeof variable !== 'undefined';
}