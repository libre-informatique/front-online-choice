app.register({
    ctrl: {

        // ---------------------------------------------------------------------
        // STATES
        // ---------------------------------------------------------------------

        states: {
            main: {
                path: "",
                title: app.config.applicationName
            }
        },

        // ---------------------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------------------

    },
    core: {
        ctrl: {

            // ---------------------------------------------------------------------
            // INTERNAL METHODS
            // ---------------------------------------------------------------------

            go: function (templateName, data) {
                $(document).trigger('ctrl.beforego');
                return app.core.ctrl.render(templateName, data, true);
            },

            render: function (templateName, data, clearContent) {
                var defer = $.Deferred();

                $(document).trigger('ctrl.prerender');

                if (!isDefined(data))
                    data = {};
                if (!isDefined(clearContent))
                    clearContent = false;

                if (clearContent) {
                    app.core.ui.clearContent();
                    app.core.ui.displayContentLoading(true);
                    app.featureDiscovery.hideFeatureDiscovery();
                }

                var compiled = Handlebars.compile(app.core.ui.templates[templateName].data);

                app.core.ui.applyTemplate(templateName, compiled(data));

                $('.dropdown-button').dropdown('close');

                $(document).trigger('ctrl.postrender');

                defer.resolve();

                return defer.promise();
            }
        }
    }
});