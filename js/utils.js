$.extend(app, {
    utils: {
        formToObject: function (formArray) {

            var returnArray = {};
            for (var i = 0; i < formArray.length; i++) {
                returnArray[formArray[i]['name']] = formArray[i]['value'];
            }
            return returnArray;
        }
    }
});