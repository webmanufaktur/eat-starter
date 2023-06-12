const timestamp = new Date();

module.exports = function () {
  return {
    title: "Eleventy Starter",
    description: "Starter with Eleventy, AlpineJS, and TailwindCSS.",
    email: "eat-starter@webmanufaktur.net",
    author: "webmanufaktur",
    timestamp: timestamp * 1000,
    version: "2 (DEV)",
    locale: "en_EN",
    lang: "en",
    devmode: process.env.DEVMODE,
    domain: process.env.DOMAIN || "localhost:8080",
    url: process.env.URL || "http://localhost:8080",
  };
};

console.log("Our environment is: " + process.env.DEVMODE);
