$.extend(app, {
    ws: {
        apiAuth: function () {
            app.ws.call('GET', '/api/oauth/v2/token', {
                client_id: app.config.user,
                client_secret: app.config.secret,
                grant_type: 'password'
            }, function (res) {
                console.info(res);
            }, function () {}, true);
        },
        userLogin: function () {
            app.ws.call('GET', '/customer', {
                client_id: app.config.user,
                client_secret: app.config.secret,
                grant_type: 'password'
            }, function (res) {
                console.info(res);
            });
        },
        getEvents: function () {

            var minInterval = new Date();
            var maxInterval = new Date();
            maxInterval.setDate(minInterval.getDate() + 2);

            console.info(minInterval, maxInterval);

            return $.get('/data/events.json', function (data) {
//                var events = JSON.parse(data);
                var events = data;

                $.each(events._embedded.items, function (i, item) {
                    $.each(item.manifestations, function (j, manif) {
                        var min = new Date(manif.startsAt);
                        var max = new Date(manif.endsAt);

                        if (min > minInterval && max < maxInterval) {
                            console.info('In interval');
                        }
                    });
                });

                return events;
            });
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