# A couple of things to note
1. Make sure to extract all of this into an empty folder under "wordpress" in your Wordpress/CiviCRM folder.
Note that the name of the folder will be how you access your page each time you compile.
Example, xampp/htdocs/wordpress/portal/index.html would be http://localhost/wordpress/portal

2. Be sure to run "npm run build" for production to be displayed in http://localhost/wordpress/custom_name_here.
You could technically "npm run dev", but it will be in a seperate http://localhost:5173 which would not work in Wordpress.

3. You could use wp_login_example.php to test Wordpress login for dynamic email data fetching rather than hardcoding. But you will have to delete index.html everytime you build, and replace the index script in line 21 to be the latest compiled file under the assets folder.

4. Use the CRM function under **frontend/src/crm.ts** rather than trying to fetch directly from **api/crm.php** or **api/proxy.php**.
An example on how you would use the CRM function:
```js
CRM("Contact", "get", {
  select: ["id"],
  where: [["id", "=", 1]]
});
```
Refer to your CiviCRM's **Support/Developer/Api4** for more documentaion. Syntax should be very similar to Javascript examples.
