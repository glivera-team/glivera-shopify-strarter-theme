'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const inlineimage = require('gulp-inline-image');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const assets  = require('postcss-assets');
const notify = require("gulp-notify");
const prefix = require('gulp-autoprefixer');

/**
 * Asset paths.
 */
const scssSrc = 'src/scss/**/*.scss';
const jsSrc = 'src/js/main/*.js';
const jsLibs = 'src/js/libs/*.js';
const assetsDir = 'assets/';

/**
 * SCSS task
 */

gulp.task('sass', function () {
	return gulp
		.src('src/scss/**/*.scss.liquid')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			sass().on(
				'error',
				notify.onError({
					message: '<%= error.message %>',
					title: 'Sass Error!',
				})
			)
		)
		.pipe(inlineimage())
		.pipe(prefix('last 3 versions'))
		.pipe(
			postcss([
				assets({
					basePath: assetsDir,
					loadPaths: ['image/'],
				}),
			])
		)
		.pipe(sourcemaps.write())
		.pipe(rename('theme.scss.liquid'))
		.pipe(gulp.dest(assetsDir));
});

/**
 * JS task
 *
 * Note: you may or may not want to include the 2 below:
 * babel polyfill and jquery
 */
const jsLibsFiles = [
	// 'node_modules/babel-polyfill/dist/polyfill.js',
	'node_modules/jquery/dist/jquery.slim.js',
	jsLibs,
];

const jsDest = assetsDir;

gulp.task('js', function () {
	return gulp
		.src(jsSrc)
		.pipe(
			babel({
				presets: ['es2015'],
			})
		)
		.pipe(concat('theme.js'))
		.pipe(gulp.dest(jsDest))
		.pipe(rename('theme.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(jsDest));
});

gulp.task('jsLibs', function () {
	return gulp
			.src(jsLibsFiles)
			.pipe(concat('libs.js'))
			.pipe(gulp.dest(jsDest))
			.pipe(rename('libs.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(jsDest));
});

/**
 * Images task
 */
gulp.task('images', function () {
	return gulp
		.src('src/image/**')
		.pipe(changed(assetsDir)) // ignore unchanged files
		.pipe(gulp.dest(assetsDir));
});

/**
 * Fonts task
 */
gulp.task('fonts', function () {
	return gulp
		.src('src/fonts/**')
		.pipe(changed(assetsDir)) // ignore unchanged files
		.pipe(gulp.dest(assetsDir));
});

/**
 * Watch task
 */
gulp.task('watch', function () {
	gulp.watch(scssSrc, gulp.series('sass'));
	gulp.watch(jsSrc, gulp.series('js'));
	gulp.watch(jsLibs, gulp.series('jsLibs'));
	gulp.watch('src/image/*.{jpg,jpeg,png,gif,svg}', gulp.series('images'));
	gulp.watch('src/font/*.{eot,svg,ttf,woff,woff2}', gulp.series('fonts'));
});

/**
 * Default task
 */
gulp.task(
	'default',
	gulp.series(gulp.parallel('sass', 'images', 'fonts', 'js', 'jsLibs', 'watch'))
);
