app.register({
    webservice: {
        initEvents: function() {
            $(document)
                .on('session.started', function() {
                    app.core.ws.apiAuth();
                })
                // -------------------------------------------------------------
                // AJAX SPINNER
                // -------------------------------------------------------------

                .ajaxStart(function() {
                    if (app.isReady)
                        app.core.ui.displayAjaxLoading();
                })

                .ajaxStop(function() {
                    if (app.isReady)
                        app.core.ui.displayAjaxLoading(false);
                });
        }
    },
    core: {
        ws: {

            // ---------------------------------------------------------------------
            // RENEW AND CHECK API TOKEN
            // ---------------------------------------------------------------------

            apiAuth: function() {
                var defer = $.Deferred();

                // TEST IF TOKEN IN SESSION IS VALID
                if (app.core.session.tokenIsValid()) {
                    // TOKEN IS VALID, SKIPPING RE-AUTH
                    defer.resolve();
                    return defer.promise();
                }

                // TOKEN IS NOT VALID, RE-AUTH
                $.ajax({
                    method: 'POST',
                    url: appHostname + '/',
                    crossDomain: true,
                    data: {
                        currentToken: app.core.session.access_token !== null ? app.core.session.access_token : 'null',
                        refreshToken: app.core.session.refresh_token
                    },
                    success: function(data) {
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

                                app.core.history.currentCallable = app.ctrl.login();
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
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.core.ui.toast('API indisponible, veuillez rééssayer', 'error');
                    }
                });

                return defer.promise();
            },
        },
        session: {
            rememberMe: false,

            loggedIn: false,
            access_token: null,
            token_type: null,
            expires_in: 0,
            refresh_token: null,

            user: null,

            enableRememberMe: function() {
                app.core.sessionStorage.engine = localStorage;
                sessionStorage.removeItem(app.config.clientSessionName);
                app.core.session.rememberMe = true;
            },
            disableRememberMe: function() {
                app.core.sessionStorage.engine = sessionStorage;
                localStorage.removeItem(app.config.clientSessionName);
                app.core.session.rememberMe = false;
            },
        },
        ui: {
            // -------------------------------------------------------------------------
            // SHOW BIG LOADER IN CONTENT
            // -------------------------------------------------------------------------

            displayAjaxLoading: function(show) {
                if (!isDefined(show))
                    show = true;
                var loader = $('#mainLoader');

                if (show === true)
                    loader.show();
                else
                    loader.hide();
            },
        }
    }
});
