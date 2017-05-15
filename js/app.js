var app = {
    config: {},
    init: function () {

        $.get(appHostname + '/?getParameters=1', function (params) {
            moment.locale('fr');
            app.config = params;
            app.session.start();
        });

        $(document).on('app.session.started', function () {
            app.ws.apiAuth();
            app.ui.initTemplates();
        });

        $(document).on('templates.registered', function () {
            app.ui.plugins.init();
            app.ui.displayLoading(false);
            app.ui.init();
        });
    },
    ui: {
        templates: {},
        modal: null,
        init: function () {
            app.ui.modal = $('#confirm-modal');
            app.ui.modal.modal();

            app.events.init();

            if (app.session.user) {
                $('#app').addClass('loggedIn');
                app.ctrl.showEvents();
            } else {
                app.ctrl.login();
                $('#app').removeClass('loggedIn');
            }
        },
        plugins: {
            init: function () {
                app.ui.plugins.initTabs();
                app.ui.plugins.initSortables();
                app.ui.plugins.initTooltips();
                app.ui.plugins.initDropDown();
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
            },
            initDropDown: function () {
                $('.dropdown-button').dropdown();
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
                                element: tpl
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
                $(document).trigger('templates.registered');
            }, function (e) {
                $(document).trigger('app.failed');
            });
        },
        applyTemplate: function (name, tpl) {
            $('handlebar-placeholder[template="' + name + '"]').html(tpl);
            $(document).trigger('template.applyed', [name]);
        },
        displayLoading: function (show) {
            if (typeof show === 'undefined')
                show = true;
            var loader = $('#mainLoader');

            if (show === true)
                loader.removeClass('hidden');
            else
                loader.addClass('hidden');
        },
        toast: function (message, delay) {
            if (typeof delay === 'undefined')
                delay = 5000;
            Materialize.toast(message, delay);
        }
    },
    save: function () {
        //Todo send final choices to the server
        alert('Choix sauvegardés');
    }
};
