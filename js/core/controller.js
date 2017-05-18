app.register({
    core: {
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
                app.core.ctrl.go('login', {}).then(function () {
                    app.core.history.add(app.core.ctrl.states.login);
                });
            },

            logout: function () {
                $('#app').removeClass('loggedIn');

                app.core.session.rememberMe = false;
                app.core.session.loggedIn = false;
                app.core.session.user = null;
                app.core.session.save();

                app.core.history.disableBack = true;

                app.core.ctrl.login();
                $(document).trigger('user.logged.out');
            },

            showUserProfile: function () {
                app.core.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('userProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.core.ctrl.states.showUserProfile);
                    });
                });
            },

            editUserProfile: function () {
                app.core.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('editUserProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.core.ctrl.states.editUserProfile);
                    });
                });
            },

            showEvents: function () {
                if (app.core.history.currentState !== app.core.ctrl.states.showEvents) {
                    var events = app.core.ws.getEvents()
                        .then(function (events) {
                            app.core.ctrl.render('mainTabs', events, true).then(function () {
                                app.core.ui.plugins.initTabs();
//                                $('#tabs .tab:first-of-type a').trigger('click');
                                app.core.history.add(app.core.ctrl.states.showEvents);
                            });
                        }, function (error) {});
                }
            },

            // ---------------------------------------------------------------------
            // INTERNAL METHODS
            // ---------------------------------------------------------------------

            go: function (templateName, data) {
                return app.core.ctrl.render(templateName, data, true);
            },

            render: function (templateName, data, clearContent) {
                var deffered = $.Deferred();

                if (typeof data === 'undefined')
                    data = {};
                if (typeof clearContent === 'undefined')
                    clearContent = false;

                if (clearContent)
                    $('#app div.content handlebar-placeholder').html('');

                var compiled = Handlebars.compile(app.core.ui.templates[templateName].data);

                app.core.ui.applyTemplate(templateName, compiled(data));

                $('.dropdown-button').dropdown('close');

                return deffered.resolve();
            }
        }
    }
});
