$.extend(app, {
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
                app.session.enableRememberMe();
            else
                app.session.disableRememberMe();

            var currentSession = app.storage.get(app.config.clientSessionName);

            if (currentSession === null) {
                app.session.save();
            } else {
                app.session.reload();
            }
            $(document).trigger('app.session.started');
        },

        save: function () {
            if (app.storage.engine === null)
                app.session.start();
            app.storage.set(app.config.clientSessionName, JSON.stringify(app.session));
        },

        destroy: function () {
            app.storage.remove(app.config.clientSessionName);
        },

        reload: function () {
            if (app.storage.engine === null)
                app.session.start();
            var currentSession = app.storage.get(app.config.clientSessionName);

            if (currentSession !== null) {
                currentSession = JSON.parse(currentSession);
            }

            $.extend(app.session, currentSession);
        },
        enableRememberMe: function () {
            app.storage.engine = localStorage;
            sessionStorage.removeItem(app.config.clientSessionName);
            app.session.rememberMe = true;
        },
        disableRememberMe: function () {
            app.storage.engine = sessionStorage;
            localStorage.removeItem(app.config.clientSessionName);
            app.session.rememberMe = false;
        },
        manageApiToken: function () {
            var defer = $.Deferred();

            if (app.storage.engine === null)
                app.session.start();

            var now = new Date();

            if (typeof app.session.creationDate === 'undefined' || app.session.creationDate === null) {
                app.ws.apiAuth()
                    .always(function () {
                        app.session.creationDate = now;

                        var tokenExpirationDate = new Date(now);
                        tokenExpirationDate.setSeconds(tokenExpirationDate.getSeconds() + parseInt(app.session.expires_in, 10));

                        app.session.tokenExpirationDate = tokenExpirationDate;
                        app.session.save();
                        defer.resolve();
                    });
            } else {
                if (now > new Date(app.session.tokenExpirationDate)) {
                    app.ws.apiAuth()
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
    storage: {
        engine: null,
        get: function (key) {
            return app.storage.engine.getItem(key);
        },
        set: function (key, val) {
            var r = app.storage.engine.setItem(key, val);
            app.session.reload();
            return r;
        },
        remove: function (key) {
            return app.storage.engine.removeItem(key);
        }
    }
});
