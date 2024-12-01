const browsersync = require("browser-sync").create();
const cached = require("gulp-cached");
const cssnano = require("gulp-cssnano");
const del = require("del");
const fileinclude = require("gulp-file-include");
const gulpif = require("gulp-if");
const npmdist = require("gulp-npm-dist");
const replace = require("gulp-replace");
const gulp = require("gulp");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const useref = require("gulp-useref-plus");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const rtlcss = require("gulp-rtlcss");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelify = require("babelify");

const paths = {
  base: {
    base: {
      dir: "./",
    },
    node: {
      dir: "./node_modules",
    },
    packageLock: {
      files: "./package-lock.json",
    },
  },
  dist: {
    base: {
      dir: "./dist",
      files: "./dist/**/*",
    },
    libs: {
      dir: "./dist/assets/libs",
    },
    css: {
      dir: "./dist/assets/css",
    },
    js: {
      dir: "./dist/assets/js",
      files: "./dist/assets/js/**/*.js",
    },
  },
  src: {
    base: {
      dir: "./src",
      files: "./src/**/*",
    },
    css: {
      dir: "./src/assets/css",
      files: "./src/assets/css/**/*",
    },
    html: {
      dir: "./src",
      files: "./src/**/*.html",
    },
    img: {
      dir: "./src/assets/images",
      files: "./src/assets/images/**/*",
    },
    js: {
      dir: "./src/assets/js",
      modules: "./src/assets/js/modules",
      files: "./src/assets/js/**/*.js",
      main: "./src/assets/js/app.js", // Đặt tệp chính của bạn ở đây
    },
    partials: {
      dir: "./src/partials",
      files: "./src/partials/**/*",
    },
    scss: {
      dir: "./src/assets/scss",
      files: "./src/assets/scss/**/*",
      main: "./src/assets/scss/*.scss",
    },
  },
};

// Tạo task 'scripts' để xử lý JavaScript
gulp.task("scripts", function () {
  return browserify({
    entries: paths.src.js.main, // Sử dụng tệp chính
    debug: true
  })
  .transform(babelify, {
    presets: ["@babel/preset-env"]
  })
  .bundle()
  .pipe(source("app.min.js"))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify())
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest(paths.dist.js.dir))
  .pipe(browsersync.stream()); // Tự động reload BrowserSync khi có thay đổi
});

gulp.task("browsersync", function (callback) {
  browsersync.init({
    server: {
      baseDir: [paths.dist.base.dir, paths.src.base.dir, paths.base.base.dir],
    },
  });
  callback();
});

gulp.task("browsersyncReload", function (callback) {
  browsersync.reload();
  callback();
});

gulp.task("watch", function () {
  gulp.watch(paths.src.scss.files, gulp.series("scss"));
  gulp.watch([paths.src.js.files, `${paths.src.js.dir}/**/*.js`], gulp.series("scripts"));
  gulp.watch(
    [paths.src.html.files, paths.src.partials.files],
    gulp.series("fileinclude", "browsersyncReload")
  );
});

gulp.task("scss", function () {
  // generate ltr
  gulp
    .src(paths.src.scss.main)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(browsersync.stream()); // Inject CSS vào trang mà không reload

  // generate rtl
  return gulp
    .src(paths.src.scss.main)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(rtlcss())
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: "-rtl.min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.dist.css.dir))
    .pipe(browsersync.stream()); // Inject CSS vào trang mà không reload
});

gulp.task("fileinclude", function (callback) {
  return gulp
    .src([
      paths.src.html.files,
      "!" + paths.dist.base.files,
      "!" + paths.src.partials.files,
    ])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        indent: true,
      })
    )
    .pipe(gulp.dest(paths.dist.base.dir));
});

gulp.task("clean:packageLock", function (callback) {
  del.sync(paths.base.packageLock.files);
  callback();
});

gulp.task("clean:dist", function (callback) {
  del.sync(paths.dist.base.dir);
  callback();
});

gulp.task("copy:all", function () {
  return gulp
    .src([
      paths.src.base.files,
      "!" + paths.src.partials.dir,
      "!" + paths.src.partials.files,
      "!" + paths.src.scss.dir,
      "!" + paths.src.scss.files,
      "!" + paths.src.js.dir,
      "!" + paths.src.js.files,
      "!" + paths.src.js.main,
      "!" + paths.src.html.files,
    ])
    .pipe(gulp.dest(paths.dist.base.dir));
});

gulp.task("copy:libs", function () {
  return gulp
    .src(npmdist(), { base: paths.base.node.dir })
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/\/dist/, "").replace(/\\dist/, "");
    }))
    .pipe(gulp.dest(paths.dist.libs.dir));
});

gulp.task("html", function () {
  return gulp
    .src([
      paths.src.html.files,
      "!" + paths.dist.base.files,
      "!" + paths.src.partials.files,
    ])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        indent: true,
      })
    )
    .pipe(replace(/href="(.{0,10})node_modules/g, 'href="$1assets/libs'))
    .pipe(replace(/src="(.{0,10})node_modules/g, 'src="$1assets/libs'))
    .pipe(useref())
    .pipe(cached())
    .pipe(gulpif("*.js", uglify()))
    .pipe(gulpif("*.css", cssnano({ svgo: false })))
    .pipe(gulp.dest(paths.dist.base.dir));
});

gulp.task(
  "build",
  gulp.series(
    gulp.parallel("clean:packageLock", "clean:dist", "copy:all", "copy:libs"),
    "fileinclude",
    "scripts",
    "scss",
    "html"
  )
);

gulp.task(
  "default",
  gulp.series(
    gulp.parallel(
      "clean:packageLock",
      "clean:dist",
      "copy:all",
      "copy:libs",
      "fileinclude",
      "scripts",
      "scss",
      "html"
    ),
    gulp.parallel("browsersync", "watch")
  )
);