Setup:

1. Create the app on Facebook
2. "+ Add Product" -> "Facebook Login"
3. Add your callback URL to "Valid OAuth redirect URIs" (e.g.
   `http://localhost:3000/__/auth/facebook`)
4. Go to "Settings" -> "Basic":
5. "Add Platform" -> "Website"
6. Enter site URL (e.g. http://localhost:3000/)
7. Add "localhost" (or your domain name) to "App Domains
8. "Save Changes"
9. Copy "App ID" into the `FACEBOOK_APP_ID` environment variable
10. Copy "App Secret" into `FACEBOOK_APP_SECRET` environment variable
