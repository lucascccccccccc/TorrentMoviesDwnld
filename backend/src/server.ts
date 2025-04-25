import { Elysia } from "elysia";
import { movieRoutes } from "./modules/movie/movie.route";
import { userRoutes } from "./modules/user/user.route";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { reviewRoutes } from "./modules/review/review.route";

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}

const app = new Elysia()
  .use(swagger())
  .use(cors(corsOptions))
  .group("/api", (app) => app
    .use(userRoutes)
    .use(movieRoutes)
    .use(reviewRoutes))

app.listen(3001);
console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
