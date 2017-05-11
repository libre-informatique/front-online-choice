var app = {
    config: {},
    init: function () {

        $.get('data/parameters.json', function (params) {
            app.config = params;
            app.ui.initTemplates();
            app.ui.init();
        });
    },
    ui: {
        templates: {},
        modal: null,
        templatesCallbacks: {
            initLogin: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.login.data);

                app.ui.applyTemplate('login', compiled({}));
            },
            initTabs: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.mainTabs.data);

                app.ui.applyTemplate('mainTabs', compiled(data));
            },
            initMainTabsContent: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.mainTabsContent.data);

                var events = app.ws.getEvents();

                app.ui.applyTemplate('mainTabsContent', compiled(events));

                app.ui.initPlugins();
            },
            initPeriods: function (data) {
                var compiled = Handlebars.compile(app.ui.templates.periods.data);
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
        initPlugins: function () {

            // INIT TABS

            $('ul#tabs').tabs();

            $('ul#tabs li:first-of-type a').trigger('click');


            // INIT SORTABLE ELEMENTS

            $('.period').each(function () {
                Sortable.create($(this).find('#event-list')[0], {
                    handle: '.priority'
                });
            });
        },
        initTemplates: function () {

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
                }
            });
        },
        applyTemplate: function (name, tpl) {
            $('handlebar-placeholder[template="' + name + '"]').replaceWith(tpl);
        }
    },
    save: function () {
        //Todo send final choices to the server
        alert('Choix sauvegardés');
    }
};
