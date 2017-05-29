app.register({
    core: {
        ws: {

            // ---------------------------------------------------------------------
            // RENEW AND CHECK API TOKEN
            // ---------------------------------------------------------------------

            apiAuth: function () {
                var defer = $.Deferred();

                // TEST IF TOKEN IN SESSION IS VALID
                if (app.core.session.tokenIsValid()) {
                    // TOKEN IS VALID, SKIPPING RE-AUTH
                    defer.resolve();
                    return defer.promise();
                }

                // TOKEN IS NOT VALID, RE-AUTH
                $.ajax({
                    method: 'GET',
                    url: appHostname + '/',
                    crossDomain: true,
                    data: {
                        currentToken: app.core.session.access_token,
                        refreshToken: app.core.session.refresh_token
                    },
                    success: function (data) {
                        if (data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
                            app.core.ui.toast('API indisponible, veuillez rééssayer', 'error');
                            app.core.session.refresh_token = null;
                            app.core.session.save();
                            defer.reject();
                        } else {
                            if (data.lifecycle === "create") {
                                // TOKEN RECREATED, USER SESSION IS LOST
                                app.core.session.user = null;
                                app.core.session.rememberMe = false;

                                app.core.history.currentCallable = app.core.ctrl.login();
                            }

                            $.extend(app.core.session, data);
                            app.core.session.updateTokenExpirationDate();

                            if (data.lifecycle === "create" || data.code === 401) {
                                defer.reject();
                            }

                            var recall = app.core.history.currentCallable;

                            if (typeof recall === "function") {
                                // TOTAL
                                recall();
                            }
                        }
                        defer.resolve();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        app.core.ui.toast('API indisponible, veuillez rééssayer', 'error');
                    }
                });

                return defer.promise();
            },

            // ---------------------------------------------------------------------
            // PERFORM USER LOGIN
            // ---------------------------------------------------------------------

            userLogin: function (username, password, rememberMe, form) {
                return app.core.ws.call('POST', '/login', {
                    'email': username,
                    'password': password
                }, function (res) {
                    var user = res.success.customer;
                    app.core.session.user = user;

                    // USER HAS CHECKED REMEMBER ME ?
                    rememberMe == 'on' ?
                        app.core.session.enableRememberMe() :
                        app.core.session.disableRememberMe();

                    app.core.session.save();

                    $(document).trigger('user.logged.in');
                    app.core.history.disableBack = false;

                    // GO TO EVENTS LIST
                    app.core.ctrl.showEvents();
                }, function (res) {
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
                var defer = $.Deferred();
                
                app.core.ws.call('GET', '/customers/' + userId, {}, function (res) {
                    console.info(res.id);
                    if (typeof res.id !== 'undefined') {
                        app.core.session.user = res;
                        app.core.session.userId = res.id;
                        app.core.session.save();
                        defer.resolve(res);
                    } else {
                        defer.reject(res);
                        app.core.ctrl.logout();
                    }
                });
                
                return defer.promise();
            },

            // ---------------------------------------------------------------------
            // UPDATE USER INFORMATIONS
            // ---------------------------------------------------------------------

            updateUser: function (form) {
                var formData =
                    $.extend(app.core.session.user, app.core.utils.formToObject(form.serializeArray()));

                if (formData.hasOwnProperty('password_1')) {
                    formData.contact = {};
                    formData.contact.password = formData.password_1;
                    delete formData.password_1;
                    delete formData.password_2;
                }

                return app.core.ws.call('POST', '/customers/' + app.core.session.user.id,
                    formData).then(function () {
                    app.core.ctrl.showUserProfile();
                    $(document).trigger('user.logged.in');
                });
            },

            // ---------------------------------------------------------------------
            // INTERNAL - CALL WRAPPER
            // ---------------------------------------------------------------------

            call: function (method, action, data, callback, errorCallback, ignoreApiBaseUri) {
                var defer = $.Deferred();

                var statusCode = {
                    0: function () {
                        defer.reject();
                        return defer.promise();
                    },
                    302: function (response, defer) {
                        if (app.config.debug) {
                            app.core.ui.toast('Appel non géré par l\'API', 'warning');
                        }
                        defer.reject();
                        return defer.promise();
                    },
                    400: function (response, defer) {
                        if (app.config.debug) {
                            app.core.ui.toast('Echec de la requêteé (' + response.responseJSON.code + '): ' + response.responseJSON.message, 'warning');
                        }

                        defer.reject();
                        return defer.promise();
                    },
                    401: function (response, defer) {
                        if (app.config.debug) {
                            app.core.ui.toast('Accès refusé (' + response.responseJSON.code + '): ' + response.responseJSON.message, 'warning');
                        }

                        if (response.responseJSON.message === "Invalid API authentication") {
                            // Need force re-auth
                            app.core.session.tokenExpirationDate = null;
                            app.core.session.save();
                            app.core.ws.apiAuth().always(function () {
                                defer.resolve();
                            });

                            return defer.promise();
                        } else {
                            defer.reject();
                            return defer.promise();
                        }

                    },
                    404: function (response, defer) {
                        if (app.config.debug) {
                            app.core.ui.toast('Page non trouvée pour l\'URL : ' + baseUrl + action, 'warning');
                        }
                        defer.reject();
                        return defer.promise();
                    },
                    500: function (response, defer) {
                        if (app.config.debug) {
                            app.core.ui.toast('Le serveur à rencontré une erreur', 'warning');
                        }
                        defer.reject();
                        return defer.promise();
                    }
                };

                app.core.ws.apiAuth()
                    .then(function () {
                        if (!isDefined(callback))
                            callback = function (res, textStatus, jqXHR) {};

                        if (!isDefined(errorCallback))
                            errorCallback = function (jqXHR, textStatus, errorThrown) {

                            };

                        if (!isDefined(method))
                            method = 'GET';

                        if (!isDefined(data))
                            data = {};

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

                                callback(response, textStatus, jqXHR);
                                defer.resolve();
                            },
                            beforeSend: function (xhr) {
                                if (app.core.session.hasOwnProperty('access_token') && app.core.session.access_token !== null) {
                                    xhr.setRequestHeader('Authorization', app.core.utils.ucfirst(app.core.session.token_type) + " " + app.core.session.access_token);
                                }
                                if (method === "POST")
                                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                errorCallback(jqXHR, textStatus, errorThrown);
                                statusCode[jqXHR.status](jqXHR, defer);
                            }
                        });
                    }, function () {
                        if (app.core.history.currentState.path !== app.core.ctrl.states.login.path)
                            app.core.ctrl.login();
                    });

                return defer.promise();
            }
        }
    }
});
