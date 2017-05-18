app.register({
    core: {
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
                        currentToken: app.core.session.access_token,
                        refreshToken: app.core.session.refresh_token
                    },
                    success: function (data) {
                        $.extend(app.core.session, data);
                        app.core.session.save();
                    },
                    arror: function (jqXHR, textStatus, errorThrown) {
                        app.core.ui.toast('l\'API ne semble pas être disponible', 'error');
                    }
                });
            },

            // ---------------------------------------------------------------------
            // PERFORM USER (CUSTOMER) LOGIN
            // ---------------------------------------------------------------------

            userLogin: function (username, password, rememberMe, form) {
                return app.core.ws.call('POST', '/login', {
                    'email': username,
                    'password': password
                }, function (res) {
                    var user = res.success.customer;
                    app.core.session.user = user;

                    app.core.session.loggedIn = true;

                    rememberMe == 'on' ?
                        app.core.session.enableRememberMe() :
                        app.core.session.disableRememberMe();

                    app.core.session.save();

                    $(document).trigger('user.logged.in');
                    app.core.history.disableBack = false;

                    app.core.ctrl.showEvents();
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
                    app.core.session.user = user;

                    app.core.session.loggedIn = true;

                    rememberMe == 'on' ?
                        app.core.session.enableRememberMe() :
                        app.core.session.disableRememberMe();

                    app.core.session.save();

                    $(document).trigger('user.logged.in');
                    app.core.history.disableBack = false;

                    app.core.ctrl.showEvents();

                    // END FOR DEV ONLY

                    form.find('input').addClass('invalid');
                    app.core.ui.toast('Email et/ou mot de passe invalide', 'error');
                });
            },

            // ---------------------------------------------------------------------
            // REFRESH USER INFORMATIONS
            // ---------------------------------------------------------------------

            getUser: function (userId) {
                return app.core.ws.call('GET', '/customers/' + userId, {}, function (res) {
                    app.core.session.user = res;
                    app.core.session.userId = res.id;
                    app.core.session.save();
                }, function (res) {

                });
            },

            // ---------------------------------------------------------------------
            // UPDATE USER INFORMATIONS
            // ---------------------------------------------------------------------

            updateUser: function (form) {

                var formData = app.core.utils.formToObject(form.serializeArray());

                console.info(formData);

                return;
//            return app.core.ws.call('POST', '/customers/' + app.core.session.user.id, {}, function (res) {
//                app.core.session.user = res;
//                app.core.session.userId = res.id;
//                app.core.session.save();
//            }, function (res) {
//
//            });
            },

            // ---------------------------------------------------------------------
            // GET EVENTS DATAS
            // ---------------------------------------------------------------------

            getEvents: function () {

                // Define min and max interval for tabs
                var minInterval = moment(new Date()).startOf('week');

                minInterval.hours(0).minutes(0).seconds(0).milliseconds(0);

                var maxInterval = moment(new Date()).endOf('week').subtract(2, 'days');
                maxInterval.hours(23).minutes(59).seconds(59).milliseconds(999);

                var deffer = jQuery.Deferred();

                $.ajax({
                    async: true,
                    url: appHostname + '/data/events.json',
                    success: function (data) {
                        var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
                        deffer.resolve(events);
                    }
                });

                return deffer;
            },

            // ---------------------------------------------------------------------
            // CREATE CART
            // ---------------------------------------------------------------------

            createCart: function () {
                var deffer = jQuery.Deferred();

                app.core.ws.call('POST', '/transaction', {localeCode: 'fr_FR'}, function (res) {
                    deffer.resolve(res);
                }, function (jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible de créer le panier', 'error');
                    deffer.reject();
                });

                return deffer;
            },

            addToCart: function (item) {
                var deffer = jQuery.Deferred();

                app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items', {
                    "type": "ticket",
                    "declinationId": 52,
                    "quantity": 1,
                    "priceId": 3
                }, function (res) {
                    deffer.resolve(res);
                }, function (jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible d\'ajouter un élément au panier', 'error');
                    deffer.reject();
                });

                return deffer;
            },

            // ---------------------------------------------------------------------
            // INTERNAL - CALL WRAPPER
            // ---------------------------------------------------------------------

            call: function (method, action, data, callback, errorCallback, ignoreApiBaseUri) {
                var defer = $.Deferred();

                app.core.session.manageApiToken()
                    .then(function () {
                        if (typeof callback === 'undefined')
                            callback = function (res, textStatus, jqXHR) {};

                        if (typeof errorCallback === 'undefined')
                            errorCallback = function (jqXHR, textStatus, errorThrown) {
                                app.core.ui.displayLoading(false);
                                app.core.ui.toast(textStatus, 'error');
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
                                if (typeof response !== 'object')
                                    response = JSON.parse(response);
                                callback(response, textStatus, jqXHR);
                                defer.resolve();
                            },
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', app.core.utils.ucfirst(app.core.session.token_type) + " " + app.core.session.access_token);
                                if (method === "POST")
                                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                errorCallback(jqXHR, textStatus, errorThrown);
                                defer.reject();
                            }
                        });
                    });

                return defer;
            }
        }
    }
});
