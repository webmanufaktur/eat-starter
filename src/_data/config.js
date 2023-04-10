const timestamp = new Date();

module.exports = function () {
  return {
    title: "Eleventy Starter",
    description: "Starter with Eleventy, AlpineJS, and TailwindCSS.",
    lang: "en",
    email: "eat-starter@webmanufaktur.net",
    author: "webmanufaktur",
    timestamp: timestamp * 1000,
    version: "0.1.0 (WIP)",
    locale: "en_EN",
    lang: "en",
    domain: process.env.DOMAIN || "localhost:8080",
    url: process.env.URL || "http://localhost:8080",
  };
};
