# A couple of things to note
1. Make sure to extract all of this into an empty folder in the **wordpress** directory in your CiviCRM Wordpress project.
Note that the name of the folder will be how you access your page each time you compile.
Example, **xampp/htdocs/wordpress/portal/index.html** would be http://localhost/wordpress/portal

2. Be sure to run **npm run build** to compile and display in http://localhost/wordpress/custom_folder. You will know you have done it correctly if a newly generated **index.html** is in your root directory under **wordpress/custom_folder**. Do this **EVERY TIME** you make a new change in the frontend directory.
You could **npm run dev**, but it will be in a seperate http://localhost:5173 which would not work in Wordpress.

3. You could use wp_login_example.php to test Wordpress login for dynamic email data fetching rather than hardcoding, but you will have to delete index.html everytime you build, and replace the index script in line 21 to be the latest compiled file under the assets folder.

4. Use the CRM function under **frontend/src/crm.ts** rather than trying to fetch directly from **api/traditional_api_call.php**.
An example on how you would use the CRM function:
```js
// To get contact where id = 1
CRM("Contact", "get", {
  select: ["id"],
  where: [["id", "=", 1]]
});

// To update contact where id = 1, changing property foo to value "bar"
CRM("Contact", "update", {
  where: [["id", "=", 1]],
  values: [["foo", "bar"]]
});
```
Refer to your CiviCRM's **Support/Developer/Api4** for more documentation. Syntax should be very similar to Javascript examples.
