import express, { Request, Response } from "express";
import {
  postSummariesForKeyword,
  findThread,
  Tag,
  Include,
} from "./data/index";

const app = express();
const port = 80;

app.use(express.static("public"));
app.set("view engine", "hbs");

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/search.html");
});

const redirectFancyParams = (req:any) => {
  console.log("req.url = ", req.url)

  const urlSections = req.url.split('&');
  const yearSearchIsFalse = req.url.includes('single-year=no');
  const singleYearSectionIndex = urlSections.findIndex((item:any) => item.includes("single-year"));

  if (yearSearchIsFalse) {
    // we're not searching by year, so remove all references to year from URL
    urlSections.length = singleYearSectionIndex;
  } else {
    // we're searching by year, so only remove the single-year param
    urlSections.splice(singleYearSectionIndex, 1);
    const yearParamIndex = urlSections.findIndex((item:any) => item.includes("year"));
    let yearParam = urlSections[yearParamIndex];
    console.log("yearParam value = ", yearParam)
    // if yearParam === 'year=', force it to say 'year=all'
    if(yearParam === 'year=') {
      urlSections[yearParamIndex] = 'year=all';
    }
  }

  const newURL = urlSections.join('&')
  console.log("newURL = ", newURL);
  return newURL;
}

app.get("/results", (req: Request, res: Response) => {
  const newURL = redirectFancyParams(req);
  res.redirect(newURL);

  // [
  //   '/results?keyword=Riven+Hills',
  //   'categories=chronicles',
  //   'categories=unofficial',
  //   'include=post',
  //   'single-year=yes',
  //   'year=10'
  // ]

  const keyword = req.query.keyword as string | undefined;
  if (!keyword) {
    res.render("results", {
      error: "Please provide a keyword to start your search.",
    });
    return;
  }

  const include = req.query.include as Include;

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

  // ALL THE YEAR FUDGING
  const searchByYear = req.query['single-year'];
  const rawYear = parseInt(req.query.year as string) - 1;
  const doubleDigitYear = rawYear < 10 ? "0" + rawYear : rawYear;
  const years = searchByYear === 'no' 
    ? 'all' 
    : (doubleDigitYear ? [doubleDigitYear?.toString()] : [])

  const posts = postSummariesForKeyword(
    keyword,
    sort,
    categories,
    include,
    years
  );
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
