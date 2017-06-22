app.register({
    ws: {

        // ---------------------------------------------------------------------
        // GET EVENTS DATAS
        // ---------------------------------------------------------------------

        getEvents: function() {

            var defer = jQuery.Deferred();

            app.core.ws.call('GET', '/manifestations', {
                'criteria[metaEvents.id][type]': 'equals',
                'criteria[metaEvents.id][value]': app.config.metaEventId,
                'limit': 100
            }, function(data) {

                if (data._embedded.items.length === 0) {
                    app.core.ui.toast('Aucunes manifestations visibles', 'warning');
                    defer.resolve({
                        days: {},
                        daysCount: 0
                    });
                } else {

                    minInterval = null;
                    maxInterval = null;

                    $.each(data._embedded.items, function(i, manif) {
                        if ((app.core.utils.parseDate(manif.startsAt) < minInterval || minInterval === null) && manif.startsAt !== null)
                            minInterval = app.core.utils.parseDate(manif.startsAt);
                        if ((app.core.utils.parseDate(manif.endsAt) > maxInterval || maxInterval === null) && manif.endsAt !== null)
                            maxInterval = app.core.utils.parseDate(manif.endsAt);
                    });

                    if (maxInterval === null)
                        maxInterval = moment(minInterval).add(5, 'days').toDate();

                    var events = app.events.manageApiResult(data._embedded.items, minInterval, maxInterval);
                    defer.resolve(events);
                }
            });

            return defer.promise();
        },

        getMetaEvent: function() {
            var defer = jQuery.Deferred();

            app.core.ws.call('GET', '/manifestations', {
                'criteria[metaEvents.id][type]': 'equals',
                'criteria[metaEvents.id][value]': app.config.metaEventId,
                'limit': 1
            }, function(data) {
                var event = data._embedded.items.length != 0 ? data._embedded.items[0].event : null;

                if (event) {
                    var metaevent = event.metaEvent;
                    var texts = metaevent.translations[app.config.lang];
                    texts.description = texts.description.replace(/\n/g, "<br>");
                    defer.resolve(texts);
                } else {
                    defer.reject();
                }
            });

            return defer.promise();
        }
    },
})
