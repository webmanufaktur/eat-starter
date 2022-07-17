// not perfect but worth taking a closer look
const fs = require("fs");
const path = require("path");

const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");
const pluginPageAssets = require("eleventy-plugin-page-assets");
const pluginTOC = require("eleventy-plugin-toc");
const svgContents = require("eleventy-plugin-svg-contents");
const markdownIt = require("markdown-it");
const markdownItImageFigures = require("markdown-it-image-figures");
const crosslinker = require("markdown-it-auto-crosslinker");
const dictionaryData = fs.readFileSync("src/_data/keywords.json");
const dictionary = JSON.parse(dictionaryData);
const mila = require("markdown-it-link-attributes");
const markdownItAnchor = require("markdown-it-anchor");
const CleanCSS = require("clean-css");
const { minify } = require("terser");

// Details about HowTo enable MarkdownIt Image Figures
// https://github.com/Antonio-Laguna/markdown-it-image-figures
// https://github.com/11ty/eleventy/issues/675#issuecomment-527700027

const markdown = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
})
    .use(markdownItImageFigures, {
        lazy: true,
        async: true,
        classes: "lazy",
        figcaption: true,
    })
    .use(crosslinker, {
        dictionary,
        wholeWords: true,
    })
    .use(markdownItAnchor)
    .use(mila, [
        {
            matcher(href, config) {
                return href.startsWith("https:");
            },
            attrs: {
                target: "_blank",
                rel: "nofollow noopener noreferrer",
            },
        },
        {
            matcher(href, config) {
                return href.startsWith("mailto");
            },
            attrs: {
                rel: "nofollow noopener noreferrer",
            },
        },
        {
            matcher(href, config) {
                return href.startsWith("tel");
            },
            attrs: {
                rel: "nofollow noopener noreferrer",
            },
        },
    ]);

// 11ty image plugin
// basic setup from tutorial
// https://www.11ty.dev/docs/plugins/image/
async function imageShortcodeSimple(src, alt) {
    let metadata = await Image(src, {
        widths: [300, 600, 800, 1024, null],
        formats: ["webp", "jpeg"],
        filenameFormat: function (id, src, width, format) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);

            return `${name}-${id}-${width}w.${format}`;
        },
        urlPath: "/media/", // used in frontend
        outputDir: "_site/media/", // used in dev
    });

    let imageAttributes = {
        alt,
        sizes: "auto",
        loading: "lazy",
        decoding: "async",
    };

    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes);
}

