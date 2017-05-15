$.extend(app, {
    ws: {
        apiAuth: function () {
            return $.ajax({
                method: 'GET',
                async: true,
                url: '/',
                crossDomain: true,
                data: {
                    currentToken: app.session.access_token,
                    refreshToken: app.session.refresh_token
                },
                success: function (data) {
                    $.extend(app.session, data);
                    app.session.save();
                },
                arror: function (err) {
                    app.ui.toast('l\'API ne semble pas être disponible');
                }
            });
        },
        userLogin: function (username, password, rememberMe, form) {
            app.ui.toggleLoading();

            return app.ws.call('POST', '/login', {
                'email': username,
                'password': password
            }, function (res) {
                app.session.user = res.success.customer;
                app.session.save();

                if (rememberMe == 'on') {
                    app.session.enableRememberMe();
                } else {
                    app.session.disableRememberMe();
                }

                $('#app').addClass('loggedIn');

                app.ctrl.showEvents();
                app.ui.toggleLoading();
                app.session.save();
            }, function (res) {
                form.find('input').addClass('invalid');
                app.ui.toast('Email et/ou mot de passe invalide');
                app.ui.toggleLoading();
            });
        },
        getUser: function (userId) {
            return app.ws.call('GET', '/customers/' + userId, {}, function (res) {
                app.session.user = res;
                app.session.userId = res.id;
                app.session.save();
            }, function (res) {

            });
        },
        getEvents: function () {

            // Define min and max interval for tabs
            var minInterval = new Date();

            minInterval.setHours(0, 0, 0, 0);

            var maxInterval = new Date();
            maxInterval.setHours(23, 59, 59, 0);
            maxInterval.setDate(minInterval.getDate() + 2);

            var deffer = jQuery.Deferred();

            $.ajax({
                async: true,
                url: './data/events.json',
                crossDomain: true,
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

            app.session.manageApiToken();

            if (typeof callback === 'undefined')
                callback = function (res, textStatus, jqXHR) {};

            if (typeof errorCallback === 'undefined')
                errorCallback = function (jqXHR, textStatus, errorThrown) {
                    app.ui.toggleLoading(true);
                    app.ui.toast(textStatus);
                };

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

            return $.ajax({
                url: baseUrl + action,
                method: method,
                data: data,
                dataType: 'json',
                crossDomain: true,
                success: function (response, textStatus, jqXHR) {
                    if (typeof response !== 'object')
                        response = JSON.parse(response);
                    callback(response, textStatus, jqXHR);
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', app.utils.ucfirst(app.session.token_type) + " " + app.session.access_token);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            });
        }
    }
});