<?php

class App
{

    /**
     * getApiToken.
     *
     * @param type $token
     * @param type $refreshToken
     *
     * @return string
     */
    public function getApiToken($token = null, $refreshToken = null, $recursion = false)
    {
        $parameters = $this->getParameters();

        $wsUrl = sprintf(
            '%s://%s%s', $parameters->webservice->protocol, $parameters->webservice->hostname, '/tck.php/api/oauth/v2/token'
        );

        $user = $parameters->user;
        $secret = $parameters->secret;

        $ch = curl_init();

        if ($refreshToken) {
            $url = sprintf(
                '%s?client_id=%s&client_secret=%s&grant_type=refresh_token&refresh_token=%s', $wsUrl, $user, $secret, $refreshToken
            );
        } else {
            $url = sprintf(
                '%s?client_id=%s&client_secret=%s&grant_type=password', $wsUrl, $user, $secret
            );
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $res = curl_exec($ch);

        if ($res == '') {
            if (!$recursion) {
                $res = $this->getApiToken(null, null, true);
            }
        }

        $json = json_decode($res);

        if (!isset($json->lifecycle) && $refreshToken) {
            $json->lifecycle = 'refresh';
        } else {
            $json->lifecycle = 'create';
        }

        return json_encode($json);
    }

    public function getParameters()
    {
        return json_decode(file_get_contents('./data/parameters.json'));
    }

    public function getApiTokenAction($token, $refreshToken = null)
    {
        header('Content-Type: application/json');

        $token = (string) filter_var($token, FILTER_UNSAFE_RAW);

        if ($refreshToken) {
            $refreshToken = (string) filter_var($refreshToken, FILTER_UNSAFE_RAW);
        } else {
            $refreshToken = null;
        }

        $data = $this->getApiToken($token, $refreshToken);
        echo $data;
        die();
    }

    public function getParametersAction()
    {
        header('Content-Type: application/json');
        $params = $this->getParameters();
        unset($params->user);
        unset($params->secret);
        echo json_encode($params, JSON_FORCE_OBJECT);
        die();
    }

}
