<?php
require_once '..\..\wp-content\plugins\civicrm\civicrm\civicrm.config.php';
require_once '..\..\wp-content\plugins\civicrm\civicrm\CRM\Core\Config.php';
$config = CRM_Core_Config::singleton();

$params = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $params = json_decode(file_get_contents("php://input"), true);
} else {
    $params = $_POST;
}

// Force test values here
// Force test values here

// Dynamically setting the entity and action provided in axios.post() param
$entity = $params['entity'];
$action = $params['action'];
$select = $params['select'] ?? array();
$where = $params['where'] ?? array();
$order = $params['order'] ?? array();
$values = $params['values'] ?? array();

$class = "\\Civi\\Api4\\" . $entity;
$result = $class::$action(TRUE)
    -> setLimit($params['limit'] ?? null);
if (is_array($select) && !empty($select)) $result = $result -> addSelect(...$select);
if (is_array($values) && !empty($values)) foreach($values as $v) $result = $result -> addValue(...$v);
if (is_array($where) && !empty($where)) foreach($where as $w) $result = $result -> addWhere(...$w);
if (is_array($order) && !empty($order)) foreach($order as $o) $result =  $result -> addOrderBy(...$o);

$result = $result -> execute();

header('Content-Type: application/json');
echo json_encode($result);
?>