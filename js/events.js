$.extend(app, {
    events: {
        manifestationsOrders: [],
        manageApiResult: function (result, minInterval, maxInterval) {

            var finalFormat = {
                days: {},
                ts: {}
            };

            for (var m = moment(minInterval); m.isBefore(maxInterval); m.add('days', 1)) {
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
        }
    }
});

