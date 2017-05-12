$.extend(app, {
    ws: {
        apiAuth: function () {
            app.ws.call('GET', '/api/oauth/v2/token', {
                client_id: app.config.user,
                client_secret: app.config.secret,
                grant_type: 'password'
            }, function (res) {
//                console.info(res);
            }, function () {}, true);
        },
        userLogin: function (cb) {
            if (typeof cb === 'undefined')
                cb = function (res) {
                    app.session.loggedIn = true; // FOR DEBUG

                    $('#app').addClass('loggedIn');

                    $(document).trigger('show-events');
                };

//            app.ws.call('GET', '/customer', {
//                client_id: app.config.user,
//                client_secret: app.config.secret,
//                grant_type: 'password'
//            }, cb);

            cb();
        },
        getEvents: function () {

            // Define min and max interval for tabs
            var minInterval = new Date();

            minInterval.setHours(0, 0, 0, 0);

            var maxInterval = new Date();
            maxInterval.setHours(23, 59, 59, 0);
            maxInterval.setDate(minInterval.getDate() + 2);

            console.info(minInterval, maxInterval);

            var deffer = jQuery.Deferred();

            $.ajax({
                async: true,
                url: '/data/events.json',
                success: function (data) {
                    var events = data;

                    var out = {
                        tabs: [],
                        events: []
                    };

                    for (var i = 0; i <= 2; i++) {
                        var currentDay = new Date(minInterval.getTime());
                        currentDay.setDate(currentDay.getDate() + i);

                        currentDay = moment(currentDay);

                        out.tabs.push({
                            date: currentDay,
                            label: currentDay.format("dddd DD/MM"),
                            id: i,
                            eventsNumber: 0
                        });
                    }

                    $.each(events._embedded.items, function (i, event) {

                        $.each(event.manifestations, function (j, manif) {
                            var min = new Date(manif.startsAt);
                            var max = new Date(manif.endsAt);

                            // Check if we are in current date interval (today -> +2 days)
                            if (min > minInterval && max < maxInterval) {
                                event.toBeManaged = true;

                                if (typeof event.minDate === 'undefined' || min < event.minDate)
                                    event.minDate = min;
                                if (typeof event.maxDate === 'undefined' || max > event.maxDate)
                                    event.maxDate = max;
                            }
                        });

                        if (event.toBeManaged)
                            out.events.push(event);
                    });

                    deffer.resolve(out);
                }
            });

            return deffer;
        },
        call: function (method, action, data, callback, errorCallback, ignoreApiBaseUri) {

            if (typeof callback === 'undefined')
                callback = function (res, textStatus, jqXHR) {};

            if (typeof errorCallback === 'undefined')
                errorCallback = function (jqXHR, textStatus, errorThrown) {};

            if (typeof method === 'undefined')
                method = 'GET';

            if (typeof data === 'undefined')
                data = {};

            if (typeof ignoreBaseUrl === 'undefined')
                ignoreBaseUrl = false;

            var baseUrl =
                app.config.webservice.protocol +
                "://" +
                app.config.webservice.hostname +
                (ignoreApiBaseUri ? '' : app.config.webservice.apiBaseUri);

            $.ajax({
                url: baseUrl + action,
                method: method,
                data: data,
                success: function (response, textStatus, jqXHR) {
                    callback(JSON.parse(response), textStatus, jqXHR);
                },
                beforeSend: function (xhr) {
                    if (app.session.loggedIn) {
                        xhr.setRequestHeader('Authorization', app.session.token_type + " " + app.session.access_token);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }
    }
});