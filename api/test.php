<?php
require_once '..\..\wp-content\plugins\civicrm\civicrm\civicrm.config.php';
require_once '..\..\wp-content\plugins\civicrm\civicrm\CRM\Core\Config.php';

$result = civicrm_api4("activity", "get", [
    "where" => [
        ["subject", "CONTAINS", json_decode("shine")],
        ["event_details.category", "IN", json_decode("[1]")]
    ]
]);

header("Content-Type: application/json");   
echo json_encode($result);
?>