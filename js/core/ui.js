app.register({
    core: {
        ui: {

            // HANDLE APPLICATION TEMPLATES
            templates: {},

            // HANDLE APPLICATION MODALE
            modal: null,

            // HANDLE APPLICATION MODALE
            init: function () {
                $(document).trigger('ui.init');
            },

            // -------------------------------------------------------------------------
            // UI GLOBAL EVENTS
            // -------------------------------------------------------------------------

            initEvents: function () {
                
            },

            // -------------------------------------------------------------------------
            // UI PLUGINS (THIRD PARTY JS PLUGINS)
            // -------------------------------------------------------------------------

            plugins: {
                init: function () {
                    app.core.ui.plugins.initTabs();
                    app.core.ui.plugins.initTooltips();
                    app.core.ui.plugins.initDropDown();
                    app.core.ui.plugins.initModal();
                    app.core.ui.plugins.registerComponentPlugins(app);
                },

                // ---------------------------------------------------------------------
                // MATERIALIZECSS TABS
                // ---------------------------------------------------------------------

                initTabs: function () {
                    $('ul#tabs').tabs();
                    var tabsId = $('div.tab-content:first-of-type').attr('id');
                    $('ul#tabs').tabs('select_tab', tabsId);
                },
                
                // ---------------------------------------------------------------------
                // MATERIALIZECSS TOOLTIPS
                // ---------------------------------------------------------------------
                
                initTooltips: function () {
                    $('.material-tooltip').remove();
                    $('*[data-tooltip]').tooltip({
                        delay: 50
                    });
                },
                
                // ---------------------------------------------------------------------
                // MATERIALIZECSS DROPDOWN
                // ---------------------------------------------------------------------
                
                initDropDown: function () {
                    $('.dropdown-button').dropdown();
                },
                
                // ---------------------------------------------------------------------
                // MATERIALIZECSS MODAL
                // ---------------------------------------------------------------------
                
                initModal: function () {
                    app.core.ui.modal = $('#confirm-modal');
                    app.core.ui.modal.modal();
                },

                // ---------------------------------------------------------------------
                // INITIALIZE COMPONENTS PLUGINS
                // ---------------------------------------------------------------------

                registerComponentPlugins: function (component, deep) {
                    if (!isDefined(deep))
                        deep = 0;

                    if (deep > 3) // LIMIT INIT SEARCH RECURSION TO 4 LEVEL
                        return;

                    // RECURSION OVER APPLICATION COMPONENTS
                    Object.keys(component).forEach(function (key) {
                        var c = component[key];
                        if (c.hasOwnProperty('initPlugins')) {
                            c.initPlugins();
                        } else if (typeof c === "object") {
                            app.core.ui.plugins.registerComponentPlugins(c, ++deep);
                        }
                    });
                }
            },
            
            // -------------------------------------------------------------------------
            // LOOP LOADING HANDLEBARS TEMPLATES
            // -------------------------------------------------------------------------
            
            initTemplates: function () {
                var promises = [];

                // FETCH REMOTE TEMPLATES

                $('script[type="text/x-handlebars-template"]').each(function () {
                    var tpl = $(this);
                    var id = tpl.attr('id').replace('-template', '');
                    var src = tpl.attr('src');
                    var tplCb = tpl.attr('data-callback');

                    if (isDefined(src)) {
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
            
            // -------------------------------------------------------------------------
            // APPLY COMPILED TEMPLATE
            // -------------------------------------------------------------------------
            
            applyTemplate: function (name, tpl) {
                $('handlebar-placeholder[template="' + name + '"]').html(tpl);
                $(document).trigger('template.applyed', [name]);
            },
            
            // -------------------------------------------------------------------------
            // CLEAR .CONTENT PLACEHOLDERS
            // -------------------------------------------------------------------------
            
            clearContent: function () {
                $('#app div.content handlebar-placeholder').html('');
            },
            
            // -------------------------------------------------------------------------
            // SHOW LOADER IN TOP OF NAVBAR
            // -------------------------------------------------------------------------
            
            displayLoading: function (show) {
                if (!isDefined(show))
                    show = true;
                var loader = $('#mainLoader');

                if (show === true)
                    loader.removeClass('hidden');
                else
                    loader.addClass('hidden');
            },
            
            // -------------------------------------------------------------------------
            // SHOW BIG LOADER IN CONTENT
            // -------------------------------------------------------------------------
            
            displayContentLoading: function (show) {
                if (!isDefined(show))
                    show = true;
                var loader = $('#contentLoader');

                if (show === true)
                    loader.show();
                else
                    loader.hide();
            },
            
            // -------------------------------------------------------------------------
            // SHOW TOAST (FLASH MESSAGE)
            // -------------------------------------------------------------------------
            
            toast: function (message, type, delay) {
                if (!isDefined(delay))
                    delay = 5000;
                if (!isDefined(type))
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
            }
        }
    }
});