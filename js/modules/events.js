/* global app */

app.register({
    events: {
        // HOLDS MANIFESTATIONS IN FLAT OBJECT
        manifestations: {},

        // -------------------------------------------------------------------------
        // ADD UI EVENTS (PRESENCE BUTTONS)
        // -------------------------------------------------------------------------

        initEvents: function () {

            $(document)

                // -----------------------------------------------------------------
                // PRESENCE BUTTONS
                // -----------------------------------------------------------------

                .on('click', '.presence-btn', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (app.core.session.cart.checkoutState === "cart") {
                        if ($(this).hasClass('forced')) {
                            app.core.ui.toast('Votre présence à cette manifestation est obligatoire', 'info');
                            return true;
                        } else {
                            var selectedEventsInTs = $(this).closest('.period').find('.event.selected').length;

                            if (app.config.maximumEventsSelectedPerTimeslots !== -1 && selectedEventsInTs >= app.config.maximumEventsSelectedPerTimeslots && !$(this).hasClass('attend')) {
                                app.core.ui.toast('Vous ne pouvez choisir que ' + app.config.maximumEventsSelectedPerTimeslots + ' éléments maximum par créneau horraire', 'info');
                                return true;
                            } else if (!$(this).hasClass('attend')) {
                                app.events.ui.presenceButton($(this));
                            } else {
                                app.events.ui.participateButton($(this));
                            }

                        }
                        app.events.selectManifestation($(this));
                        return true;
                    }
                })

                // -----------------------------------------------------------------
                // EVENTS REORDERED (SORTABLE END)
                // -----------------------------------------------------------------

                .on('events.reordered', function (e, container) {
                    var events = container.find('li.event:not(.cantSort)');

                    var promises = [];

                    var i = 1;
                    var ranks = [];
                    var oldRanks = {};
                    events.each(function () {
                        var cartItemId = app.events.manifestations[$(this).attr('data-id')].cartItemId;
                        ranks.push({
                            rank: i,
                            cartItemId: cartItemId
                        });

                        oldRanks[$(this).attr('data-id')] = $(this).attr('data-rank');

                        $(this).attr('data-rank', i);

                        promises.push($.Deferred().resolve());
                        i++;
                    });

                    $.when.apply($, promises).then(function () {
                        app.ws.updateRanks(ranks).then(function () {
                            $.each(app.core.session.cart.items, function (i) {
                                var item = app.core.session.cart.items[i];
                                if (isDefined(item) && item !== null) {
                                    $.each(ranks, function (j, r) {
                                        if (item.id === r.cartItemId) {
                                            app.core.session.cart.items[i].rank = r.rank;
                                        }
                                    });
                                }
                            });
                            app.cart.applyCart();
                        }, function () {
                            events.each(function () {
                                $(this).attr('data-rank', oldRanks[$(this).attr('data-id')]);
                            });
                        });
                    });
                })

                ;
        },

        ui: {
            initPlugins: function () {
                app.events.ui.initTabs();
                app.events.ui.initSortables();
                app.events.ui.initPushpin();
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PRESENCE
            // ---------------------------------------------------------------------

            presenceButton: function (button) {
                $(button)
                    .prop('attend', true)
                    .removeClass('forced attend btn btn-flat grey success primary')
                    .addClass('attend btn-flat primary')
                    .html('')
                    .append('<i class="material-icons">history</i>')
                    .append('<span>Sélectionné</span>');

                $(button).closest('.event')
                    .removeClass('cantSort')
                    .addClass('selected')
                    ;
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PARTICIPATE
            // ---------------------------------------------------------------------

            participateButton: function (button) {
                $(button)
                    .removeAttr('attend')
                    .removeClass('forced attend btn btn-flat grey success primary')
                    .addClass('btn grey')
                    .html('')
                    .append('<i class="material-icons">add_circle_outline</i>')
                    .append('<span>Participer</span>');

                $(button).closest('.event')
                    .addClass('cantSort')
                    .removeClass('selected')
                    ;
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PARTICIPATION REQUIRED
            // ---------------------------------------------------------------------

            requiredParticipationButton: function (button) {
                $(button)
                    .removeAttr('attend')
                    .removeClass('forced attend btn btn-flat grey success primary')
                    .addClass('forced btn-flat success')
                    .html('')
                    .append('<i class="material-icons">check_circle</i>')
                    .append('<span>Présent</span>');

                $(button).closest('.event')
                    .addClass('cantSort selected forced')
                    ;
            },

            // ---------------------------------------------------------------------
            // SORT MANIFESTATIONS ON PRESENCE AND RANK
            // ---------------------------------------------------------------------

            sortManifestations: function (sortableGroup, onlyPresents) {
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

                sortableGroup.each(function () {
                    sortPresents($(this)).detach().appendTo($(this));
                    if (!onlyPresents)
                        sortRanks($(this)).detach().appendTo($(this));

                    $(this).find('li.event .priority .priorityNumber').html('');

                    $(this).find('li.event.selected').each(function (k, item) {
                        $(item).find('.priority .priorityNumber').html(k + 1);
                    });
                });

                if (triggerCartUpdate && app.core.session.cart.checkoutState === "cart")
                    $(document).trigger('events.reordered', [sortableGroup]);

                function sortPresents(group) {
                    return $(group).find('li.event').sort(function (a, b) {
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
                    return $(group).find('li.event').sort(function (a, b) {
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

            initSortables: function () {
                $('.period').each(function () {

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
                            placeholder: 'test',
                            forcePlaceholderSize: true,
                            items: "li:not(.cantSort)",
                            stop: function (evt, ui) {

                                var container = $(ui.item[0].closest('.manifestations-list'));
                                var previousOrder = manifs.data('startOrder');
                                var positionChanged = false;

                                var i = 0;
                                container.find('li:not(.cantSort)').each(function () {
                                    if ($(this).is(ui.item) && previousOrder !== i)
                                        positionChanged = true;
                                    i++;
                                });

                                if (positionChanged) {
                                    app.events.ui.sortManifestations(container, true);

                                    $(document).trigger('events.reordered', [container]);
                                }
                            },
                            start: function (evt, ui) {
                                var container = $(ui.item[0].closest('.manifestations-list'));

                                var i = 0;
                                container.find('li:not(.cantSort)').each(function () {
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

            initPushpin: function () {
                $('.period-label:visible').each(function () {
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

            initTabs: function () {
                $('ul#tabs').tabs();
                var tabsId = $('div.tab-content:first-of-type').attr('id');
                $('ul#tabs').tabs({
                    'onShow': function (tab) {
                        window.scrollTo(0, 0);
                        setTimeout(function () {
                            app.events.ui.initPushpin();
                        }, 500);
                    },
                }).tabs('select_tab', tabsId);
            },
        },

        // -------------------------------------------------------------------------
        // TRANSFORM API DATA STRUCTURE TO BE USED IN FRONTEND UI STRUCTURE
        // -------------------------------------------------------------------------

        manageApiResult: function (result, minInterval, maxInterval) {

            var finalFormat = {
                days: {},
                ts: {}, // TEMP FIELD, DELETED WHEN FUNCTION ENDS
            };

            // CREATE DAYS BETWEEN MIN AND MAX INTERVAL
            for (var m = moment(minInterval); m.isBefore(maxInterval); m.add(1, 'days')) {
                var dayId = m.format('dddDDMM');
                finalFormat.days[dayId] = {
                    id: m.format('dddDDMM'),
                    label: m.format('ddd DD/MM'),
                    ts: [],
                    manifCount: 0
                };
                finalFormat.daysCount++;
            }

            // LOOP OVER API RESULTS
            $.each(result, function (i, manif) {
                $.each(manif.timeSlots, function (j, timeslot) {
                    var tsId = timeslot.id;
                    var ts = null;

                    if (!finalFormat.ts.hasOwnProperty(tsId)) {
                        // CREATE TIMESLOT IF NOT EXISTS
                        finalFormat.ts[tsId] = $.extend(timeslot, {
                            manifestations: {}
                        });
                    }
                    ts = finalFormat.ts[tsId];

                    var mId = manif.id;
                    var m = null;

                    if (!ts.manifestations.hasOwnProperty(mId)) {
                        // CREATE MANIFESTATION IF NOT EXISTS
                        ts.manifestations[mId] = manif;
                        delete manif.timeSlots; // AVOID TOO MUCH RECURSION
                    }
                    m = ts.manifestations[mId];

                    m.event.name = m.event.translations[app.config.lang].name;

                    app.events.manifestations[m.id] = m;
                });
            });

            // MOVE TIMESLOTS INTO TAB DAYS
            Object.keys(finalFormat.ts).forEach(function (key) {
                var ts = finalFormat.ts[key];
                var day = moment(app.core.utils.parseApiDate(ts.startsAt));
                var dayId = day.format('dddDDMM');

                if (finalFormat.days.hasOwnProperty(dayId)) {
                    finalFormat.days[dayId].ts.push(ts);
                    finalFormat.days[dayId].ts.sort(function (a, b) {
                        return app.core.utils.parseApiDate(a.startsAt) - app.core.utils.parseApiDate(b.startsAt);
                    });
                }
            });

            // COUNT MANIFESTATIONS FOR EACH DAYS
            $.each(finalFormat.days, function (i, day) {
                $.each(day.ts, function (j, ts) {
                    $.each(ts.manifestations, function (k, manif) {
                        day.manifCount++;
                    });
                });
            });

            delete finalFormat.ts;

            return finalFormat;
        },

        // -------------------------------------------------------------------------
        // HANDLE MANIFESTATION SELECTION
        // -------------------------------------------------------------------------

        selectManifestation: function (button) {

            var manifId = button.closest('.event').attr('data-id');
            var selecting = button.hasClass('attend');
            var sortable = button.closest('li.event');
            var sortableGroup = sortable.parent();

            sortable.animate({
                opacity: 0
            }, 1000, 'swing', function () {
                app.events.ui.sortManifestations(sortableGroup, true);

                app.events.ui.initSortables();

                var declinaisonId = app.events.manifestations[manifId].gauges[0].id;
                var priceId = app.events.manifestations[manifId].gauges[0].prices[0].id;

                if (selecting) {
                    // Add to cart
                    app.ws.addToCart(declinaisonId, priceId).then(function (res) {
                        // add event dom attr (rank)
                        if (!$.isArray(app.core.session.cart.items))
                            app.core.session.cart.items = [];
                        app.core.session.cart.items.push(res);
                        app.events.manifestations[manifId].cartItemId = res.id;
                        sortable.attr('data-rank', res.rank);
                        $(document).trigger('events.reordered', [sortableGroup]);
                    }, function () {

                    });
                } else {
                    var cartItemId = app.events.manifestations[manifId].cartItemId;

                    // removeFromCart
                    app.ws.removeFromCart(cartItemId).then(function () {
                        sortable.removeAttr('data-rank');
                        $(document).trigger('events.reordered', [sortableGroup]);
                    }, function () {

                    });
                }

                sortable.not('.ghost').animate({
                    opacity: 1
                }, 1000);
            });
        },

        disableTimeSlot: function (tsDom) {
            var excludes = '.forced';
            if (!isDefined(tsDom)) {
                tsDom = $('.period');
                excludes += ',.selected';
            }

            tsDom.each(function () {

                var events = $(this).find('li.event');
                var eventsToDisable = events.not(excludes);
                var forcedEvent = events.filter('.forced');

                // DISABLING EVENTS
                eventsToDisable
                    .addClass('cantSort disabled')
                    .find('.btn, .btn-flat').attr('disabled', 'disabled')
                    ;

                forcedEvent
                    .addClass('cantSort');

                $(this).addClass('timeSlotLocked');

            });
        },

        disableCartValidationButton: function () {
            $('#confirm-fab').remove();
            $('.cart-status-message.cart-' + app.core.session.cart.checkoutState).show();
        }

    },
    ws: {

        // ---------------------------------------------------------------------
        // GET EVENTS DATAS
        // ---------------------------------------------------------------------

        getEvents: function () {

            var defer = jQuery.Deferred();

            app.core.ws.call('GET', '/manifestations', {
                'criteria[metaEvents.id][type]': 'equals',
                'criteria[metaEvents.id][value]': app.config.metaEventId,
                'limit': 100
            }, function (data) {

                if (data._embedded.items.length === 0) {
                    app.core.ui.toast('Aucunes manifestations visibles', 'warning');
                    defer.resolve({days: {}, daysCount: 0});
                } else {

                    minInterval = null;
                    maxInterval = null;

                    $.each(data._embedded.items, function (i, manif) {
                        if ((app.core.utils.parseApiDate(manif.startsAt) < minInterval || minInterval === null) && manif.startsAt !== null)
                            minInterval = app.core.utils.parseApiDate(manif.startsAt);
                        if ((app.core.utils.parseApiDate(manif.endsAt) > maxInterval || maxInterval === null) && manif.endsAt !== null)
                            maxInterval = app.core.utils.parseApiDate(manif.endsAt);
                    });

                    if (maxInterval === null)
                        maxInterval = moment(minInterval).add(5, 'days').toDate();

                    var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
                    defer.resolve(events);
                }
            });

            return defer.promise();
        }
    },
    ctrl: {
        states: {
            showEvents: {
                path: "events",
                title: "Évènements"
            }
        },
        showEvents: function (force) {
            if (app.core.history.currentState !== app.ctrl.states.showEvents || force) {
                app.core.ui.clearContent();
                $('#contentLoader').show();
                var events = app.ws.getEvents()
                    .then(function (events) {
                        app.core.ctrl.render('mainTabs', events, true).then(function () {
                            app.cart.getCart().then(function () {
                                app.cart.applyCart().then(function () {
                                    app.events.ui.initTabs();
                                    app.events.ui.initSortables();
                                    app.events.ui.initPushpin();
                                    app.core.history.add(app.ctrl.states.showEvents);
                                    app.featureDiscovery.showFeatureDiscovery('info-validateCart');
                                    app.featureDiscovery.showFeatureDiscovery('info-profileButton');
                                });
                            });
                        });
                    }, function (error) {});
            }
        }
    },
});