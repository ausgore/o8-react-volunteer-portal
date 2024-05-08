<?php
// Add WordPress core to use its functionalities
require_once($_SERVER['DOCUMENT_ROOT'] . '/wordpress/wp-load.php'); 

$apiKey = 'axiepC4R2hVV0MZKzUMdJTfg';
$siteKey = 'vIT7qI9X1i3ucgXxRF1tIp9rO4zELkiilgESLtDWY';
$baseUrl = 'http://localhost/wordpress/wp-content/plugins/civicrm/civicrm/extern/rest.php';

// Get the HTTP method
$httpMethod = $_SERVER['REQUEST_METHOD'];

$params = array();
// Collect parameters based on the method
switch ($httpMethod) {
    case 'GET':
        $params = $_GET;
        break;
    case 'POST':
        // If input is of type json, decode json
        if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
            $params = json_decode(file_get_contents("php://input"), true);
        } else {
            $params = $_POST;
        }
        break;
    default:
        header('HTTP/1.1 405 Method Not Allowed');
        exit;
}

$params['api_key'] = $apiKey;
$params['key'] = $siteKey;
$params['json'] = 1; // Request JSON format from CiviCRM

$params["entity"] = "contact";
$params["action"] = "get";

// Build the full query URL
$queryParams = http_build_query($params);
$url = $baseUrl . '?' . $queryParams;

// Make the API call using WordPress's HTTP API
$response = wp_remote_request($url, array(
    'method'    => $httpMethod,
    'timeout'   => 30,
    'body'      => $params
));

if (is_wp_error($response)) {
    $result = array('error' => $response->get_error_message());
} else {
    $result = wp_remote_retrieve_body($response);
    $result = json_decode($result, true);
}

header('Content-Type: application/json');
echo json_encode($result);
?>