var app = {
    config: {},
    core: {},
    init: function () {
        $.get(appHostname + '/?getParameters=1', function (params) {
            moment.locale('fr');
            app.config = params;
            app.core.utils.init();
            app.core.events.init();
            app.core.session.start();

            app.core.history.add({
                path: "",
                title: app.config.applicationName
            });
        });

        $(document).on('session.started', function () {
            app.core.session.manageApiToken();
            app.core.ui.initTemplates();
        });

        $(document).on('templates.registered', function () {
            app.core.ui.plugins.init();
            app.core.ui.displayLoading(false);
            app.core.ui.init();
        });
    },
    save: function () {
        //Todo send final choices to the server
        alert('Choix sauvegardés');
    },
    register: function (component) {
        $.extend(true, app, component);
        return app;
    }
};
