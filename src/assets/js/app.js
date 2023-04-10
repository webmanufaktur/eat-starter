document.addEventListener("alpine:init", () => {
  console.log("AlpineJS is ready to go"),
    Alpine.store("aj", {
      static: Alpine.$persist({
        version: 1,
      }).as("AlpineJsStorage"),

      // frank: true,
      // joshi: true,

      // toggleFrank() {
      //   this.joshi = !this.joshi;
      //   console.log(this.joshi);
      // },
    });
});

console.log("app.js is ready to go");
