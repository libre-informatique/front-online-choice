app.register({
    events: {
        // HOLDS MANIFESTATIONS IN FLAT OBJECT
        manifestations: {},

        // HOLDS MANIFESTATIONS RANKS
        manifestationsOrders: [],

        // USED TO CENTER TABS ON CURRENT WEEK
        // TODO: REMOVE THIS
        currentWeek: null,

        ws: {

            // ---------------------------------------------------------------------
            // GET EVENTS DATAS
            // ---------------------------------------------------------------------

            getEvents: function () {

                // Define min and max interval for tabs
                var minInterval = moment(app.events.currentWeek).startOf('week');

                minInterval.hours(0).minutes(0).seconds(0).milliseconds(0);

                var maxInterval = moment(app.events.currentWeek).endOf('week').subtract(2, 'days');
                maxInterval.hours(23).minutes(59).seconds(59).milliseconds(999);

//                var minInterval = null;
//                var maxInterval = null;

                var defer = jQuery.Deferred();

                // FOR DEV, USE EVENTS.JSON

//                $.ajax({
//                    async: true,
//                    url: appHostname + '/data/events.json',
//                    success: function (data) {
//                        var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
//                        defer.resolve(events);
//                    }
//                });

                // FOR PROD, USE EVENTS API

                app.core.ws.call('GET', '/events', {
                    'criteria[metaEvents.id][type]': 'equals',
                    'criteria[metaEvents.id][value]': app.config.metaEventId,
                    'limit': 50
                }, function (data) {

                    minInterval = null;
                    maxInterval = null;

                    $.each(data._embedded.items, function (i, event) {
                        $.each(event.manifestations, function (j, manif) {
                            if ((app.core.utils.parseApiDate(manif.startsAt) < minInterval || minInterval === null) && manif.startsAt !== null)
                                minInterval = app.core.utils.parseApiDate(manif.startsAt);
                            if ((app.core.utils.parseApiDate(manif.endsAt) > maxInterval || maxInterval === null) && manif.endsAt !== null)
                                maxInterval = app.core.utils.parseApiDate(manif.endsAt);
                        });
                    });

                    if (maxInterval === null)
                        maxInterval = moment(minInterval).add(5, 'days').toDate();

                    console.info(minInterval, maxInterval);

                    var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
                    defer.resolve(events);
                });

                return defer.promise();
            }
        },

        // -------------------------------------------------------------------------
        // ADD UI EVENTS (PRESENCE BUTTONS)
        // -------------------------------------------------------------------------

        initEvents: function () {

            // TODO: DEFINE HOW CENTER THE TABS

            //            app.events.currentWeek = moment().startOf('week');
            //            app.events.currentWeek = moment('20170725').startOf('week');
            app.events.currentWeek = moment('20170517').startOf('week');

            $(document)

                // -----------------------------------------------------------------
                // PRESENCE BUTTONS
                // -----------------------------------------------------------------

                .on('click', '.presence-btn:not(.mandatory)', function (e) {
                    if (!$(this).hasClass('attend')) {
                        app.events.ui.presenceButton($(this));
                    } else {
                        app.events.ui.participateButton($(this));
                    }
                    app.events.selectManifestation($(this));
                })

                // -----------------------------------------------------------------
                // TABS PREVIOUS / NEXT (TO BE REMOVED ?)
                // -----------------------------------------------------------------

                .on('click', '#tabs .prevWeek, #tabs .nextWeek', function () {
                    var next = $(this).hasClass('nextWeek');
                    app.events.changeWeek(next);
                    app.core.ctrl.showEvents(true);
                });
        },

        ui: {

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PRESENCE
            // ---------------------------------------------------------------------

            presenceButton: function (button) {
                $(button)
                    .prop('attend', true)
                    .removeClass('btn blue')
                    .addClass('attend btn-flat teal')
                    .html('Présent');
            },

            // ---------------------------------------------------------------------
            // SWITCH BUTTON TO PARTICIPATE
            // ---------------------------------------------------------------------

            participateButton: function (button) {
                $(button)
                    .removeAttr('attend')
                    .removeClass('attend btn-flat teal')
                    .addClass('btn blue')
                    .html('Participer');
            }
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
            }

            // LOOP OVER API RESULTS
            $.each(result, function (i, event) {
                $.each(event.manifestations, function (j, manif) {
                    $.each(manif.timeSlots, function (k, timeslot) {
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
                            ts.manifestations[mId] = $.extend(manif, {
                                event: null,
                                order: 0
                            });
                            delete manif.timeSlots; // AVOID TOO MUCH RECURSION
                        }
                        m = ts.manifestations[mId];

                        m.event = event;

                        app.events.manifestationsOrders.push(m);
                        app.events.manifestations[m.id] = m;

                        delete event.manifestations; // AVOID TOO MUCH RECURSION
                    });
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

            // COUNT MANIFESTATIONS FOR EACH DAYS AND INIT MANIFESTATIONS ORDER
            var sortIndex = 0;
            $.each(finalFormat.days, function (i, day) {
                $.each(day.ts, function (j, ts) {
                    $.each(ts.manifestations, function (k, manif) {
                        day.manifCount++;
                        manif.order = sortIndex;
                        sortIndex++;
                    });
                });
            });

            // SORTING MANIFESTATIONS
            app.events.manifestationsOrders.sort(function (a, b) {
                return a.order - b.order;
            });

//            delete finalFormat.ts;

            // TEMP FOR DEV
            app.events.debug = finalFormat;

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
                sortableGroup.find('li.event').sort(function (a, b) {
                    var ap = $(a).find('.presence-btn').hasClass('attend');
                    var bp = $(b).find('.presence-btn').hasClass('attend');

                    if (ap < bp) {
                        return 1;
                    } else if (ap > bp) {
                        return -1;
                    } else {
                        return 0;
                    }

                }).detach().appendTo(sortableGroup);
                app.core.ui.plugins.initSortables();

                sortable.not('.ghost').animate({
                    opacity: 1
                }, 1000);
            });

            var declinaisonId = app.events.manifestations[manifId].gauges[0].id;
            var priceId = app.events.manifestations[manifId].gauges[0].prices[0].id;

            if (selecting) {
                // Add to cart
                app.cart.ws.addToCart(declinaisonId, priceId).then(function () {

                }, function () {

                });
            } else {
                var cartItemId = app.events.manifestations[manifId].cartItemId;

                // removeFromCart
                app.cart.ws.removeFromCart(declinaisonId, priceId).then(function () {

                }, function () {

                });

            }
        },

        // -------------------------------------------------------------------------
        // MOVE TO NEXT / PREV WEEK (TO BE REMOVED ?)
        // -------------------------------------------------------------------------

        changeWeek: function (next) {
            if (typeof next === 'undefined')
                next = false;

            if (next) {
                app.events.currentWeek.add(7, 'days').startOf('day');
            } else {
                app.events.currentWeek.subtract(7, 'days').startOf('day');
            }
        }

    },
    core: {
        ctrl: {
            states: {
                showEvents: {
                    path: "events",
                    title: "Évènements"
                }
            },
            showEvents: function (force) {
                if (app.core.history.currentState !== app.core.ctrl.states.showEvents || force) {
                    var events = app.events.ws.getEvents()
                        .then(function (events) {
                            app.core.ctrl.render('mainTabs', events, true).then(function () {
                                app.core.ui.plugins.initTabs();
                                app.core.history.add(app.core.ctrl.states.showEvents);
                            });
                        }, function (error) {});
                }
            }
        }
    }
});