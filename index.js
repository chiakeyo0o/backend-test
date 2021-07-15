const express = require("express");
const https = require("https");

const app = express();
const PORT = 3000;

const COMMENTS_URL = "https://jsonplaceholder.typicode.com/comments";
const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

const getData = async (url) => {
  let data = "";
  return new Promise((resolve) => {
    https.get(url, (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(data));
      });
    });
  });
};

const getComments = async () => {
  return await getData(COMMENTS_URL);
};

const getPosts = async () => {
  return await getData(POSTS_URL);
};

app.get("/top_comment_post", async (req, res) => {
  const comments = await getComments();
  let posts = await getPosts();

  const { limit = posts.length } = req.query;
  posts = posts
    .map((post) => {
      post.commentCount = comments.filter(
        (comment) => comment.postId === post.id
      ).length;
      return post;
    })
    .sort((a, b) => (a.commentCount < b.commentCount ? 1 : -1));

  res.json(posts.slice(0, limit));
});

app.get("/search_comments", async (req, res) => {
  let comments = await getComments();
  if (comments.length === 0) {
    return res.json([]);
  }

  for (let key in req.query) {
    if (comments[0][key] == null) continue;
    if (typeof comments[0][key] === "number") {
      comments = comments.filter((comment) => {
        const b = parseInt(req.query[key]);
        return comment[key] === b;
      });
    } else {
      comments = comments.filter((comment) => {
        return comment[key].includes(req.query[key]);
      });
    }
  }

  res.json(comments);
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}...`);
});
