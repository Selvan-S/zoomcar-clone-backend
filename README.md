# Zoomcar Clone
## About
This is a Backend for the Zoomcar Clone project, built using the MERN stack.

- [Live Preview](https://zoomcar-clone-selvan.netlify.app/)
- [Frontend repository](https://github.com/Selvan-S/zoomcar-clone-frontend)

## Run
Step 1:
```
npm install
```
Step 2: Create .env file
```
.env
```
Step 3: Name the key and value in your .env file as
```
MONGO_CONNECTION_STRING=
MONGO_URI=<Your MongoDB Connection String>
PORT=5000
JWT_SECRET=<Your JWT secret>
EMAIL_USERNAME=<Your Email>
EMAIL_PASSWORD=<Your App Password created from google account>
CLIENT_URL=http://localhost:<Frontend PORT>
STRIPE_SECRET_KEY=<Your Stripe Secret Key>
STRIPE_WEBHOOK_SECRET=<Your Stripe Webhook Secret Key>
```
Step 4: Add the `.env` in `.gitignore` file <br/> <br/>
Step 5:
```
npm run dev
```
Step 6: Use the below API endpoints for `Authentication` and Base URL is `http://localhost:<PORT>/api/v1/auth`:
```
"/me" -  Get authenticated user (GET)
"/:token" - If the token is in VerifyUser collections, move the user to `users` collections (GET)
"/register" - Signup user (POST). eg., {"name": "name", "email": "example@email.com", "password":"pass123"}
"/login" - Login user (POST). eg., {"email": "example@email.com", "password":"pass123"}
```
Step 7: Use the below API endpoints for `User` and Base URL is `http://localhost:<PORT>/api/v1/user`:
```
"/getUserHostedVehicleStatus" - Get specific user hosted vehicles status list (GET)
"/update" -  Update user details (PUT)
"/forgotpassword" - User email is verified, and reset password link is sent to verified email. (POST)
"/passwordreset/:resetToken" - Check the reset token is expired and update the password. (PUT)
```
Step 8: Use the below API endpoints for `Vehicle` and Base URL is `http://localhost:<PORT>/api/v1/vehicles`:
```
"/" -  Get the filtered vehicles (GET).
"/getAllVehicles" -  Search and Get all vehicles (GET) (Admin).
"/getUnapprovedVehicles" - Get the unapproved host vehicles and update the hostCarStatus (Admin)
"/:id" - Get specific vehicle details (GET).
"/" - Create new vehicle (POST).
"/:id" - Update vehicle details (PUT) (Admin).
"/:id" - Delete vehicle (Delete) (Admin).
```
Step 9: Use the below API endpoints for `Booking` and Base URL is `http://localhost:<PORT>/api/v1/bookings`:
```
"/" -  Get the booked vehicles (GET).
"/" -  Book a vehicle (POST).
"/" - Update the booking (PUT).
```
Step 10: Use the below API endpoints for `Review` and Base URL is `http://localhost:<PORT>/api/v1/reviews`:
```
"/" -  Get the reviews of specific user (GET).
"/" -  Post a reatings and comment for the booked vehicle (POST).
```
Step 10: Use the below API endpoints for `Payment` and Base URL is `http://localhost:<PORT>/api/v1/payment`:
```
"/create-checkout-session/:id" -  Proceed with the vehicle rental by initiating the checkout session (POST).
```
