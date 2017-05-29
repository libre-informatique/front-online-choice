app.register({
    featureDiscovery: {

        initEvents: function () {
            $(document)
                .on('click', '.tap-target button.understood', function () {
                    var tap = $(this).closest('.tap-target');
                    app.featureDiscovery.hideFeatureDiscovery(tap.attr('id'), true);
                })

                .on('click', '.tap-target', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (!$(e.currentTarget).is('button')) {
                        $(e.currentTarget).tapTarget('close');
                    }
                })

                .on('ctrl.beforego', function () {
                    app.featureDiscovery.hideFeatureDiscovery();
                })
                ;
        },
        // -------------------------------------------------------------------------
        // SHOW FEATURE DISCOVERIES
        // -------------------------------------------------------------------------

        showFeatureDiscovery: function (id) {

            var elem = $('.tap-target');

            if (isDefined(id)) {
                elem = elem.filter('#' + id);
            }

            elem.each(function () {
                var id = $(this).attr('id');

                if (!app.featureDiscovery.__getInfosStorage().hasOwnProperty(id))
                    elem.tapTarget('open');
            });

        },

        // -------------------------------------------------------------------------
        // HIDE FEATURE DISCOVERIES
        // -------------------------------------------------------------------------

        hideFeatureDiscovery: function (id, dontshowagain) {
            var elem = null;
            if (!isDefined(id)) {
                elem = $('.tap-target');
            } else {
                elem = $('#' + id);
            }

            if (isDefined(dontshowagain) && dontshowagain) {
                app.featureDiscovery.__setInfosStorage(id);
            }

            elem.tapTarget('close');
        },

        // -------------------------------------------------------------------------
        // INTERNAL : MANAGE « DON'T SHOW AGAIN » FEATURE
        // -------------------------------------------------------------------------

        __getInfosStorage: function () {
            var infos = localStorage.getItem(app.config.clientSessionName + '_infos');

            if (infos === null)
                infos = '{}';

            return JSON.parse(infos);
        },
        __setInfosStorage: function (id) {
            var infos = app.featureDiscovery.__getInfosStorage();

            infos[id] = id;

            localStorage.setItem(app.config.clientSessionName + '_infos', JSON.stringify(infos));
        },
        __resetInfosStorage: function () {
            localStorage.setItem(app.config.clientSessionName + '_infos', '{}');
        }
    }
});