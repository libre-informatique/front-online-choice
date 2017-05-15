$.extend(app, {
    session: {
        rememberMe: false,

        loggedIn: false,
        access_token: null,
        token_type: "bearer",
        expires_in: 0,
        refresh_token: null,

        user: null,

        start: function () {

            if (localStorage.getItem(app.config.clientSessionName))
                app.session.rememberMe = true;

            var currentSession = app.storage.get(app.config.clientSessionName);

            console.info('START', currentSession);
            if (currentSession === null) {
                currentSession = app.session;
                app.session.save();
                console.info('START', currentSession);
            } else {
                app.session.reload();
            }
        },

        save: function () {
            console.info('SAVE', app.session);
            app.storage.set(app.config.clientSessionName, JSON.stringify(app.session));
        },

        destroy: function () {
            app.storage.remove(app.config.clientSessionName);
        },

        reload: function () {
            var currentSession = app.storage.get(app.config.clientSessionName);
            if (currentSession !== null) {
                currentSession = JSON.parse(currentSession);
            }

            $.extend(app.session, currentSession);
        },
        enableRememberMe: function () {
            sessionStorage.removeItem(app.config.clientSessionName);
            app.session.rememberMe = true;
            app.session.start();
        },
        disableRememberMe: function () {
            localStorage.removeItem(app.config.clientSessionName);
            app.session.rememberMe = false;
            app.session.start();
        }
    },
    storage: {
        engine: sessionStorage,
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