// content pages incl. figcaption
// custom html
async function imageShortcodeBrowser(src, alt, caption) {
    let metadata = await Image(src, {
        widths: [300, 600, 800, 1024, 1280, 1440],
        formats: ["webp", "jpeg"],
        filenameFormat: function (id, src, width, format) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);

            return `${name}-${id}-${width}w.${format}`;
        },
        urlPath: "/media/", // used in frontend
        outputDir: "_site/media/", // used in dev
    });

    let lowsrc = metadata.jpeg[0];
    let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
    if (caption === undefined) {
        caption = alt;
    }

    return `<div class="browser">
  <div class="browser--topbar"></div>
  <div class="browser--content">
<picture>
    ${Object.values(metadata)
        .map((imageFormat) => {
            return `  <source type="${
                imageFormat[0].sourceType
            }" srcset="${imageFormat
                .map((entry) => entry.srcset)
                .join(", ")}" sizes="auto">`;
        })
        .join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        title="${alt}"
        loading="lazy"
        sizes="auto",
        decoding="async">
    </picture></div></div>`;
}

async function imageShortcode(src, alt, caption) {
    let metadata = await Image(src, {
        widths: [300, 600, 800, 1024, 1280, null],
        formats: ["webp", "jpeg"],
        filenameFormat: function (id, src, width, format) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);

            return `${name}-${id}-${width}w.${format}`;
        },
        urlPath: "/media/", // used in frontend
        outputDir: "_site/media/", // used in dev
    });
    let lowsrc = metadata.jpeg[0];
    let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
    if (caption === undefined) {
        caption = alt;
    }

    return `<figure><picture>
    ${Object.values(metadata)
        .map((imageFormat) => {
            return `  <source type="${
                imageFormat[0].sourceType
            }" srcset="${imageFormat
                .map((entry) => entry.srcset)
                .join(", ")}" sizes="auto">`;
        })
        .join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="lazy"
        sizes="auto",
        decoding="async">
        <figcaption>${caption}</figcaption>
    </picture></figure>`;
}

// You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
// return Image.generateHTML(metadata, imageAttributes);
// }

// module exports
module.exports = function (eleventyConfig) {
    // Set directories to pass through to the _site folder
    eleventyConfig.addPassthroughCopy("src/assets/");
    eleventyConfig.addPassthroughCopy("images/");
    eleventyConfig.addPassthroughCopy("img/");
    eleventyConfig.addPassthroughCopy("src/robots.txt");
    eleventyConfig.addPassthroughCopy("src/.htaccess");

    // Inline SVGs
    eleventyConfig.addPlugin(svgContents);
    // TOC
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ["h2", "h3"], // which heading tags are selected headings must each have an ID attribute
        wrapper: "div", // element to put around the root `ol`/`ul`
        wrapperClass: "toc", // class for the element around the root `ol`/`ul`
        ul: false, // if to use `ul` instead of `ol`
        flat: true, // if subheadings should appear as child of parent or as a sibling
    });

    // asset management
    eleventyConfig.addPlugin(pluginPageAssets, {
        mode: "directory",
        postsMatching: "src/**/*.md",
        assetsMatching: "*.jpg|*.png|*.gif|*.mp4|*.webp|*.webm|.svg",
        silent: true,
    });

    // RSS Feeds
    eleventyConfig.addPlugin(pluginRss, {
        posthtmlRenderOptions: {
            closingSingleTag: "default", // opt-out of <img/>-style XHTML single tags
        },
    });

    // open a browser window on --watch
    eleventyConfig.setBrowserSyncConfig({
        open: true,
    });

    // SHORTCODES
    // 11ty image plugin shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
    eleventyConfig.addNunjucksAsyncShortcode(
        "imageSimple",
        imageShortcodeSimple
    );
    eleventyConfig.addNunjucksAsyncShortcode(
        "imageBrowser",
        imageShortcodeBrowser
    );

    // shortcode for inserting the current year
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    // FILTERS
    // convert date to [Month DD, YYYY], set timezone to UTC to ensure date is not off by one
    // https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
    // https://www.11ty.dev/docs/dates/#dates-off-by-one-day
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toLocaleString(
            DateTime.DATE_FULL
        );
    });

    eleventyConfig.addFilter("postDateClassic", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
            "dd.LL.yyyy"
        );
    });

    eleventyConfig.addFilter("slice", (array, start, end) => {
        return end ? array.slice(start, end) : array.slice(start);
    });

    // Sort items by data.title
    eleventyConfig.addFilter("sortByTitle", (values) => {
        return values
            .slice()
            .sort((a, b) => a.data.title.localeCompare(b.data.title));
    });
    // Sort items by data.title but in reverse
    eleventyConfig.addFilter("sortByTitleReverse", (values) => {
        return values
            .slice()
            .sort((b, a) => a.data.title.localeCompare(b.data.title));
    });
    // Sort items by order
    eleventyConfig.addFilter("sortByOrderReverse", (values) => {
        return values.slice().sort((b, a) => a.data.order - b.data.order);
    });
    // Sort items by order but reversed
    eleventyConfig.addFilter("sortByOrder", (values) => {
        return values.slice().sort((a, b) => a.data.order - b.data.order);
    });

    // CSS Inline
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.addNunjucksAsyncFilter(
        "jsmin",
        async function (code, callback) {
            try {
                const minified = await minify(code);
                callback(null, minified.code);
            } catch (err) {
                console.error("Terser error: ", err);
                // Fail gracefully.
                callback(null, code);
            }
        }
    );
    // TRANSFORMS
    // HTML MINIFIER
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        // Eleventy 1.0+: use this.inputPath and this.outputPath instead
        if (this.outputPath && this.outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }
        return content;
    });

    // set markdown engine
    eleventyConfig.setLibrary("md", markdown);

    return {
        // set the input and output directories
        dir: {
            input: "src",
            output: "_site",
            data: "_data",
            includes: "_includes",
            layouts: "_layouts",
        },
        templateFormats: ["njk", "md", "html", "11ty.js"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
