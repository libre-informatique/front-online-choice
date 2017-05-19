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
                        if (data.lifecycle === "create") {
                            data.user = null;
                            data.rememberMe = false;
                        }
                        $.extend(app.core.session, data);
                        app.core.session.save();

                        if (data.lifecycle === "create" && app.core.history.currentState.path !== app.core.ctrl.states.login.path) {
                            app.core.ctrl.login();
                        } else if (data.lifecycle === "refresh") {
                            app.core.history.currentCallable();
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
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
                    console.info(res);
                    var user = res.success.customer;
                    app.core.session.user = user;

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
            // PERFORM USER (CUSTOMER) LOGOUT
            // ---------------------------------------------------------------------

            userLogout: function () {
                return app.core.ws.call('POST', '/logout', {}).always(function () {
                    app.core.session.rememberMe = false;
                    app.core.session.user = null;
                    app.core.session.save();
                    app.core.history.disableBack = true;
                });
            },

            // ---------------------------------------------------------------------
            // REFRESH USER INFORMATIONS
            // ---------------------------------------------------------------------

            getUser: function (userId) {
                return app.core.ws.call('GET', '/customers/' + userId, {}, function (res) {
                    console.info(res, res.id);

                    app.core.session.user = res;
                    app.core.session.userId = res.id;
                    app.core.session.save();
                });
            },

            // ---------------------------------------------------------------------
            // UPDATE USER INFORMATIONS
            // ---------------------------------------------------------------------

            updateUser: function (form) {

                var formData =
                    $.extend(app.core.session.user, app.core.utils.formToObject(form.serializeArray()));

                return app.core.ws.call('POST', '/customers/' + app.core.session.user.id,
                    formData).then(function () {
                    app.core.ctrl.showUserProfile();
                });
            },

            // ---------------------------------------------------------------------
            // INTERNAL - CALL WRAPPER
            // ---------------------------------------------------------------------

            call: function (method, action, data, callback, errorCallback, ignoreApiBaseUri) {
                var defer = $.Deferred();

                var statusCode = {
                    0: function () {

                    },
                    302: function (response) {
                        if (app.config.debug) {
                            app.core.ui.toast('Appel non géré par l\'API', 'warning');
                        }
                    },
                    401: function (response) {
                        if (app.config.debug) {
                            app.core.ui.toast('Accès refusé (' + response.responseJSON.code + '): ' + response.responseJSON.message, 'warning');
                        }

                        if (response.responseJSON.message === "api key not valid") {
                            // TODO : manage token correctly
                        }

                    },
                    404: function (response) {
                        if (app.config.debug) {
                            app.core.ui.toast('Page non trouvée pour l\'URL : ' + baseUrl + action, 'warning');
                        }
                    },
                    500: function (response) {
                        if (app.config.debug) {
                            app.core.ui.toast('Le serveur à rencontré une erreur', 'warning');
                        }
                    }
                };

                app.core.session.manageApiToken()
                    .then(function () {
                        if (typeof callback === 'undefined')
                            callback = function (res, textStatus, jqXHR) {};

                        if (typeof errorCallback === 'undefined')
                            errorCallback = function (jqXHR, textStatus, errorThrown) {
                                statusCode[jqXHR.status](jqXHR);
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

                                if (jqXHR.status === 204)
                                    response = "{}";

                                if (typeof response !== 'object')
                                    response = JSON.parse(response);


                                if (response.hasOwnProperty('message') && response.message == "api key not valid") {
                                    app.core.ws.apiAuth();
                                }

                                callback(response, textStatus, jqXHR);
                                defer.resolve();
                            },
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', app.core.utils.ucfirst(app.core.session.token_type) + " " + app.core.session.access_token);
                                if (method === "POST")
                                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.info(jqXHR);
                                if (jqXHR.hasOwnProperty('responseJSON') && jqXHR.responseJSON.message === "api key not valid") {
                                    app.core.ws.apiAuth();
                                }

                                errorCallback(jqXHR, textStatus, errorThrown);
                                defer.reject();
                            }
                        });
                    }, function () {
                        if (app.core.history.currentState.path !== app.core.ctrl.states.login.path)
                            app.core.ctrl.login();
                    });

                return defer;
            }
        }
    }
});
