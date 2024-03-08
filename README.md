# Microservices Project

## Overview

This web application features a motus game, an authentication system and a scoring system. It employs a microservice architecture with services for authentication, game logic, and score tracking. User information is stored in a PostgreSQL database, while game scores are managed in a Redis database.

### Services

- **Authentication Service**: Handles user registration and login.
- **Game Service**: Manages the Motus game logic.
- **Score API**: Tracks and retrieves player scores.

## Authentication Service

### Technologies

- Database: PostgreSQL , Redis
- Backend: NodeJS

### Endpoints

- `/register`: Registers a new user.
  - **Method**: POST
  - **Body**:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "username": "john_doe",
      "password": "secure_password"
    }
    ```
  - **Response**: Confirmation of registration.

- `/login`: Authenticates a user.
  - **Method**: POST
  - **Body**:
    ```json
    {
      "username": "john_doe",
      "password": "secure_password"
    }
    ```
  - **Response**: Authentication token.

## Game Service

### Game Logic

1. A random word is selected daily based on a generated random number.
2. Users have 6 attempts to guess the word.
3. Feedback provided for each guess:
   - Green highlight: Correct letter and placement.
   - Orange highlight: Correct letter, wrong placement.
   - No highlight: Incorrect letter.

### Technologies

- Backend: [Your technology stack]
- Database: Integrated with the main PostgreSQL database for user validation.

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
- Backend: [Your technology stack]

## Security Considerations

Ensure all communications are secured via HTTPS, and passwords are hashed before being stored in the PostgreSQL database. Use JWTs (JSON Web Tokens) for managing user sessions post-authentication.

## Deployment

[Include instructions on how to deploy the microservices, covering any Docker containers, Kubernetes configurations, or cloud-specific deployment instructions.]

---

This documentation provides a foundational overview of your web application's architecture, services, and endpoints. Adjust the technology stack, deployment instructions, and any additional details specific to your implementation as necessary.
