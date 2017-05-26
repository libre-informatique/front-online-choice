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
            initEvents: function () {
                $(document)
                    .on('click', '.tap-target button.understood', function () {
                        var tap = $(this).closest('.tap-target');
                        app.core.ui.hideFeatureDiscovery(tap.attr('id'), true);
                    })

                    .on('click', '.tap-target', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (!$(e.currentTarget).is('button')) {
                            $(e.currentTarget).tapTarget('close');
                        }
                    })
                    ;
            },
            plugins: {
                init: function () {
                    app.core.ui.plugins.initTabs();
                    app.core.ui.plugins.initSortables();
                    app.core.ui.plugins.initTooltips();
                    app.core.ui.plugins.initDropDown();
                    app.core.ui.plugins.initModal();
                    app.core.ui.plugins.initPushpin();
                },
                initTabs: function () {
                    $('ul#tabs').tabs();
                    var tabsId = $('div.tab-content:first-of-type').attr('id');
                    $('ul#tabs').tabs('select_tab', tabsId);
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
                            filter: ".cantSort",
                            preventOnFilter: true,
                            onEnd: function (evt) {
                                if (evt.newIndex != evt.oldIndex) {
                                    var container = $(evt.from);

                                    app.events.ui.sortManifestations(container, true);

                                    $(document).trigger('events.reordered', [container]);
                                }
                            }
                        });
                    });
                },
                initTooltips: function () {
                    $('.material-tooltip').remove();
                    $('*[data-tooltip]').tooltip({
                        delay: 50
                    });
                },
                initDropDown: function () {
                    $('.dropdown-button').dropdown();
                },
                initModal: function () {
                    app.core.ui.modal = $('#confirm-modal');
                    app.core.ui.modal.modal();
                },
                initPushpin: function () {
                    $('.period-label').each(function () {
                        var contentTop = $('nav').outerHeight() + $('.tabs').outerHeight();
                        var $this = $(this);
                        var $target = $('#' + $(this).attr('data-target'));
                        $this.pushpin({
                            top: $target.offset().top - contentTop + ($this.outerHeight()),
                            bottom: ($target.offset().top + $target.outerHeight() - $this.height()) + contentTop - ($this.outerHeight()),
                            offset: contentTop
                        });
                    });
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

                                $(document).trigger('template.registered', [app.core.ui.templates[id]]);

                                promises.push(this);
                            }
                        });

                    } else {
                        // REGISTER TEMPLATE

                        app.core.ui.templates[id] = {
                            id: id,
                            data: tpl.html(),
                            element: tpl
                        };

                        $(document).trigger('template.registered', [app.core.ui.templates[id]]);

                        promises.push(this);
                    }


                });

                $.when.apply($, promises).then(function () {
                    $(document).trigger('templates.registered');
                }, function (e) {
                    $(document).trigger('app.failed');
                });
            },
            applyTemplate: function (name, tpl) {
                $('handlebar-placeholder[template="' + name + '"]').html(tpl);
                $(document).trigger('template.applyed', [name]);
            },
            clearContent: function () {
                $('#app div.content handlebar-placeholder').html('');
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
            displayContentLoading: function (show) {
                if (typeof show === 'undefined')
                    show = true;
                var loader = $('#contentLoader');

                if (show === true)
                    loader.show();
                else
                    loader.hide();
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
                    case 'success':
                        icon = '<i class="material-icons right">check_circle</i>';
                        break;
                    default:
                        icon = '<i class="material-icons right">notifications</i>';
                        break;
                }

                Materialize.toast(message + icon, delay, type);
            },
            showFeatureDiscovery: function (id) {

                var elem = $('.tap-target');

                if (typeof id !== 'undefined') {
                    elem = elem.filter('#' + id);
                }


                elem.each(function () {
                    var id = $(this).attr('id');

                    if (!app.core.ui.__getInfosStorage().hasOwnProperty(id))
                        elem.tapTarget('open');
                });

            },
            hideFeatureDiscovery: function (id, dontshowagain) {
                var elem = null;
                if (typeof id === 'undefined') {
                    elem = $('.tap-target');
                } else {
                    elem = $('#' + id);
                }

                if (typeof dontshowagain !== 'undefined' && dontshowagain) {
                    app.core.ui.__setInfosStorage(id);
                }

                elem.tapTarget('close');
            },
            __getInfosStorage: function () {
                var infos = localStorage.getItem(app.config.clientSessionName + '_infos');

                if (infos === null)
                    infos = '{}';

                return JSON.parse(infos);
            },
            __setInfosStorage: function (id) {
                var infos = app.core.ui.__getInfosStorage();

                infos[id] = id;

                localStorage.setItem(app.config.clientSessionName + '_infos', JSON.stringify(infos));
            },
            __resetInfosStorage: function () {
                localStorage.setItem(app.config.clientSessionName + '_infos', '{}');
            }
        }
    }
});