var gulp = require('gulp');
var sass = require('gulp-sass');
var compileHandlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');

var path = {
    css:  './src/*.scss',
    js: './src/scripts/*.js',
    html: {
        pages: './src/pages/**/*.hbs',
        partials: './src/partials/',
        templates: './src/templates/**/*.hbs'
    },
    mockapi: './src/mockapi/*.json',
    dist: {
        css:  './dist/',
        html: './dist/',
        js: './dist/',
        mockapi: './dist/mockapi/',
        vendor: {
            js: './dist/'
        }
    },
    watch: {
        css: './src/**/*.scss',
        html: './src/**/*.hbs'
    },
    images: {
        source: './src/**/**/**/*.+(png|jpg)',
        dist: './dist/images/'
    },
    vendor: {
        js: './src/vendor/js/*.js'
    }
};

gulp.task('default', ['build', 'serve', 'watch']);

gulp.task('css', function () {
    return gulp.src(path.css)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dist.css));
});

gulp.task('html', function () {
    return gulp.src(path.html.pages)
        .pipe(compileHandlebars({}, {
            ignorePartials: true,
            batch: path.html.partials
        }))
        .pipe(rename({
            dirname: '.',
            extname: '.html'
        }))
        .pipe(gulp.dest(path.dist.html));
});

gulp.task('images', function () {
    return gulp.src(path.images.source)
        .pipe(rename({
            dirname: '.'
        }))
        .pipe(gulp.dest(path.images.dist));
});

gulp.task('js', function () {
    return gulp.src(path.js)
        .pipe(gulp.dest(path.dist.js));
});

gulp.task('mockapi', function() {
    return gulp.src(path.mockapi)
        .pipe(gulp.dest(path.dist.mockapi))
});

gulp.task('hbs_templates', function() {
    return gulp.src(path.html.templates)
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'blocks.templates',
            noRedeclare: true
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest(path.dist.html))
});

gulp.task('vendor_js', function () {
    return gulp.src(path.vendor.js)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(path.dist.vendor.js));
});

gulp.task('build', [
    'html',
    'css',
    'images',
    'js',
    'hbs_templates',
    'mockapi',
    'vendor_js'
]);

gulp.task('watch', function () {
    gulp.watch(path.css, ['css']);
    gulp.watch(path.js, ['js']);
    gulp.watch(path.html.pages, ['html']);
    gulp.watch(path.images.source, ['images']);
    gulp.watch(path.html.templates, ['hbs_templates']);
    gulp.watch(path.html.partials, ['html']);
    gulp.watch(path.mockapi, ['mockapi']);
});

gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: path.dist.html
        }
    });
    gulp.watch('dist/**').on('change', browserSync.reload);
});