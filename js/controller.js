$.extend(app, {
    ctrl: {
        states: {
            login: {
                path: "login",
                title: "Connexion"
            },
            showUserProfile: {
                path: "profile",
                title: "Profil"
            },
            editUserProfile: {
                path: "profile/edit",
                title: "Modifier mon profil"
            },
            showEvents: {
                path: "events",
                title: "Évènements"
            }
        },

        // ---------------------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------------------

        login: function () {
            app.ctrl.go('login', {}).then(function () {
                app.history.add(app.ctrl.states.login);
            });
        },

        logout: function () {
            $('#app').removeClass('loggedIn');

            app.session.rememberMe = false;
            app.session.loggedIn = false;
            app.session.user = null;
            app.session.save();

            app.history.disableBack = true;

            app.ctrl.login();
            $(document).trigger('user.logged.out');
        },

        showUserProfile: function () {
            app.ws.getUser(app.session.user.id).then(function () {
                app.ctrl.go('userProfile', {
                    user: app.session.user
                }).then(function () {
                    app.history.add(app.ctrl.states.showUserProfile);
                });
            });
        },

        editUserProfile: function () {
            app.ws.getUser(app.session.user.id).then(function () {
                app.ctrl.go('editUserProfile', {
                    user: app.session.user
                }).then(function () {
                    app.history.add(app.ctrl.states.editUserProfile);
                });
            });
        },

        showEvents: function () {
            if (app.history.currentState !== app.ctrl.states.showEvents) {
                var events = app.ws.getEvents()
                    .then(function (events) {
                        app.ctrl.render('mainTabs', events, true).then(function () {
                            app.ui.plugins.initTabs();
                            $('#tabs .tab:first-of-type a').trigger('click');
                            app.history.add(app.ctrl.states.showEvents);
                        });
                    }, function (error) {});
            }
        },

        // ---------------------------------------------------------------------
        // INTERNAL METHODS
        // ---------------------------------------------------------------------

        go: function (templateName, data) {
            return app.ctrl.render(templateName, data, true);
        },

        render: function (templateName, data, clearContent) {
            var deffered = $.Deferred();

            if (typeof data === 'undefined')
                data = {};
            if (typeof clearContent === 'undefined')
                clearContent = false;

            if (clearContent)
                $('#app div.content handlebar-placeholder').html('');

            var compiled = Handlebars.compile(app.ui.templates[templateName].data);

            app.ui.applyTemplate(templateName, compiled(data));

            $('.dropdown-button').dropdown('close');

            return deffered.resolve();
        }
    }
});
