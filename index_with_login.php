<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/wordpress/wp-load.php');

if (is_user_logged_in()) {
  $user = wp_get_current_user();
  $id = $user -> ID;
  $email = $user -> user_email;
}
else {
    $login_url = wp_login_url('http://localhost/wordpress/portal');
    wp_redirect($login_url);
    exit;
}
?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" crossorigin src="/wordpress/portal/assets/index-DrWrzCUw.js"></script>
    <link rel="stylesheet" crossorigin href="/wordpress/portal/assets/index-CiX-gJ7O.css">
  </head>
  <body>
    <div id="root"></div>
    <script>
       var id = "<?php echo esc_js($id) ?>";
       var email = "<?php echo esc_js($email) ?>";
    </script>
  </body>
</html>