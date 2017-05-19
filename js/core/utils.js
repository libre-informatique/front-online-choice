app.register({
    core: {
        utils: {
            init: function () {

                // -----------------------------------------------------------------
                // EVENTS TEMPLATE LOOP - IS FOR CURRENT DAY
                // -----------------------------------------------------------------

                Handlebars.registerHelper('ifForCurrentDay', function (event, tab, options) {
                    if (tab.date.isSameOrAfter(event.minDate, 'day') && tab.date.isSameOrBefore(event.maxDate, 'day')) {
                        tab.eventsNumber++;
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });

                // -----------------------------------------------------------------
                // EVENTS TEMPLATE LOOP - EVENT COUNTER
                // -----------------------------------------------------------------

                Handlebars.registerHelper('incrementCounter', function (counter) {
                    return counter + 1;
                });

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
                        default:
                            return options.inverse(this);
                    }
                });

                // -----------------------------------------------------------------
                // RENDER DATE / DATETIME
                // -----------------------------------------------------------------

                Handlebars.registerHelper('formatDate', function (dateStr, format) {
                    var date = moment(new Date(dateStr));
                    return date.format(format);
                });

                // -----------------------------------------------------------------
                // RENDER YES / NO BADGE
                // -----------------------------------------------------------------

                Handlebars.registerHelper('ouiNon', function (boolean) {
                    return (boolean ? '<span class="teal badge white-text">Oui</span>' : '<span class="red badge">Non</span>');
                });

            },
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
            ucfirst: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        }
    }
});