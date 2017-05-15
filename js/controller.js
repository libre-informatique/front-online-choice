$.extend(app, {
    ctrl: {

        // ---------------------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------------------

        login: function () {
            app.ctrl.go('login', {});
        },

        logout: function () {
            $('#app').removeClass('loggedIn');
            app.session.destroy();
            app.ctrl.go('login');
        },

        showUserProfile: function () {
            app.ws.getUser(app.session.user.id).then(function () {
                app.ctrl.render('userProfile', {user: app.session.user}, true);
            });
        },

        showEvents: function () {
            var events = app.ws.getEvents()
                .then(function (events) {
                    app.ctrl.render('mainTabs', events, true).then(function () {
                        app.ui.plugins.initTabs();
                        $('#tabs .tab:first-of-type a').trigger('click');
                    });
                }, function (error) {

                });
        },

        // ---------------------------------------------------------------------
        // INTERNAL METHODS
        // ---------------------------------------------------------------------

        go: function (templateName, data) {
            app.ctrl.render(templateName, data, true);
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

            return deffered.resolve();
        }
    }
});