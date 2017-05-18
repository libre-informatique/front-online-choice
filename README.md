# Front Online Choice

WORK IN PROGRESS

## Install dev env:

-   cp data/parameters.json.dist data/parameters.json
-   npm install
-   gulp
-   open localhost:8000
-   The window will refresh automatically and sass will be compiled every time you save a file in the project

## For developpers

### Add new view :

Create your view template in views/myView.html directory.

```html
<div>
    My View ! and {{ myData }}
</div>
```

Append to index.php the script tag that holds your view template :

```html
<script id="myView-template" type="text/x-handlebars-template" src="views/myView.html"></script>
```

Add action to js/core/controller.js

```js
$.extend(app.core, {
    ctrl: {

        // [...]

        myView: function () {
            app.core.ctrl.render('myView', {myData: 'myData'}, true);
        },

        // [...]

    }
});
```

Put the view placeholder in index.php

```html
<div id="app">

    <!-- [...] -->

    <handlebar-placeholder template="myView"></handlebar-placeholder>

    <!-- [...] -->

</div>
```

Add a link / button to call your newlly created view

```html
<a href='#' data-go="myView">
    Go to my new view !
</a>
```
