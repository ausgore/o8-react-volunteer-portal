<?php
$key = "iloveo8";
$iv = "8f3f2f0355c37b7d1dd81965dbd0516f";
$encryption = 'U2FsdGVkX18QUxg2p8bEWSRqmgjO3l7MXj0Ths5HG35AR3oaFBmO3DULmxVejF5Lk2xn5dvikl4nOq5VH/dDTEKUZk0g0QLDrOLuJh2PPcE1S8V758CqIuLrBzwHJFII';
$decryptedString = openssl_decrypt($encryption, "AES-256-CBC", $key, 0, hex2bin($iv));
echo $encryption;
echo "<br/>";
echo $iv;
echo "<br/>";
echo $decryptedString;
echo "<br/>";
echo json_decode($decryptedString);
?>