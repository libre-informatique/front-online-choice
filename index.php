<?php
error_reporting(-1);
ini_set('display_errors', 1);

require_once 'actions.php';

$app = new App();

$parameters = $app->getParameters();

if (isset($_POST['currentToken'])) {
    $app->getApiTokenAction($_POST['currentToken'], @$_POST['refreshToken']);
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

        <link rel="stylesheet" type="text/css" href="/css/styles.css">
        <title><?php echo $parameters->applicationName; ?></title>

        <meta http-equiv="Access-Control-Allow-Origin" content="*">
        <meta name="theme-color" content="#455a64">

        <link rel="icon" type="image/png" href="/img/favicon.png" />
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
                        <li class="showIfLoggedIn" id="introductionButton">
                            <a href="javascript:;" data-tooltip="Voir l'introduction">
                                <i class="material-icons">info_outline</i>
                            </a>
                        </li>
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

                <handlebars-template name="login" src="/views/login.html"></handlebars-template>

                <!-- EVENTS TABS -->

                <div id="main" class="row">
                    <div class="col s12 showIfLoggedIn">
                        <handlebars-template name="mainTabs" src="/views/blocks/tabs.html"></handlebars-template>
                    </div>
                </div>

                <!-- PROFILE -->

                <handlebars-template name="userProfile" src="/views/user/profile.html"></handlebars-template>
                <handlebars-template name="editUserProfile" src="/views/user/editProfile.html"></handlebars-template>
                <handlebars-template name="editUserPassword" src="/views/user/editPassword.html"></handlebars-template>
                <handlebars-template name="settings" src="/views/user/settings.html"></handlebars-template>

            </div>

            <handlebars-template name="introduction" src="/views/blocks/introduction.html"></handlebars-template>
            <handlebars-template name="infos" src="/views/blocks/infos.html" override="true"></handlebars-template>
            <handlebars-template name="cartConfirm" src="/views/blocks/cartConfirm.html"></handlebars-template>

        </div>

        <!-- LIBS -->

        <script src="/LiftJS/dist/libs/jquery-3.2.1.min.js"></script>
        <script src="/LiftJS/dist/libs/jquery-ui.min.js"></script>
        <script src="/LiftJS/dist/libs/jquery.ui.touch-punch.min.js"></script>
        <script src="/LiftJS/dist/libs/handlebars.min.js"></script>
        <script src="/LiftJS/dist/libs/materialize.js"></script>
        <script src="/LiftJS/dist/libs/moment-with-locales.min.js"></script>
        <!-- UNCOMMENT IF YOU WANT TO SUPPORT LEGACY BROWSER -->
        <!--<script src="js/libs/jquery.history.js"></script>-->

        <!-- APP -->

        <script>
            var appHostname = "<?php echo $parameters->appHostname; ?>";
        </script>

        <script type="text/javascript" src="/LiftJS/js/app.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/utils.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/ui.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/controller.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/events.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/session.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/history.js"></script>
        <script type="text/javascript" src="/LiftJS/js/core/settings.js"></script>
        <!-- <script type="text/javascript" src="LiftJS/dist/liftJs.min.js"></script> -->

        <script type="text/javascript" src="/LiftJS/js/modules/baseUi/baseUi.js"></script>
        <script type="text/javascript" src="/LiftJS/js/modules/webservice/webservice.js"></script>
        <script type="text/javascript" src="/LiftJS/js/modules/featureDiscovery/featureDiscovery.js"></script>

        <!-- BUSINESS COMPONENTS -->

        <script type="text/javascript" src="/js/modules/user.js"></script>
        <script type="text/javascript" src="/js/modules/webservice.js"></script>
        <script type="text/javascript" src="/js/modules/events.js"></script>
        <script type="text/javascript" src="/js/modules/cart.js"></script>

        <!-- APP STARTER -->

        <script type="text/javascript">
            // Set your custom host if needed (without trailing slash)
            app.config.host = "<?php echo $parameters->appHostname; ?>";
            // Set your custom parameters.json path
            app.config.parametersPath = "/?getParameters=1";

            app.core.ui.displayContentLoading();
            // START APP
            $(document).ready(app.init());
        </script>

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
