var gulp           = require('gulp'),
    browserSync    = require('browser-sync').create(),
    sass           = require('gulp-sass'),
    cssmin         = require('gulp-clean-css'),
    stripCss       = require('gulp-strip-css-comments'), // clear CSS from comments
    rename         = require('gulp-rename'),
    bulkSass       = require('gulp-sass-bulk-import'),  // import all scss files in Blocks folder
    svgmin         = require('gulp-svgmin'),
    imgmin         = require('gulp-imagemin'),
    uglify         = require('gulp-uglify'),
    concat         = require('gulp-concat'),
    pump           = require('pump'),
    autoprefixer    = require('gulp-autoprefixer'),
    clear          = require('gulp-cache');

// Convert SCSS to min.CSS & Reload browser
gulp.task('sass', function() {
  return gulp.src('scss/style.scss')
    .pipe(bulkSass())
    .pipe(sass({
      includePaths:['scss/blocks'],
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

//Minify external CSS files in APP folder
gulp.task('cssmini', function () {
  return gulp.src(['app/css/*.css', '!app/css/style.min.css'])
    .pipe(stripCss({preserve: true}))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'));
});

//Minify JS
gulp.task('jsmin', function(cb) {
    pump([
      gulp.src('js/*.js'),
      uglify({mangle: false}),
      concat('main.min.js'),
      gulp.dest('app/js')
    ],
    cb
  );
});

//Minify SVG
gulp.task('svgmin', function () {
  return gulp.src('img/*.svg')
    .pipe(svgmin({js2svg: {pretty: true}}))
    .pipe(gulp.dest('app/img/svg'));
});

//Minify Images
gulp.task('imgmin', function () {
  gulp.src(['img/*.+(png|gif|jpg|jpeg)', '!img/icn-*.*', '!img/bg-*.*'])
    .pipe(imgmin())
    .pipe(gulp.dest('app/img')),
  gulp.src('img/bg-*.*')
    .pipe(imgmin())
    .pipe(gulp.dest('app/img/bg'))
});

// Watch
gulp.task('watch', function() {
  browserSync.init({
    server: 'app',
    notify: false
  });
  gulp.watch(['scss/*.scss', 'scss/**/*.scss'], ['sass']);
  gulp.watch(['js/*.js'], ['jsmin']);
  gulp.watch('app/img/*').on('change', browserSync.reload);
  gulp.watch('app/**/*.+(css|html|js|csv)').on('change', browserSync.reload);
});

// Clear cache
gulp.task('clear', function () {
  return clear.clearAll();
});

// Run 'gulp'
gulp.task('default', ['watch']);
