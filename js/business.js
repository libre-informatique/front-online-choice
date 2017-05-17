$.extend(app, {
    business: {
        events: {
            manageApiResult: function (result, minInterval, maxInterval) {
                var out = {
                    tabs: [],
                    events: [],
                    tabsIds: {}
                };

                for (var i = 0; i <= 2; i++) {
                    var currentDay = new Date(minInterval.getTime());
                    currentDay.setDate(currentDay.getDate() + i);

                    currentDay = moment(currentDay);
                    currentDayId = currentDay.format("ddddDDMM");

                    var tab = {
                        date: currentDay,
                        currentDayId: currentDayId,
                        label: currentDay.format("dddd DD/MM"),
                        id: i,
                        eventsNumber: 0,
                        ts: []
                    };

                    out.tabs.push(tab);

                    out.tabsIds[currentDayId] = tab;
                }

                $.each(result, function (i, event) {

                    $.each(event.manifestations, function (j, manif) {

                        var min = new Date(manif.startsAt);
                        var max = new Date(manif.endsAt);
                        var currentDayId = moment(min).format("ddddDDMM");

                        $.each(manif.timeSlots, function (k, ts) {

                            var tsId = ts.id;

                            // Check if we are in current date interval (today -> +2 days)

                            console.info(min, minInterval, max, maxInterval);

                            if (min > minInterval && max < maxInterval) {
                                console.info(out);
                                event.toBeManaged = true;

                                if (typeof event.minDate === 'undefined' || min < event.minDate)
                                    event.minDate = min;
                                if (typeof event.maxDate === 'undefined' || max > event.maxDate)
                                    event.maxDate = max;

                                out.tabsIds[currentDayId].ts.push(ts);
                            }
                        });
                    });

                    if (event.toBeManaged)
                        out.events.push(event);
                });
                
                return out;
            }
        }
    }
});

