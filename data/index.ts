interface Signature {
  text?: string;
  html?: string;
  images?: string[];
}

interface PostContent {
  text?: string;
  html?: string;
}

interface DatePosted {
  text: string;
  html: string;
  date: string;
}

export interface Post {
  title?: string;
  author: string;
  byline?: string;
  datePosted: DatePosted;
  signature?: Signature;
  content?: PostContent;
}

export interface Providence {
  source: { file: string; index: number };
}

interface ScraperData {
  file: string;
  posts: Post[];
}

const sourcePosts = (path: string, tag: string): Array<Post & Providence> =>
  require(path).flatMap((data: ScraperData) => {
    return data.posts.map((post, i) => ({
      ...post,
      source: { file: data.file, index: i, tag },
    }));
  });

const postsByTag = {
  chronicles: sourcePosts("./chronicles.json", "chronicles"),
  rumors: sourcePosts("./rumours.json", "rumors"),
  uncategorised: sourcePosts("./uncategorised.json", "uncategorised"),
  unofficial: sourcePosts("./unofficial.json", "unofficial"),
};

export type Tag = keyof typeof postsByTag;

export type Include = "post" | "title" | "author";

const emptyPostsArray = (): Array<Post & Providence> => [];

const collectTags = (tags: Tag[]) =>
  emptyPostsArray().concat(...tags.map((tag) => postsByTag[tag]));

export const allPosts: Array<Post & Providence> = collectTags([
  "chronicles",
  "rumors",
  "uncategorised",
  "unofficial",
]);

export const allYears = String(Array(21))
  .split(",")
  .map(function (el, i) {
    return i < 10 ? "0" + i : "" + i;
  });

export const postSummariesForKeyword = (
  keyword: string,
  startingFrom: "newest" | "oldest",
  tags: Tag[],
  include: Include,
  years: string[]
) => {
  console.log("YEARS RECIEVED = ", years);
  if (!years.length) {
    console.log("Received no years, defaulting to all years");
    years = allYears;
  }
  console.log("value of 'years' being used = ", years);
  if (tags.length === 0) {
    tags = ["chronicles", "rumors", "uncategorised", "unofficial"];
  }
  return collectTags(tags)
    .flatMap(({ title, author, datePosted, content, source }) => {
      let postText;
      if (include === "post") {
        postText = content?.text;
      } else if (include === "title") {
        postText = title;
      } else if (include === "author") {
        postText = author;
      } else postText = content?.text;

      if (
        !postText ||
        !postText.toLowerCase().includes(keyword.toLowerCase())
      ) {
        return []; // Exclude post from results
      }

      const shortDate = datePosted.text.split(",")[0];
      const exactYear = shortDate.substr(shortDate.length - 2);

      if (!years.includes(exactYear)) {
        console.log("Excluding post from results b/c year");
        return []; // exclude post if it doesn't match date range given
      }

      return [
        {
          title,
          author,
          datePosted,
          shortDate,
          source,
          match: highlightMatch(postText, keyword),
        },
      ];
    }) // end of flatMap method
    .sort(
      (a, b) =>
        (startingFrom === "oldest" ? 1 : -1) *
        a.datePosted.date.localeCompare(b.datePosted.date)
    );
}; // end of postSummariesForKeyword

const highlightMatch = (text: string, keyword: string): string => {
  const location = text.toLowerCase().indexOf(keyword.toLowerCase());
  const matchString =
    location < 50
      ? text.substring(0, 100) + "..."
      : "..." + text.substring(location - 50, location + 50) + "...";

  const matchedText = text.substring(location, location + keyword.length);
  return matchString.replace(
    new RegExp(keyword, "gi"),
    `<strong>${matchedText}</strong>`
  );
};

export const findThread = (file: string) => {
  const postData = allPosts.filter((post) => post.source.file === file);
  return postData;
};

export default allPosts;
