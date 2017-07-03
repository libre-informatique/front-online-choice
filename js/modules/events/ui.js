app.register({
    events: {
        ui: {
            initPlugins: function() {
                app.events.ui.initTabs();
                app.events.ui.initSortables();
                app.events.ui.initPushpin();
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PRESENCE
            // ---------------------------------------------------------------------

            presenceButton: function(button) {
                $(button)
                    .prop('attend', true)
                    .removeClass('forced attend btn btn-flat neutral success primary')
                    .addClass('attend btn-flat primary')
                    .html('')
                    .append('<i class="material-icons">history</i>')
                    .append('<span>Sélectionné</span>');

                $(button).closest('.event')
                    .removeClass('cantSort')
                    .addClass('selected');
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PARTICIPATE
            // ---------------------------------------------------------------------

            participateButton: function(button) {
                $(button)
                    .removeAttr('attend')
                    .removeClass('forced attend btn btn-flat neutral success primary')
                    .addClass('btn neutral')
                    .html('')
                    .append('<i class="material-icons">add_circle_outline</i>')
                    .append('<span>Participer</span>');

                $(button).closest('.event')
                    .addClass('cantSort')
                    .removeClass('selected');
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PARTICIPATION REQUIRED
            // ---------------------------------------------------------------------

            requiredParticipationButton: function(button) {
                $(button)
                    .removeAttr('attend')
                    .removeClass('forced attend btn btn-flat neutral success primary')
                    .addClass('forced btn-flat success')
                    .html('')
                    .append('<i class="material-icons">check_circle</i>')
                    .append('<span>Inscrit</span>');

                $(button).closest('.event')
                    .addClass('cantSort selected forced');
            },

            // ---------------------------------------------------------------------
            // SORT MANIFESTATIONS ON PRESENCE AND RANK
            // ---------------------------------------------------------------------

            sortManifestations: function(sortableGroup, onlyPresents) {
                var defer = $.Deferred();
                var triggerCartUpdate = true;

                if (!isDefined(sortableGroup)) {
                    sortableGroup = $('.manifestations-list');
                    triggerCartUpdate = false;
                }

                if (!isDefined(onlyPresents)) {
                    onlyPresents = false;
                }

                if (onlyPresents) {
                    triggerCartUpdate = false;
                }

                sortableGroup.each(function() {
                    sortPresents($(this)).detach().appendTo($(this));
                    if (!onlyPresents)
                        sortRanks($(this)).detach().appendTo($(this));

                    $(this).find('li.event .priority .priorityNumber').html('');

                    $(this).find('li.event.selected').each(function(k, item) {
                        $(item).find('.priority .priorityNumber').html(k + 1);
                    });
                });

                if (triggerCartUpdate && app.core.session.cart.checkoutState === "cart")
                    $(document).trigger('events.reordered', [sortableGroup]);

                defer.resolve();

                return defer.promise();

                function sortPresents(group) {
                    return $(group).find('li.event').sort(function(a, b) {
                        var ap = $(a).find('.presence-btn').hasClass('attend');
                        var bp = $(b).find('.presence-btn').hasClass('attend');

                        var af = $(a).hasClass('forced');
                        var bf = $(b).hasClass('forced');

                        if (af || bf) {
                            if (af < bf) {
                                return 1;
                            } else if (af > bf) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }

                        if (ap < bp) {
                            return 1;
                        } else if (ap > bp) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                }

                function sortRanks(group) {
                    return $(group).find('li.event').sort(function(a, b) {
                        var ap = parseInt($(a).attr('data-rank'), 10);
                        var bp = parseInt($(b).attr('data-rank'), 10);

                        if (ap < bp) {
                            return -1;
                        } else if (ap > bp) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                }
            },

            initSortables: function() {
                $('.period').each(function() {

                    var manifs = $(this).find('.manifestations-list');

                    if (!$(this).hasClass('timeSlotLocked')) {

                        var enabled = false;

                        if (manifs.find('.presence .attend').length > 1) {
                            manifs.addClass('active');
                            enabled = true;
                        } else {
                            manifs.removeClass('active');
                        }

                        if (manifs.data().hasOwnProperty('sortable'))
                            manifs.sortable("destroy");

                        manifs.sortable({
                            animation: 0,
                            handle: '.priority',
                            scroll: true,
                            disabled: !enabled,
                            placeholder: 'sortablePlaceholder',
                            forcePlaceholderSize: true,
                            items: "li:not(.cantSort)",
                            stop: function(evt, ui) {

                                var container = $(ui.item[0].closest('.manifestations-list'));
                                var previousOrder = manifs.data('startOrder');
                                var positionChanged = false;

                                var i = 0;
                                container.find('li:not(.cantSort)').each(function() {
                                    if ($(this).is(ui.item) && previousOrder !== i)
                                        positionChanged = true;
                                    i++;
                                });

                                if (positionChanged) {
                                    app.events.ui.sortManifestations(container, true);

                                    $(document).trigger('events.reordered', [container]);
                                }
                            },
                            start: function(evt, ui) {
                                var container = $(ui.item[0].closest('.manifestations-list'));

                                var i = 0;
                                container.find('li:not(.cantSort)').each(function() {
                                    if ($(this).is(ui.item))
                                        manifs.data('startOrder', i);
                                    i++;
                                });
                            }
                        });
                    } else {
                        if (manifs.data().hasOwnProperty('sortable'))
                            manifs.sortable("destroy");
                    }
                });
            },

            initPushpin: function() {
                $('.period-label:visible').each(function() {
                    var $this = $(this);
                    var contentTop = $('nav').outerHeight() + $('.tabs').outerHeight();
                    var $target = $('#' + $this.attr('data-target'));
                    $this.pushpin('remove');

                    $this.pushpin({
                        top: $target.offset().top - contentTop + ($this.outerHeight()),
                        bottom: ($target.offset().top + $target.outerHeight() - $this.height()) + contentTop - ($this.outerHeight()),
                        offset: contentTop
                    });
                });
            },

            // ---------------------------------------------------------------------
            // MATERIALIZECSS TABS
            // ---------------------------------------------------------------------

            initTabs: function() {
                $('ul#tabs').tabs();
                var tabsId = $('div.tab-content:first-of-type').attr('id');
                $('ul#tabs').tabs({
                    'onShow': function(tab) {
                        window.scrollTo(0, 0);
                        setTimeout(function() {
                            app.events.ui.initPushpin();
                        }, 500);
                    },
                }).tabs('select_tab', tabsId);
            },
        },
    }
})
