app.register({
    core: {
        session: {
            rememberMe: false,

            loggedIn: false,
            access_token: null,
            token_type: null,
            expires_in: 0,
            refresh_token: null,

            user: null,

            start: function () {
                if (localStorage.getItem(app.config.clientSessionName))
                    app.core.session.enableRememberMe();
                else
                    app.core.session.disableRememberMe();

                var currentSession = app.core.sessionStorage.get(app.config.clientSessionName);

                if (currentSession === null) {
                    app.core.session.save();
                } else {
                    app.core.session.reload();
                }
                $(document).trigger('session.started');
            },

            save: function () {
                if (app.core.sessionStorage.engine === null)
                    app.core.session.start();
                app.core.sessionStorage.set(app.config.clientSessionName, JSON.stringify(app.core.session));
            },

            destroy: function () {
                app.core.sessionStorage.remove(app.config.clientSessionName);
            },

            reload: function () {
                if (app.core.sessionStorage.engine === null)
                    app.core.session.start();
                var currentSession = app.core.sessionStorage.get(app.config.clientSessionName);

                if (currentSession !== null) {
                    currentSession = JSON.parse(currentSession);
                }

                $.extend(app.core.session, currentSession);
            },
            enableRememberMe: function () {
                app.core.sessionStorage.engine = localStorage;
                sessionStorage.removeItem(app.config.clientSessionName);
                app.core.session.rememberMe = true;
            },
            disableRememberMe: function () {
                app.core.sessionStorage.engine = sessionStorage;
                localStorage.removeItem(app.config.clientSessionName);
                app.core.session.rememberMe = false;
            },
            manageApiToken: function () {
                var defer = $.Deferred();

                if (app.core.sessionStorage.engine === null)
                    app.core.session.start();

                var now = new Date();

                if (typeof app.core.session.creationDate === 'undefined' || app.core.session.creationDate === null) {
                    app.core.ws.apiAuth()
                        .always(function () {
                            app.core.session.creationDate = now;

                            var tokenExpirationDate = new Date(now);
                            tokenExpirationDate.setSeconds(tokenExpirationDate.getSeconds() + parseInt(app.core.session.expires_in, 10));

                            app.core.session.tokenExpirationDate = tokenExpirationDate;
                            app.core.session.save();
                            defer.resolve();
                        });
                } else {
                    if (now > new Date(app.core.session.tokenExpirationDate)) {
                        app.core.ws.apiAuth()
                            .always(function () {
                                defer.resolve();
                            });
                    } else {
                        defer.resolve();
                    }
                }

                return defer;
            }
        },
        sessionStorage: {
            engine: null,
            get: function (key) {
                return app.core.sessionStorage.engine.getItem(key);
            },
            set: function (key, val) {
                var r = app.core.sessionStorage.engine.setItem(key, val);
                app.core.session.reload();
                return r;
            },
            remove: function (key) {
                return app.core.sessionStorage.engine.removeItem(key);
            }
        }
    }
});
