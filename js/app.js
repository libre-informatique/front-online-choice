var app = {
    config: {},
    init: function () {
        $.get('data/parameters.json', function (params) {
            moment.locale('fr');
            app.config = params;
            app.ui.initTemplates();
            app.ui.init();
        });
    },
    ui: {
        templates: {},
        modal: null,
        templatesCallbacks: {
            initNavbar: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.navbar.data);

                app.ui.applyTemplate('navbar', compiled({
                    applicationName: app.config.applicationName
                }));
            },
            initLogin: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.login.data);

                app.ui.applyTemplate('login', compiled({}));
            },
            initTabs: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.mainTabs.data);

                app.ui.applyTemplate('mainTabs', compiled(data));

                $('#tabs .tab:first-of-type a').trigger('click');
            },
            initMainTabsContent: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.mainTabsContent.data);

                app.ui.applyTemplate('mainTabsContent', compiled(data));


            },
            initPeriods: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.periods.data);

                app.ui.applyTemplate('mainTabsContent', compiled(events));
            }
        },
        init: function () {
            app.ui.modal = $('#confirm-modal');
            app.ui.modal.modal();

            app.events.init();

            if (app.session.loggedIn) {
                $('#app').addClass('loggedIn');
            } else {
                $('#app').removeClass('loggedIn');
            }
        },
        plugins: {
            init: function () {
                app.ui.plugins.initTabs();
                app.ui.plugins.initSortables();
                app.ui.plugins.initTooltips();
            },
            initTabs: function () {
                $('ul#tabs').tabs();

                $('ul#tabs li:first-of-type a').trigger('click');
            },
            initSortables: function () {
                $('.period').each(function () {
                    Sortable.create($(this).find('#event-list')[0], {
                        handle: '.priority'
                    });
                });
            },
            initTooltips: function () {
                $('*[data-tooltip]').tooltip({delay: 50});
            }
        },
        initTemplates: function () {

            var promises = [];

            // FETCH REMOTE TEMPLATES

            $('script[type="text/x-handlebars-template"]').each(function () {
                var tpl = $(this);
                var id = tpl.attr('id').replace('-template', '');
                var src = tpl.attr('src');
                var tplCb = tpl.attr('data-callback');

                if (typeof src !== 'undefined') {
                    $.ajax({
                        async: true,
                        url: src,
                        success: function (data) {

                            // REGISTER TEMPLATE

                            app.ui.templates[id] = {
                                id: id,
                                data: data,
                                element: tpl,
                                callback: tplCb,
                                cb: app.ui.templatesCallbacks[tplCb]
                            };

                            // UPDATE SCRIPT TEMPLATE HTML

                            tpl.html(data);

                            // TRIGGER TEMPALTE EVENT

                            $(document).trigger('template.registered', [id]);
                        }
                    });
                    promises.push(this);
                }
            });

            $.when.apply($, promises).then(function (schemas) {
                $(document).trigger('app.ready');
            }, function (e) {
                $(document).trigger('app.failed');
            });
        },
        applyTemplate: function (name, tpl) {
            $('handlebar-placeholder[template="' + name + '"]').html(tpl);
            $(document).trigger('template.applyed', [name]);
        },
        toggleLoading: function () {
            var loader = $('#mainLoader');

            if (loader.hasClass('hidden')) {
                loader.removeClass('hidden');
            } else {
                loader.addClass('hidden');
            }
        }
    },
    save: function () {
        //Todo send final choices to the server
        alert('Choix sauvegardés');
    }
};
