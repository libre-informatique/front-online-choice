$.extend(app, {
    ws: {

        // ---------------------------------------------------------------------
        // RENEW API TOKEN
        // ---------------------------------------------------------------------

        apiAuth: function () {
            return $.ajax({
                method: 'GET',
                url: appHostname + '/',
                crossDomain: true,
                data: {
                    currentToken: app.session.access_token,
                    refreshToken: app.session.refresh_token
                },
                success: function (data) {
                    console.info(data);
                    alert('success apiAuth');
                    $.extend(app.session, data);
                    app.session.save();
                },
                arror: function (jqXHR, textStatus, errorThrown) {
                    alert('error apiAuth');
                    app.ui.toast('l\'API ne semble pas être disponible', 'error');
                }
            });
        },

        // ---------------------------------------------------------------------
        // PERFORM USER (CUSTOMER) LOGIN
        // ---------------------------------------------------------------------

        userLogin: function (username, password, rememberMe, form) {
            return app.ws.call('POST', '/login', {
                'email': username,
                'password': password
            }, function (res) {
                var user = res.success.customer;
                app.session.user = user;

                app.session.loggedIn = true;

                rememberMe == 'on' ?
                    app.session.enableRememberMe() :
                    app.session.disableRememberMe();

                app.session.save();

                $(document).trigger('user.logged.in');

                app.ctrl.showEvents();
            }, function (res) {

                // FOR DEV ONLY

                var user = {
                    "id": 399,
                    "email": "john.diggle@yahoo.com",
                    "firstName": "John",
                    "lastName": "Diggle",
                    "address": "55, Sunrise St.",
                    "zip": "F-29000",
                    "city": "Quimper",
                    "country": "France",
                    "phoneNumber": "+987654321",
                    "subscribedToNewsletter": true
                };
                app.session.user = user;

                app.session.loggedIn = true;

                rememberMe == 'on' ?
                    app.session.enableRememberMe() :
                    app.session.disableRememberMe();

                app.session.save();

                $(document).trigger('user.logged.in');

                app.ctrl.showEvents();

                // END FOR DEV ONLY

                form.find('input').addClass('invalid');
                app.ui.toast('Email et/ou mot de passe invalide', 'error');
            });
        },

        // ---------------------------------------------------------------------
        // REFRESH USER INFORMATIONS
        // ---------------------------------------------------------------------

        getUser: function (userId) {
            return app.ws.call('GET', '/customers/' + userId, {}, function (res) {
                app.session.user = res;
                app.session.userId = res.id;
                app.session.save();
            }, function (res) {

            });
        },

        // ---------------------------------------------------------------------
        // UPDATE USER INFORMATIONS
        // ---------------------------------------------------------------------

        updateUser: function (form) {

            var formData = app.utils.formToObject(form.serializeArray());

            console.info(formData);

            return;
            return app.ws.call('POST', '/customers/' + app.session.user.id, {}, function (res) {
                app.session.user = res;
                app.session.userId = res.id;
                app.session.save();
            }, function (res) {

            });
        },

        // ---------------------------------------------------------------------
        // GET EVENTS DATAS
        // ---------------------------------------------------------------------

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
                url: appHostname + '/data/events.json',
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

        // ---------------------------------------------------------------------
        // INTERNAL - CALL WRAPPER
        // ---------------------------------------------------------------------

        call: function (method, action, data, callback, errorCallback, ignoreApiBaseUri) {
            var defer = $.Deferred();

            app.session.manageApiToken()
                .then(function () {
                    if (typeof callback === 'undefined')
                        callback = function (res, textStatus, jqXHR) {};

                    if (typeof errorCallback === 'undefined')
                        errorCallback = function (jqXHR, textStatus, errorThrown) {
                            app.ui.displayLoading(false);
                            app.ui.toast(textStatus, 'error');
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

                    if (method === "POST") {
                        data = JSON.stringify(data);
                    }

                    $.ajax({
                        url: baseUrl + action,
                        method: method,
                        data: data,
                        crossDomain: true,
                        success: function (response, textStatus, jqXHR) {
                            app.ui.displayLoading(false);
                            if (typeof response !== 'object')
                                response = JSON.parse(response);
                            callback(response, textStatus, jqXHR);
                            defer.resolve();
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', app.utils.ucfirst(app.session.token_type) + " " + app.session.access_token);
                            xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            app.ui.displayLoading(false);
                            errorCallback(jqXHR, textStatus, errorThrown);
                            defer.reject();
                        }
                    });
                });

            return defer;
        }
    }
});
