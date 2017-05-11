$.extend(app, {
    utils: {
        init: function () {
            Handlebars.registerHelper('ifForCurrentDay', function (event, day, options) {

                console.info('EVENT', event);
                console.info('DAY', day);
                console.info('COMPARE',day.isSameOrAfter(event.minDate, 'day'),day.isSameOrBefore(event.maxDate, 'day'));

                if (day.isSameOrAfter(event.minDate, 'day') && day.isSameOrBefore(event.maxDate, 'day')) {
                    return options.fn(this);
                }
                return options.inverse(this);
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