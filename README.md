# Microservices Project
### Group members
- Amr Mohamed
- Anh Thu DOAN
- Mazen Gamdou

## How it works ?
Download the github repository, open a terminal at the root of the project. Run the following commands :

## Overview

This web application features a motus game, an authentication system and a scoring system. It employs a microservice architecture with services for authentication, game logic, and score tracking. User information is stored in a PostgreSQL database, while game scores are managed in a Redis database.

### Services

- **Authentication Service**: Handles user registration and login.
- **Game Service**: Manages the Motus game logic.
- **Score API**: Tracks and retrieves player scores.
- **HAProxy Load Balancer**: Distributes incoming traffic between two instances of the Motus Game Service to ensure load balancing and high availability.
![Untitled diagram-2024-03-08-195949](https://github.com/mazen-gamdou/Microservices_Project/assets/67543487/af6135a4-0c20-4a4f-9ef1-c098f340ce64)

## Authentication Service

### Technologies

- **Database**: PostgreSQL
- **Backend**: NodeJS
- **Server**: Express.js
- **Security**: Bcrypt for password hashing, crypto for secure tokens
- **Session Management**: Express-session
- **Cross-Origin Resource Sharing**: CORS

### Endpoints

- `/register`: 
  - **Endpoint**: /register 
  - **Method**: POST
  - **Description**: Registers a new user by adding their details to the database.
  - **Body**: 
      ```json
    {
      "firstname": "Tokyo",
      "lastname": "Doan",
      "username": "toto",
      "password": "secure_password"
    }
    ```
  - **Response**:  A message confirming registration or an error message if registration fails.
  - **Success Response Example**:
     ```json
    {
     "message": "User registered successfully."
    }
    ```

  - **Error Response Example**:
    ```json
    {
     "message": "Registration failed."
     "message": "User already exists"
     "message": "Internal Server Error"
    }
    ```
- `/login`: 
  - **Endpoint**: /login
  - **Method**: POST
  - **Description**: Authenticates users by checking their credentials and creating a session.
  - **Body**: 
    ```json
    {
      "username": "toto",
      "password": "secure_password"
    }
    ```
  - **Response**: A redirection to the game's main page if successful or an error message if login fails.
  - **Error Response Example**:
    ```json
    {
      "error": "Invalid username or password."
    }
    ```
- **User Session Check**
  
  - **Endpoint**: /api/user
  - **Method**: GET
  - **Description**: Checks if the user is currently logged in and returns the username.
  - **Response**: JSON object with the username if the user is authenticated.
  - **Success Response Example**:
    ```json
     {
        "username": "toto"
     }
     ```
### Security Considerations

- **Passwords**: All passwords are hashed using bcrypt before being stored in the database.
- **Sessions**: Sessions are managed with express-session. Ensure to use the secure flag on cookies in production with HTTPS.
- **Environment Variables**: Do not hardcode sensitive information such as database credentials. Use environment variables.
- **CORS**: Configure CORS appropriately to ensure that the API only accepts requests from trusted origins.

## Game Service

### Game Logic

1. A random word is selected daily based on a generated random number.
2. Users have 6 attempts to guess the word.
3. Feedback provided for each guess:
   - Green highlight: Correct letter and placement.
   - Orange highlight: Correct letter, wrong placement.
   - No highlight: Incorrect letter.

### Technologies

- Backend: Node.js
- Backend web application framework: Express.js

## Score API

### Endpoints

- `/setscore`: Records a player's score.
  - **Method**: POST
  - **Body**:
    ```json
    {
      "username": "john_doe",
      "score": 100
    }
    ```
  - **Response**: Confirmation of score recording.

- `/getscore`: Retrieves a player's score.
  - **Method**: GET
  - **Query Parameters**: `username=john_doe`
  - **Response**:
    ```json
    {
      "username": "john_doe",
      "score": 100
    }
    ```

### Technologies

- Database: Redis
- Backend: Node.js / Express.js

## HAProxy Load Balancer

Distributes traffic to the Motus Game Service instances, enhancing application scalability and availability.


## Deployment

The application is deployed using Docker and Docker Compose, enabling streamlined setup and scalability. The `docker-compose.yml` file defines the services, networks, and volumes required for the application.

---

This documentation provides a foundational overview of your web application's architecture, services, and endpoints. Adjust the technology stack, deployment instructions, and any additional details specific to your implementation as necessary.
