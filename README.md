# ResolveIT

# 1. Install Required Packages

You will be using Node.js with some additional packages to handle the database interactions and server requests.

    Open a terminal or command prompt.
    Navigate to your project directory where your HTML, CSS, and JavaScript files are located (or where you want to store your backend files).

Run the following commands to install Node.js and the required packages:

npm init -y
npm install express sqlite3 body-parser cors

# 2. Run the Node.js Server

Once you’ve set up your app.js file, you need to run the server to handle requests from the frontend and interact with the database.

In your terminal, navigate to the folder where you created the app.js file, and run:

bash

node app.js

If everything is set up correctly, you should see:

Server is running on port 5000
Connected to the SQLite database.
