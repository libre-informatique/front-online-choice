app.register({
    events: {
        manifestationsOrders: [],
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

                var defer = jQuery.Deferred();

                $.ajax({
                    async: true,
                    url: appHostname + '/data/events.json',
                    success: function (data) {
                        var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
                        defer.resolve(events);
                    }
                });

//                app.core.ws.call('GET', '/events', null, function (res) {
//                    alert('OK');
//                    defer.resolve(res);
//                });

                return defer;
            }
        },
        initEvents: function () {

            app.events.currentWeek = moment().startOf('week');

            $(document)
                .on('click', '.presence-btn:not(.mandatory)', function (e) {
                    if (!$(this).hasClass('attend')) {
                        $(this)
                            .prop('attend', true)
                            .removeClass('btn blue')
                            .addClass('attend btn-flat teal')
                            .html('Présent')
                            ;
                    } else {
                        $(this)
                            .removeClass('attend btn-flat teal')
                            .addClass('btn blue')
                            .html('Participer')
                            ;
                    }
                    app.events.selectManifestation($(this));

                })

                .on('click', '#tabs .prevWeek, #tabs .nextWeek', function () {


                    var next = $(this).hasClass('nextWeek');

                    app.events.changeWeek(next);

                    console.info(app.events.currentWeek);

                    app.core.ctrl.showEvents(true);
                })
                ;
        },
        manageApiResult: function (result, minInterval, maxInterval) {

            var finalFormat = {
                days: {},
                ts: {}
            };

            for (var m = moment(minInterval); m.isBefore(maxInterval); m.add(1, 'days')) {
                var dayId = m.format('dddDDMM');
                finalFormat.days[dayId] = {
                    id: m.format('dddDDMM'),
                    label: m.format('ddd DD/MM'),
                    ts: [],
                    manifCount: 0
                };
            }

            $.each(result, function (i, event) {
                $.each(event.manifestations, function (j, manif) {
                    $.each(manif.timeSlots, function (k, timeslot) {
                        var tsId = timeslot.id;
                        var ts = null;

                        if (!finalFormat.ts.hasOwnProperty(tsId)) {
                            finalFormat.ts[tsId] = $.extend(timeslot, {manifestations: {}});
                        }
                        ts = finalFormat.ts[tsId];

                        var mId = manif.id;
                        var m = null;

                        if (!ts.manifestations.hasOwnProperty(mId)) {
                            ts.manifestations[mId] = $.extend(manif, {event: null, order: 0});
                            delete manif.timeSlots;
                        }
                        m = ts.manifestations[mId];

                        m.event = event;

                        app.events.manifestationsOrders.push(m);
                        delete event.manifestations;
                    });
                });
            });

            Object.keys(finalFormat.ts).forEach(function (key) {
                var ts = finalFormat.ts[key];
                var day = moment(new Date(ts.startsAt));
                var dayId = day.format('dddDDMM');

                if (finalFormat.days.hasOwnProperty(dayId)) {
                    finalFormat.days[dayId].ts.push(ts);
                    finalFormat.days[dayId].ts.sort(function (a, b) {
                        return new Date(a.startsAt) - new Date(b.startsAt);
                    });
                }
            });

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

            app.events.manifestationsOrders.sort(function (a, b) {
                return a.order - b.order;
            });

            delete finalFormat.ts;

            return finalFormat;
        },
        selectManifestation: function (button) {

            var manifId = button.closest('.event').attr('data-id');
            var selecting = button.hasClass('attend');
            var sortable = button.closest('li.event');
            var sortableGroup = sortable.parent();

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
        },
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