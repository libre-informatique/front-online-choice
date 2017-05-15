<?php
error_reporting(-1);
ini_set("display_errors", 1);

$parameters = getParameters();

$wsUrl = sprintf("%s", $parameters->webservice->hostname . "/*");

header("Access-Control-Allow-Origin: " . $wsUrl);

/**
 * Api OAuth 
 * 
 * @param type $refreshToken
 * @return type
 */
function getApiToken($token = null, $refreshToken = null)
{
    $parameters = getParameters();

    $wsUrl = sprintf(
        "%s://%s%s", $parameters->webservice->protocol, $parameters->webservice->hostname, "/tck.php/api/oauth/v2/token" // specific URL for oauth
        // $parameters->webservice->apiBaseUri // global API url
    );

    $user = $parameters->user;
    $secret = $parameters->secret;

    $ch = curl_init();

    if ($refreshToken) {
        // API Url to refresh API token from existing token
        $url = sprintf('%s?client_id=%s&client_secret=%s&grant_type=refresh_token&refresh_token=%s', $wsUrl, $user, $secret, $refreshToken);
    } else {
        // Requestiiong new token
        $url = sprintf('%s?client_id=%s&client_secret=%s&grant_type=password', $wsUrl, $user, $secret);
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $res = curl_exec($ch);

    return $res;
}

function getParameters()
{
    return json_decode(file_get_contents("./data/parameters.json"));
}

if (isset($_GET['currentToken'])) {

    header('Content-Type: application/json');

    $token = (string) filter_var($_GET['currentToken'], FILTER_UNSAFE_RAW);
    $refreshToken = (string) filter_var($_GET['refreshToken'], FILTER_UNSAFE_RAW);

    $data = getApiToken($token, $refreshToken);
    echo $data;
    die();
}

if (isset($_GET['getParameters'])) {
    $params = getParameters();
    header('Content-Type: application/json');
    unset($params->user);
    unset($params->secret);
    echo json_encode($params, JSON_FORCE_OBJECT);
    die();
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
            <!-- NAVBAR -->

            <nav>
                <div class="nav-wrapper teal">
                    <a href="#" class="brand-logo"><?php echo $parameters->applicationName; ?></a>
                    <ul id="nav-mobile" class="right hide-on-med-and-down">
                        <li class="showIfLoggedIn">
                            <a href='#' data-go="showEvents">
                                <i class="material-icons">event_note</i>
                            </a>
                        </li>
                        <li class="showIfLoggedIn">
                            <a class='dropdown-button' href='#' data-activates='userMenu' data-alignment="right" data-constrainWidth="false" data-belowOrigin="true">
                                <i class="material-icons">person_outline</i>
                            </a>

                            <!-- Dropdown Structure -->
                            <ul id='userMenu' class='dropdown-content'>
                                <li>
                                    <a href="#!" data-go="showUserProfile">
                                        <i class="material-icons">featured_play_list</i>
                                        Voir mon profil
                                    </a>
                                </li>
                                <li class="divider"></li>
                                <li id="btn-logout">
                                    <a href="#!" data-go="logout">
                                        <i class="material-icons">exit_to_app</i> 
                                        Se déconnecter
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="hideIfLoggedIn">
                            <a href="#" data-go="login" data-tooltip="Se connecter">
                                <i class="material-icons">fingerprint</i>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>


            <div class="content">

                <!-- LOGIN -->

                <handlebar-placeholder template="login"></handlebar-placeholder>

                <!-- EVENTS TABS -->

                <div id="main" class="row">
                    <div class="col s12 showIfLoggedIn">
                        <handlebar-placeholder template="mainTabs"></handlebar-placeholder>
                    </div>
                </div>

                <!-- PROFILE -->

                <handlebar-placeholder template="userProfile"></handlebar-placeholder>

            </div>

            <!-- CONFIRM FAB -->

            <a id="confirm-fab" class="btn-floating btn-large waves-effect waves-light orange z-depth-3 showIfLoggedIn">
                <i class="material-icons">check</i>
            </a>

            <!-- CONFIRM MODAL -->

            <div id="confirm-modal" class="modal bottom-sheet">
                <div class="modal-content center">
                    <h4>Valider vos choix pour la semaine ?</h4>
                    <a id="save-btn" class="waves-effect waves-light btn">
                        <i class="material-icons left">check_circle</i>
                        oui
                    </a>
                    <a id="cancel-btn" class="waves-effect waves-light btn">
                        <i class="material-icons right">cancel_circle</i>
                        non
                    </a>
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
        <script type="text/javascript" src="js/controller.js"></script>
        <script type="text/javascript" src="js/events.js"></script>
        <script type="text/javascript" src="js/session.js"></script>
        <script type="text/javascript" src="js/webservice.js"></script>

        <!-- APP STARTER -->

        <script type="text/javascript">
            // START APP
            $(document).ready(app.init);
        </script>

        <!-- TEMPLATES -->

        <script id="login-template" type="text/x-handlebars-template" src="views/login.html" data-callback="initLogin"></script>
        <script id="mainTabs-template" type="text/x-handlebars-template" src="views/blocks/tabs.html" data-callback="initTabs"></script>
        <script id="periods-template" type="text/x-handlebars-template" src="views/blocks/periods.html" data-callback="initPeriods"></script>
        <script id="userProfile-template" type="text/x-handlebars-template" src="views/user/profile.html" data-callback="initUserProfile"></script>







        <div id="mainLoader" class="preloader-wrapper small active">
            <div class="spinner-layer spinner-blue">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>

            <div class="spinner-layer spinner-red">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>

            <div class="spinner-layer spinner-yellow">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>

            <div class="spinner-layer spinner-green">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>
        </div>

    </body>
</html>