var gulp           = require('gulp'),
    browserSync    = require('browser-sync').create(),
    sass           = require('gulp-sass'),
    cssmin         = require('gulp-clean-css'),
    rename         = require('gulp-rename'),
    svgmin         = require('gulp-svgmin'),
    imgmin         = require('gulp-imagemin'),
    uglify         = require('gulp-uglify'),
    concat         = require('gulp-concat'),
    pump           = require('pump'),
    sourcemaps     = require('gulp-sourcemaps'),
    mainBowerFiles = require('main-bower-files'),
    autoprefixer   = require('gulp-autoprefixer');

// Convert SCSS to min.CSS & Reload browser
gulp.task('sass', function() {
  return gulp.src('scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle:'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

//Minify SVG
gulp.task('svgmin', function () {
  return gulp.src('img/*.svg')
    .pipe(svgmin({js2svg: {pretty: true}}))
    .pipe(gulp.dest('app/img/svg'));
});

//Minify Images
gulp.task('imgmin', () =>
  gulp.src('img/*')
    .pipe(imgmin())
    .pipe(gulp.dest('app/img'))
);

//Extract main CSS files from Bower Packages
gulp.task('bowcss', function(){
  return gulp.src(mainBowerFiles('**/*.css'))
  .pipe(cssmin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('app/css'));
});

//Extract main JS files from Bower Packages
gulp.task('bowjs', function(){
  return gulp.src(mainBowerFiles('**/*.js', {
    overrides: {
      d3: {
        main:'**/*.min.js'
      },
      tabletop: {
        main:'**/*.min.js'
      }
    }
  }))
  .pipe(gulp.dest('app/js'));
});

//Minify JS
gulp.task('jsmin', function(cb) {
    pump([
      gulp.src('js/main.js'),
      sourcemaps.init(),
      uglify({mangle: false}),
      concat('main.min.js'),
      sourcemaps.write('maps'),
      gulp.dest('app/js')
    ],
    cb
  );
});

// Watch
gulp.task('watch', function() {
  browserSync.init({
    server: 'app',
    notify: false
  });
  gulp.watch(['scss/*.scss', 'scss/*/*.scss'], ['sass']);
  gulp.watch(['js/*.js'], ['jsmin']);
  gulp.watch('app/img/*').on('change', browserSync.reload);
  gulp.watch('app/**/*.+(css|html|js|csv)').on('change', browserSync.reload);
});

// Run 'gulp'
gulp.task('default', ['watch']);