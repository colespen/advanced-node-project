const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  constructor(page) {
    this.page = page;
  }

  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  async login() {
    // make new user ID from mongoose model to generate session object (work in reverse)
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    // set sesion & sig on page instance as cookies
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto("localhost:3000/blogs");
    // need to wait until page fully renders
    await this.page.waitForSelector('a[href="/auth/logout"]');
  }

  getContentsOf(selector) { // async await not needed
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(async (_path) => {
      const res = await fetch(_path, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My Title",
          content: "some blog content",
        }),
      });
      return res.json();
    }, path);
  }

  post(path, body) {
    return this.page.evaluate(
      async (_path, _body) => {
        const res = await fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_body),
        });
        return res.json();
      },
      path,
      body
    );
  }

  execRequests(actions) {
    // array of promises (fetch actions)
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data); // ex. this[method] = this.post() ..
      })
    );
  }
}

module.exports = CustomPage;
