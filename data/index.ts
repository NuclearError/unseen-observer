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

const emptyPostsArray = (): Array<Post & Providence> => [];

const collectTags = (tags: Tag[]) =>
  emptyPostsArray().concat(...tags.map((tag) => postsByTag[tag]));

export const allPosts: Array<Post & Providence> = collectTags([
  "chronicles",
  "rumors",
  "uncategorised",
  "unofficial",
]);

export const postSummariesForKeyword = (
  keyword: string,
  startingFrom: "newest" | "oldest",
  tags: Tag[]
) => {
  if (tags === []) {
    tags = ["chronicles", "rumors", "uncategorised", "unofficial"];
  }
  return collectTags(tags)
    .flatMap(({ title, author, datePosted, content, source }) => {
      const postText = content?.text;
      if (
        !postText ||
        !postText.toLowerCase().includes(keyword.toLowerCase())
      ) {
        return []; // Exclude post from results
      }

      const shortDate = datePosted.text.split(",")[0];

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
    })
    .sort(
      (a, b) =>
        (startingFrom === "oldest" ? 1 : -1) *
        a.datePosted.date.localeCompare(b.datePosted.date)
    );
};

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
