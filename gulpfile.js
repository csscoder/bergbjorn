const { src, dest, parallel, watch, series } = require('gulp')
const gulpif = require('gulp-if')
const rename = require('gulp-rename')
const autoprefixer = require('autoprefixer')
const mqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const postcssGulp = require('gulp-postcss');
const gulpSCSS = require('gulp-sass');
const del = require('del')
const include = require("gulp-include")
const beautify = require('gulp-jsbeautifier')
const nunjucksRender = require('gulp-nunjucks-render')
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps')
const Browser = require('browser-sync')

const PRODUCTION = process.env.NODE_ENV === 'production'
const browser = Browser.create()

// Start SCSS
// ******************************************
const postCSSConf = [
  autoprefixer(),
]

const cssBeauty = {
  "beauty": false,
  "beautifyOptions": {
    "indent_char": " ",
    "indent_size": 2,
  },
  "mediaQueriesPack": true
}

//Check allow media Queries pack
if (PRODUCTION && cssBeauty.mediaQueriesPack) {
  postCSSConf.push(mqpacker({ sort: true }))
}
//Check allow minify css
if (PRODUCTION && !cssBeauty.beauty) {
  postCSSConf.push(cssnano())
}
function scss() {
  return src('./src/scss/main.scss')
    .pipe(sassGlob())
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(gulpSCSS())
    .pipe(postcssGulp(postCSSConf))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulpif(PRODUCTION && cssBeauty.beauty, beautify(cssBeauty.beautifyOptions)))
    .pipe(dest('./build/css'))
    .pipe(gulpif(!PRODUCTION, browser.stream()))
}
exports.scss = scss
// END SCSS
// ******************************************


// Start JS
// ******************************************
const jsBeauty = {
  "beauty": true,
  "beautifyOptions": {
    "indent_char": " ",
    "indent_size": 2,
  },
}

function js() {
  return src('./src/js/app.js')
    .pipe(include({
      includePaths: [
      ],
    }))
    .on('error', console.log)
    .pipe(gulpif(PRODUCTION && jsBeauty.beauty, beautify(jsBeauty.beautifyOptions)))
    .pipe(dest('./build/js'))
}

exports.js = js
// End JS
// ******************************************

// Start server
// ******************************************
{
  function server() {
    browser.init(
      {
        server: {
          ghostMode: false,
          baseDir: './build',
          serveStaticOptions: {
            extensions: ['html'],
          },
        },
        injectChanges: true,
        serveStatic: ['build'],
        port: 7777,
        browser: 'google chrome',
      },
    )
  }

  exports.server = server
}
// End server
// ******************************************

// Copy static
// ******************************************
{
  function copyStatic() {
    return src('./src/static/**/*').pipe(dest('./build'))
  }

  exports.copyStatic = copyStatic
}
// End Copy static
// ******************************************

// Start HTML
// ******************************************
const htmlBeauty = {
  "beauty": true,
  "beautifyOptions": {
    "indent_char": "\t",
    "indent_size": 1,
    "max_preserve_newlines": 0,
  },
}

function html() {
  return src('./src/html/*.nunj.html')
    .pipe(nunjucksRender({
      path: [
        './src/components/',
        './src/html/',
      ],
    }))
    .pipe(gulpif(PRODUCTION && htmlBeauty.beauty, beautify(htmlBeauty.beautifyOptions)))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.nunj', '')
    }))
    .pipe(dest('./build'))
}

exports.html = html
// End HTML
// ******************************************


// Watch
// ******************************************
if (!PRODUCTION) {
  watch([
    './src/scss/*.scss',
    './src/components/**/*.scss',
  ], { events: ['change', 'add'], delay: 100 }, scss);

  watch([
    './src/js/*.js',
    './src/components/**/*.js',
  ], { events: ['change', 'add'], delay: 100 }, js);

  watch([
    './src/**/*.nunj.html',
    './src/components/**/*.nunj.html',
  ], { events: ['change', 'add'], delay: 100 }, html)

  watch(['./build/*.html','./build/js/*.js']).on('change', () => browser.reload())
}
// End Watch
// ******************************************

// Start clear directory
// ******************************************
function clearBuildDir() {
  return del(['./build/**/*'])
}

exports.clearBuildDir = clearBuildDir
// End clear directory
// ******************************************


// Complex tasks
// ******************************************
exports.default = series(parallel(html, scss, js, copyStatic), server)
exports.build = series(
  clearBuildDir,
  parallel(html, scss, js, copyStatic),
)
