import express, { Request, Response } from "express";
import { postSummariesForKeyword, findThread, Tag } from "./data/index";

const app = express();
const port = 9013;

app.use(express.static("public"));
app.set("view engine", "hbs");

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/search.html");
});

app.get("/results", (req: Request, res: Response) => {
  const keyword = req.query.keyword as string | undefined;
  if (!keyword) {
    res.render("results", { error: "Please provide a keyword" });
    return;
  }

  // If you want to sort by multiple aspects, rawSort type
  // should be a string or array, instead of string or undefined.
  // You would then need to loop over that array and process it accordingly.
  const rawSort = req.query.sort as string | undefined;
  const sort = rawSort === "oldest" ? rawSort : "newest";

  const boop: Tag[] = ["chronicles"];

  const posts = postSummariesForKeyword(keyword, sort, boop);
  res.render("results", {
    posts,
    searchterm: keyword,
    total: posts.length,
  });
});

app.get("/post/:file", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  res.render("thread", { posts: findThread(req.params.file) });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
