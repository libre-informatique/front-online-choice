<?php
error_reporting(-1);
ini_set('display_errors', 1);

require_once 'actions.php';

$app = new App();

$parameters = $app->getParameters();

if (isset($_GET['currentToken'])) {
    $app->getApiTokenAction($_GET['currentToken'], @$_GET['refreshToken']);
}

if (isset($_GET['getParameters'])) {
    $app->getParametersAction();
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">

        <link rel="stylesheet" type="text/css" href="css/styles.css">
        <title><?php echo $parameters->applicationName; ?></title>

        <meta http-equiv="Access-Control-Allow-Origin" content="*">
        <meta name="theme-color" content="#455a64">

        <link rel="icon" type="image/png" href="img/favicon.png" />
    </head>
    <body>
        <div id="app">

            <!-- NAVBAR -->

            <div id="mainLoader" class="progress">
                <div class="indeterminate"></div>
            </div>

            <nav>
                <div class="nav-wrapper primary">
                    <a href="/" class="brand-logo"><?php echo $parameters->applicationName; ?></a>
                    <ul id="nav-mobile-left" class="left">
                        <li class="showIfLoggedIn">
                            <a href='#' data-go="showEvents">
                                <i class="material-icons left" id="showEventsButton">event_note</i>
                                <span class="button-label hide-on-med-and-down">Évènements</span>
                            </a>
                        </li>
                    </ul>
                    <ul id="nav-mobile-right" class="right">
                        <li class="showIfLoggedIn">
                            <a class='dropdown-button navbar-user-btn' href="javascript:;"
                               data-activates='userMenu'
                               data-alignment="right"
                               data-constrainWidth="false"
                               data-belowOrigin="true"
                               ><span class="button-label hide-on-med-and-down">Mon compte</span>
                                <i class="material-icons" id="showProfileButton">person_outline</i>
                            </a>

                            <!-- Dropdown Structure -->
                            <ul id='userMenu' class='dropdown-content'>
                                <li>
                                    <a href="javascript:;" data-go="showUserProfile">
                                        <i class="material-icons">featured_play_list</i>
                                        Voir mon profil
                                    </a>
                                </li>
                                <li class="divider"></li>
                                <li id="btn-logout">
                                    <a href="javascript:;" data-go="logout">
                                        <i class="material-icons">exit_to_app</i>
                                        Se déconnecter
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="hideIfLoggedIn">
                            <a href="javascript:;" data-go="login" data-tooltip="Se connecter">
                                <i class="material-icons">fingerprint</i>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>


            <div class="content">

                <!-- CONTENT LOADER -->

                <div id="contentLoader">
                    <div class="preloader-wrapper big active">
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
                </div>


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
                <handlebar-placeholder template="editUserProfile"></handlebar-placeholder>
                <handlebar-placeholder template="editUserPassword"></handlebar-placeholder>
                <handlebar-placeholder template="settings"></handlebar-placeholder>

            </div>

            <handlebar-placeholder template="infos"></handlebar-placeholder>
            <handlebar-placeholder template="introduction"></handlebar-placeholder>

            <!-- CONFIRM MODAL -->

            <div id="confirm-modal" class="modal bottom-sheet">
                <div class="modal-content center">
                    <h4>Valider vos choix pour la semaine ?</h4>
                    <div class="btn-toolbar row">
                        <div class="col s6">
                            <a id="save-btn" class="waves-effect waves-light btn green lighten-1">
                                <i class="material-icons left">check_circle</i>
                                oui
                            </a>
                        </div>
                        <div class="col s6">
                            <a id="cancel-btn" class="waves-effect waves-light btn primary">
                                <i class="material-icons right">cancel</i>
                                non
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- LIBS -->

        <script src="js/libs/jquery-3.2.1.min.js"></script>
        <script src="js/libs/jquery-ui.min.js"></script>
        <script src="js/libs/jquery.ui.touch-punch.min.js"></script>
        <script src="js/libs/handlebars-v4.0.5.js"></script>
        <script src="js/libs/materialize.min.js"></script>
        <script src="js/libs/moment-with-locales.min.js"></script>
        <!-- UNCOMMENT IF YOU WANT TO SUPPORT LEGACY BROWSER -->
        <!--<script src="js/libs/jquery.history.js"></script>-->

        <!-- APP -->

        <script>
            var appHostname = "<?php echo $parameters->appHostname; ?>";
        </script>

        <script type="text/javascript" src="js/app.js"></script>
        <script type="text/javascript" src="js/core/utils.js"></script>
        <script type="text/javascript" src="js/core/ui.js"></script>
        <script type="text/javascript" src="js/core/controller.js"></script>
        <script type="text/javascript" src="js/core/events.js"></script>
        <script type="text/javascript" src="js/core/session.js"></script>
        <script type="text/javascript" src="js/core/webservice.js"></script>
        <script type="text/javascript" src="js/core/history.js"></script>
        <script type="text/javascript" src="js/core/settings.js"></script>

        <!-- BUSINESS COMPONENTS -->

        <script type="text/javascript" src="js/modules/featureDiscovery.js"></script>
        <script type="text/javascript" src="js/modules/user.js"></script>
        <script type="text/javascript" src="js/modules/events.js"></script>
        <script type="text/javascript" src="js/modules/cart.js"></script>

        <!-- APP STARTER -->

        <script type="text/javascript">
            // START APP
            $(document).ready(app.init());
        </script>

        <!-- TEMPLATES LOADED DIRECTLY -->

        <script id="login-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/login.html'); ?></script>
        <script id="mainTabs-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/blocks/tabs.html'); ?></script>
        <script id="userProfile-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/user/profile.html'); ?></script>
        <script id="editUserProfile-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/user/editProfile.html'); ?></script>
        <script id="editUserPassword-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/user/editPassword.html'); ?></script>
        <script id="settings-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/user/settings.html'); ?></script>
        <script id="infos-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/blocks/infos.html'); ?></script>
        <script id="introduction-template" type="text/x-handlebars-template"><?php echo file_get_contents('./views/blocks/introduction.html'); ?></script>

        <!-- TEMPLATES LOADED VIA AJAX -->

        <div class="footer">
            <div class="footerText">
                Propulsé par <a href="http://www.e-venement.net">e-venement</a>
            </div>
            <div class="footerText">
                Réalisé par <a href="http://www.libre-informatique.fr/">libre-informatique</a>
            </div>
            <div class="footerText custom"><?php echo $parameters->footerText; ?></div>
        </div>

    </body>
</html>
