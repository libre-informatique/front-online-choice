app.register({
    core: {
        ui: {
            templates: {},
            sortables: [],
            modal: null,
            init: function () {
                if (app.core.session.user) {
                    $('#app').addClass('loggedIn');
                    app.core.ctrl.showEvents();
                } else {
                    app.core.ctrl.login();
                    $('#app').removeClass('loggedIn');
                }
            },
            plugins: {
                init: function () {
                    app.core.ui.plugins.initTabs();
                    app.core.ui.plugins.initSortables();
                    app.core.ui.plugins.initTooltips();
                    app.core.ui.plugins.initDropDown();
                    app.core.ui.plugins.initModal();
                    Materialize.updateTextFields();
                },
                initTabs: function () {
                    $('ul#tabs').tabs();
//                    var today = moment(new Date()).format('dddDDMM');
//                    var todayTab = $('ul#tabs li a[data-tabId="' + today + '"]');
//                    if (todayTab.length != 0)
//                        $('ul#tabs li a[data-tabId="' + today + '"]').trigger('click');
//                    else
//                        $('ul#tabs li:first-of-type a').trigger('click');
                    $('ul#tabs li:first-of-type a').trigger('click');
                },
                initSortables: function () {
                    $('.period').each(function () {
                        var manifs = $(this).find('.manifestations-list');
                        var enabled = false;

                        if (manifs.find('.presence .attend').length > 1) {
                            manifs.addClass('active');
                            enabled = true;
                        } else {
                            manifs.removeClass('active');
                            enabled = false;
                        }

                        if (manifs.data().hasOwnProperty('sortable'))
                            manifs.sortable("destroy");

                        manifs.sortable({
                            animation: 100,
                            handle: '.priority',
                            scroll: true,
                            ghostClass: "ghost",
                            forceFallback: true,
                            disabled: !enabled,
                            onEnd: function (evt) {

                            }
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
                    app.core.ui.modal = $('#confirm-modal');
                    app.core.ui.modal.modal();
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

                                app.core.ui.templates[id] = {
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
                    } else {
                        // REGISTER TEMPLATE

                        app.core.ui.templates[id] = {
                            id: id,
                            data: tpl.html(),
                            element: tpl
                        };

                        // TRIGGER TEMPALTE EVENT
                        $(document).trigger('template.registered', [id]);
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
        }
    }
});