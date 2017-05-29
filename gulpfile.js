var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var connect = require('gulp-connect');

gulp.task('connect', function(){
  connect.server({
    root: './',
    port: 8000,
    livereload: true
  });
});

// keeps gulp from crashing for scss errors
gulp.task('sass', function () {
  return gulp.src('./sass/*.scss')
      .pipe(sass({ errLogToConsole: true }))
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./css'));
});

gulp.task('livereload', function (){
  gulp.src('./**/*')
  .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./**/*', ['livereload']);
});

gulp.task('default', ['connect', 'sass', 'watch']);

gulp.task('prod', ['sass']);
