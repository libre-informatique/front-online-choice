var app = {

    // APPLICATION CONFIG
    config: {},

    // APPLICATION CORE MODULES
    core: {},

    // -------------------------------------------------------------------------
    // INIT APPLICATION AT LOAD TIME
    // -------------------------------------------------------------------------

    init: function () {

        // GET APP PARAMETERS

        $.get(appHostname + '/?getParameters=1', function (params) {
            moment.locale('fr');
            app.config = params;
            app.core.utils.init();
            app.core.events.init();

            app.core.history.add(app.ctrl.states.main);
        });

        // SESSION STARTED

        $(document).on('session.started', function () {
            app.core.ws.apiAuth();
            app.core.ui.initTemplates();
        });

        // ALL TEMPLATES LOADED

        $(document).on('templates.registered', function () {
            app.core.ui.plugins.init();
            app.core.ui.displayLoading(false);
            app.core.ui.init();
            app.ready();
        });
    },

    ready: function () {
        $(document).trigger('app.ready');
    },

    // -------------------------------------------------------------------------
    // REGISTER APPLICATION MODULE
    // -------------------------------------------------------------------------

    register: function (component) {
        $.extend(true, app, component);
        return app;
    }
};