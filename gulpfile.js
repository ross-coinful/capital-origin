// general
var browserSync = require('browser-sync');
var gulp = require('gulp');

var fs = require('fs')
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var data = require('gulp-data')
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var path = require('path');

// ejs
var ejs = require('gulp-ejs');
var htmlmin = require('gulp-htmlmin');

// images
var imagemin = require('gulp-imagemin');
var imageminPngcrush = require('imagemin-pngcrush');

// reload
var reload = browserSync.reload;

// postcss
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var precss = require('precss'); // like sass, have nested, mixin, extend
var calc = require('postcss-calc'); // reduce calc() references
var assets = require('postcss-assets'); // image-size, inline file
var comments = require('postcss-discard-comments');
var stripInlineComments = require('postcss-strip-inline-comments');
var postscss = require('postcss-scss');

// path
var rootPath = path.resolve(__dirname, 'design');
var destPath = path.resolve(__dirname, 'dist');

var filefolder = {
  img: {
    all: [rootPath + '/img/**/*'],
    compress: [
      rootPath + '/img/**/*.png',
      rootPath + '/img/**/*.jpg',
      rootPath + '/img/**/*.gif',
      rootPath + '/img/**/*.svg',
      '!' + rootPath + '/img/png-sprite/**/*',
      '!' + rootPath + '/img/png-sprite-2x/**/*',
      '!' + rootPath + '/img/svg-sprite/**/*',
    ],
  },
  ejs: {
    all: [rootPath + '/ejs/**/*.html'],
    removeHtmlEjs: rootPath + '/html/**/*.html',
  },
  html: {
    all: [rootPath + '/**/*.html'],
    dest: rootPath + '/',
  },
  js: {
    all: [rootPath + '/js/**/*.js'],
  },
  css: {
    all: [rootPath + '/css/**/*.css'],
  },
  postcss: {
    all: rootPath + '/postcss/**/*.css',
    toCss: [
      rootPath + '/postcss/main.css',
      rootPath + '/postcss/font.css',
    ],
  },
  font: rootPath + '/font/**/*',
};

// gulp tasks
gulp.task('browser-sync', function() {

  var syncAry = filefolder.img.all.concat(filefolder.css.all)
    .concat(filefolder.html.all)
    .concat(filefolder.js.all);

  gulp.watch(syncAry, reload);

  return browserSync({
    server: {
      baseDir: './design',
      directory: true,
    },
    port: 4000,
    debugInfo: false,
    open: false,
    browser: ['google chrome', 'firefox'],
    injectChanges: true,
    notify: true,
    ghostMode: false,
  });
});

// ejs
gulp.task('ejs', function() {
  let setting = null;
  gulp.src(filefolder.ejs.all)
    .pipe(plumber())
    .pipe(filter(function(file) {
      return !/_.*\.html/.test(file.path);
    }))
    .pipe(data(function(file) {
      if (!setting) {
        setting = JSON.parse(fs.readFileSync(rootPath + '/ejs/data.json'));
        return setting;
      }
    }))
    .pipe(ejs({}, {}, {
      ext: '.html',
    }))
    .on('error', gutil.log)
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(gulp.dest(filefolder.html.dest))
    .pipe(reload({
      stream: true,
    }));

  return gulp.src(filefolder.ejs.removeHtmlEjs)
    .pipe(filter(function(file) {
      return /_.*\.html/.test(file.path);
    }))
    .pipe(clean());
});

gulp.task('ejs-watch', ['ejs'], function() {
  return watch(filefolder.ejs.all, function(e) {
    gulp.run(['ejs']);
  });
});

// postcss
gulp.task('postcss', function() {
  var plugins = [
    precss({ nesting: { disable: true } }),
    calc(),
    assets({
      basePath: 'design',
      relative: 'css',
      loadPaths: ['img/'],
    }),
    autoprefixer({
      browsers: [
        '> 2%',
        'last 2 versions',
        'ie >= 10',
      ],
    }),
    comments(),
    stripInlineComments(),
  ];

  return gulp.src(filefolder.postcss.toCss)
    .pipe(plumber())
    .pipe(postcss(plugins, { syntax: postscss }))
    .pipe(gulp.dest(rootPath + '/css'));
});

gulp.task('postcss-watch', ['postcss'], function() {
  return watch(filefolder.postcss.all, function(e) {
    gulp.run(['postcss']);
  });
});

gulp.task('postcss-watch-move', function(cb) {
  watch(filefolder.postcss.all, function(e) {
    gulp.run(['move-css']);
  });

  cb();
});

// js
gulp.task('move-js', function() {
  return gulp.src(filefolder.js.all)
    .pipe(plumber())
    .pipe(gulp.dest(destPath + '/js'));
});

// html
gulp.task('move-html', function() {
  return gulp.src(rootPath + '/*.html')
    .pipe(plumber())
    .pipe(gulp.dest(destPath + '/'));
});

// css
gulp.task('move-css', ['postcss'], function() {
  return gulp.src(filefolder.css.all)
    .pipe(plumber())
    .pipe(gulp.dest(destPath + '/css'));
});

// fonts
gulp.task('move-font', function() {

  return gulp.src(filefolder.font)
    .pipe(plumber())
    .pipe(gulp.dest(destPath + '/font'));
});

// compress images
gulp.task('minify-img', function() {
  return gulp.src(filefolder.img.compress)
    .pipe(imagemin([imagemin.gifsicle(), imagemin.jpegtran(), imagemin.optipng()], {
      optimizationLevel: 3,
      progressive: true,
      use: [imageminPngcrush()],
    }))
    .pipe(gulp.dest(destPath + '/img'))
    .on('error', gutil.log);
});

// clean style
gulp.task('clean-style', function() {
  return gulp.src([destPath + '/css', destPath + '/font'], {
    read: false,
  }).pipe(clean({
    force: true,
  }));
});

gulp.task('clean-style-img', function(cb) {
  return gulp.src([destPath + '/img'], {
    read: false,
  }).pipe(clean({
    force: true,
  }));
});

gulp.task('clean-style-all', ['clean-style', 'clean-style-img']);

// gulp task scripts
gulp.task('design', ['browser-sync', 'ejs-watch', 'postcss-watch']);

// 將 design 檔案轉到 dist 資料夾內
gulp.task('dist', function(cb) {
  runSequence('clean-style', 'move-css', 'move-font', 'move-html', 'move-js', cb);
});

// 將 design 檔案轉到 dist 資料夾內, 加圖片, depoly 時應該都要跑過一遍, 確保 design 的檔案都有同步到 src/
gulp.task('dist-img', function(cb) {
  runSequence('clean-style-all', 'minify-img', 'move-css', 'move-font', 'move-html', 'move-js', cb);
});
