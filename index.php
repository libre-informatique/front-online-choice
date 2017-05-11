
<?php
error_reporting(-1);
ini_set("display_errors", 1);

function getApiToken($refreshToken = null)
{
    $parameters = json_decode(file_get_contents("./data/parameters.json"));

    $wsUrl = sprintf(
        "%s://%s%s",
        $parameters->webservice->protocol,
        $parameters->webservice->hostname, 
        "/tck.php/api/oauth/v2/token" // specific URL for oauth
//        $parameters->webservice->apiBaseUri // global API url
    );
    
    $user = $parameters->user;
    $secret = $parameters->secret;

    $ch = curl_init();

    $url = sprintf('%s?client_id=%s&client_secret=%s&grant_type=password', $wsUrl, $user, $secret);

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
//    curl_setopt($ch, CURLOPT_HEADER, true); /// DEBUG ONLY
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $res = curl_exec($ch);

    return $res;
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
        <link rel="stylesheet" href="css/materialize.min.css">
        <link rel="stylesheet" type="text/css" href="css/styles.css">
        <title>Semaines des embassadeurs</title>

        <meta http-equiv="Access-Control-Allow-Origin" content="*">

    </head>
    <body>
        <div id="app">

            <handlebar-placeholder template="login"></handlebar-placeholder>

            <div id="main" class="row">

                <div class="col s12">
                    <a id="btn-logout" class="btn-floating btn-large waves-effect waves-light red">
                        <i class="material-icons">exit_to_app</i>
                    </a>
                    <ul id="tabs" class="tabs teal z-depth-2">
                        <handlebar-placeholder template="mainTabs"></handlebar-placeholder>
                    </ul>

                    <handlebar-placeholder template="mainTabsContent"></handlebar-placeholder>
                </div>
            </div>
            <!-- CONFIRM FAB -->
            <a id="confirm-fab" class="btn-floating btn-large waves-effect waves-light orange z-depth-3"><i class="material-icons">check</i></a>
            <!-- CONFIRM MODAL -->
            <div id="confirm-modal" class="modal bottom-sheet">
                <div class="modal-content center">
                    <h4>Valider vos choix pour la semaine ?</h4>
                    <a id="save-btn" class="waves-effect waves-light btn"><i class="material-icons left">check_circle</i>oui</a>
                    <a id="cancel-btn" class="waves-effect waves-light btn"><i class="material-icons right">cancel_circle</i>non</a>
                </div>
            </div>
        </div>

        <!-- LIBS -->

        <script src="js/libs/jquery-3.2.1.min.js"></script>
        <script src="js/libs/handlebars-v4.0.5.js"></script>
        <script src="js/libs/materialize.min.js"></script>
        <script src="js/libs/Sortable.min.js"></script>
        <script src="js/libs/moment-with-locales.min.js"></script>

        <!-- APP -->

        <script type="text/javascript" src="js/app.js"></script>
        <script type="text/javascript" src="js/utils.js"></script>

        <script type="text/javascript" src="js/events.js"></script>
        <script type="text/javascript" src="js/session.js"></script>
        <script type="text/javascript" src="js/webservice.js"></script>

        <!-- APP STARTER -->

        <script type="text/javascript">
            // SET API TOKEN

            $.extend(app.session,<?php echo getApiToken(); ?>);

            // START APP

            $(document).ready(app.init);
        </script>

        <!-- TEMPLATES -->

        <script id="login-template" type="text/x-handlebars-template" src="views/login.html" data-callback="initLogin"></script>
        <script id="mainTabs-template" type="text/x-handlebars-template" src="views/blocks/tabs.html" data-callback="initTabs"></script>
        <script id="mainTabsContent-template" type="text/x-handlebars-template" src="views/blocks/tabsContent.html" data-callback="initMainTabsContent"></script>
        <script id="periods-template" type="text/x-handlebars-template" src="views/blocks/periods.html" data-callback="initPeriods"></script>
    </body>
</html>