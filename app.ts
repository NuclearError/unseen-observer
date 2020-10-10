import express, { Request, Response } from "express";
import {
  postSummariesForKeyword,
  findThread,
  Tag,
  Include,
} from "./data/index";

const app = express();
// const port = 443; // prod
const port = 9013;

app.use(express.static("public"));
app.set("view engine", "hbs");

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/search.html");
});

app.get("/results", (req: Request, res: Response) => {
  const keyword = req.query.keyword as string | undefined;
  if (!keyword) {
    res.render("results", {
      error: "Please provide a keyword to start your search.",
    });
    return;
  }

  const rawInclude: Include | undefined = req.query.include as
    | Include
    | undefined;

  // If you want to sort by multiple aspects, rawSort type
  // should be a string or array, instead of string or undefined.
  // You would then need to loop over that array and process it accordingly.
  const rawSort = req.query.sort as string | undefined;
  const sort = rawSort === "oldest" ? rawSort : "newest";
  const rawCategories = req.query.categories as any;

  const allCategories: Tag[] = [
    "chronicles",
    "unofficial",
    "rumors",
    "uncategorised",
  ];
  let categories;
  if (!rawCategories) {
    categories = allCategories;
  } else if (typeof rawCategories === "string") {
    categories = [rawCategories];
  } else categories = rawCategories;

  if (categories.includes("all")) {
    categories = allCategories;
  }

  const include = req.query.include as Include;

  const posts = postSummariesForKeyword(keyword, sort, categories, include);
  res.render("results", {
    posts,
    searchterm: keyword,
    total: posts.length,
    sort,
    preserved_parameters: Object.entries(req.query)
      .filter(([name]) => name !== "sort")
      .map(([name, value]) => ({
        name,
        value,
      })),
  });
});

app.get("/post/:file", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  res.render("thread", { posts: findThread(req.params.file) });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
