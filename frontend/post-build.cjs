const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../');
const indexHtml = path.join(buildDir, 'index.html');
const indexPhp = path.join(buildDir, 'index.php');

// PHP code to prepend
const phpCode = `<?php
require_once('../../wordpress/wp-load.php');

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
?>`;

// Rename index.html to index.php
fs.rename(indexHtml, indexPhp, (err) => {
  if (err) {
    console.error('Failed to rename index.html to index.php', err);
    return;
  }

  // Prepend PHP code to index.php
  fs.readFile(indexPhp, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read index.php', err);
      return;
    }

    const updatedContent = phpCode + '\n' + data;

    fs.writeFile(indexPhp, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Failed to write updated index.php', err);
      } else {
        console.log('PHP code has been prepended to index.php');
      }
    });
  });
});
