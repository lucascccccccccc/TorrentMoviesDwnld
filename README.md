# TorrentMoviesDwnld

A modern application for managing and downloading movies. 
Built with **Bun**, **Elysia**, **Prisma**, **JWT Authentication**, and styled using **Tailwind CSS** **Shadcn**. 
The app provides a backend API documented via **Swagger**, and a frontend built with **Next.js**.

## Features

- **Movie Search**: Search movies from **TMDb API** by movie name. (w support for download link ())
- **User Authentication**: Users can register, login/logout and authenticate with **JWT** tokens.
- **Movie Comments**: Users can leave comments on movies with 0-5 rating.
- **Dashboard**: An overview of movie data, user infos, and other relevant information.

## Technologies

- **Backend**: 
  - **Bun** for package management.
  - **Elysia** for building the API.
  - **Prisma** for database management.
  - **JWT** for authentication.


- **Frontend**:
  - **Next.js** for the frontend framework.
  - **Tailwind CSS** for styling.
  - **ShadCN** for UI components.

## Setup

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/TorrentMoviesDwnld.git
   ```

2. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Configure the database with **Prisma**:
   - Set up your `.env` file for PostgreSQL credentials.
   - Run the migrations:
     ```bash
     npx prisma migrate dev
     ```

5. Start the backend:
   ```bash
   bun dev
   ```

### Frontend

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

4. Access the frontend at `http://localhost:3000`.

## Swagger API Documentation

- The API is documented with **Swagger**. Visit `http://localhost:3000/swagger` to view and interact with the API endpoints.

## Project Structure

- `backend/`: API and server-side logic.
- `frontend/`: Client-side interface built with Next.js and styled with Tailwind CSS.
- `README.md`: This file.

## Screenshots

Here are some screenshots of the application:

- ![Screenshot 1](https://i.imgur.com/5ZFiWSd.png)
- ![Screenshot 2](https://i.imgur.com/0bJpvnK.png)
- ![Screenshot 3](https://i.imgur.com/3za8udB.png)
- ![Screenshot 4](https://i.imgur.com/npncdxF.png)
- ![Screenshot 5](https://i.imgur.com/odSWFh4.jpeg)
- ![Screenshot 6](https://i.imgur.com/kHsAANW.png)
- ![Screenshot 7](https://i.imgur.com/o9dd6Z6.png)


## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add your feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
