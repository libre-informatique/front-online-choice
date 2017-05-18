var app = {
    config: {},
    init: function () {

        $.get(appHostname + '/?getParameters=1', function (params) {
            moment.locale('fr');
            app.config = params;
            app.events.init();
            app.session.start();

            app.history.add({
                path: "",
                title: app.config.applicationName
            });
        });

        $(document).on('app.session.started', function () {
            app.session.manageApiToken();
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
                app.ui.plugins.initModal();
                Materialize.updateTextFields();
            },
            initTabs: function () {
                $('ul#tabs').tabs();

                $('ul#tabs li:first-of-type a').trigger('click');
            },
            initSortables: function () {
                $('.period').each(function () {
                    var manifs = $(this).find('.manifestations-list');

                    Sortable.create(manifs[0], {
                        animation: 100,
                        handle: '.priority',
                        scroll: true,
                        ghostClass: "ghost",
                        forceFallback: true,
                        onEnd: function (evt) {

                        },
                    });
                });
            },
            initTooltips: function () {
                $('*[data-tooltip]').tooltip({delay: 50});
            },
            initDropDown: function () {
                $('.dropdown-button').dropdown();
            },
            initModal: function () {
                app.ui.modal = $('#confirm-modal');
                app.ui.modal.modal();
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
        toast: function (message, type, delay) {
            if (typeof delay === 'undefined')
                delay = 5000;
            if (typeof type === 'undefined')
                type = 'default';

            switch (type) {
                case 'info':
                    icon = '<i class="material-icons right">info</i>';
                    break;
                case 'warning':
                    icon = '<i class="material-icons right">warning</i>';
                    break;
                case 'error':
                    icon = '<i class="material-icons right">error</i>';
                    break;
                case 'success' :
                    icon = '<i class="material-icons right">check_circle</i>';
                    break;
                default:
                    icon = '<i class="material-icons right">notifications</i>';
                    break;
            }

            Materialize.toast(message + icon, delay, type);
        }
    },
    save: function () {
        //Todo send final choices to the server
        alert('Choix sauvegardés');
    }
};
