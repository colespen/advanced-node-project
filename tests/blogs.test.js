const Page = require("./helpers/page");
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When user logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating"); // create new blog
  });
  test("can see blog and create form", async () => {
    const label = await page.getContentsOf(".title label");
    expect(label).toEqual("Blog Title");
  });

  describe("and using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "Blog Title");
      await page.type(".content input", "some content");
      await page.click("form button[type='submit']");
    });
    test("submitting takes user to review screen", async () => {
      const confirmText = await page.getContentsOf("form h5");

      expect(confirmText).toEqual("Please confirm your entries");
    });
    test("submitting then saving adds blog to index", async () => {
      await page.click("button.green");
      await page.waitForSelector(".card");
      const titleText = await page.getContentsOf(".card-title");
      const contentText = await page.getContentsOf(".card-content p");

      expect(titleText).toEqual("Blog Title");
      expect(contentText).toEqual("some content");
    });
  });

  describe("and using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button[type='submit']");
    });
    test("the form shows an error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When user not logged in", async () => {
  const actions = [
    {
      method: "get", // this matches to actual class method
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "Blog Title",
        content: "some content",
      },
    },
  ];

  test("Blog related actions are prohibited", async () => {
    const results = await page.execRequests(actions);
    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });
});
