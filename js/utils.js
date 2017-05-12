$.extend(app, {
    utils: {
        init: function () {
            
            // -----------------------------------------------------------------
            // EVENTS TEMPLATE LOOP - IS FOR CURRENT DAY
            // -----------------------------------------------------------------
            
            Handlebars.registerHelper('ifForCurrentDay', function (event, tab, options) {
                if (tab.date.isSameOrAfter(event.minDate, 'day') && tab.date.isSameOrBefore(event.maxDate, 'day')) {
                    tab.eventsNumber++ ;
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
            
        },
        formToObject: function (formArray) {

            var returnArray = {};
            for (var i = 0; i < formArray.length; i++) {
                returnArray[formArray[i]['name']] = formArray[i]['value'];
            }
            return returnArray;
        }
    }
});

app.utils.init();