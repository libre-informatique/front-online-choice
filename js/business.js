$.extend(app, {
    business: {
        events: {
            manageApiResult: function (result, minInterval, maxInterval) {

                var finalFormat = {
                    days: {},
                    ts: {}
                };

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
                                ts.manifestations[mId] = $.extend(manif, {event: null});
                                delete manif.timeSlots;
                            }
                            m = ts.manifestations[mId];

                            m.event = event;
                            delete event.manifestations;
                        });
                    });
                });

                Object.keys(finalFormat.ts).forEach(function (key) {
                    var ts = finalFormat.ts[key];
                    var day = moment(new Date(ts.startsAt));
                    var dayId = day.format('ddddDDMM');

                    if (!finalFormat.days.hasOwnProperty(dayId)) {
                        finalFormat.days[dayId] = {
                            id: day.format('ddddDDMM'),
                            label: day.format('dddd DD/MM'),
                            ts: [],
                            manifCount: 0
                        };
                    }

                    finalFormat.days[dayId].ts.push(ts);
                    finalFormat.days[dayId].ts.sort(function (a, b) {
                        return new Date(a.startsAt) - new Date(b.startsAt);
                    });
                });

                $.each(finalFormat.days, function (i, day) {
                    $.each(day.ts, function (j, ts) {
                        $.each(ts.manifestations, function (k, manif) {
                            day.manifCount++;
                        });
                    });
                });

                delete finalFormat.ts;

                console.info(finalFormat);

                return finalFormat;
            }
        }
    }
});

