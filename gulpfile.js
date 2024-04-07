const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const del = require('del');

const pug = require('gulp-pug');

const include = require('gulp-include');
const uglify = require('gulp-uglify-es').default;

const sass = require('gulp-sass')(require('sass'));
const gcmq = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

function browsersync() {

  browserSync.init({
    server: { baseDir: 'public/' },
    notify: false,
    online: true,
    port: 8080,
  })
}

function scripts() {

	return src(
		'app/scripts/index.js',
		{allowEmpty: true}
	)
	.pipe(include())
	.pipe(uglify())
	.pipe(rename('script.min.js'))
	.pipe(dest('public/scripts/'))
	.pipe(browserSync.stream())
}

function styles() {

	return src('app/styles/index.+(scss|sass)')
		.pipe(sass())
		.pipe(autoprefixer({ 
			overrideBrowserslist: ['last 10 versions'], 
			grid: true }
		))
		.pipe(gcmq())
		.pipe(cleancss({ 
			level: {1: {specialComments: 0}}
		}))
		.pipe(rename('style.min.css'))
		.pipe(dest('public/styles/'))
		.pipe(browserSync.stream())
}

function pages() {

  return src('app/pages/*.pug')
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(dest('public/'))
    .pipe(browserSync.reload({ stream: true, }))
}

function copyFonts() {

  return src('app/assets/fonts/**/*.*')
    .pipe(dest('public/assets/fonts/'))
}

function copyImages() {

  return src('app/assets/images/**/*.*')
    .pipe(dest('public/assets/images/'))
}

function copyIcons() {

  return src('app/assets/icons/**/*.*')
    .pipe(dest('public/assets/icons/'))
}

async function copyResources() {

  copyFonts();
  copyImages();
  copyIcons();
}

async function clean() {

  return del.sync('public/', { force: true })
}

function watching() {

	watch(['app/**/*.js'], scripts);
	watch(['app/**/*.+(css|scss|sass)'], styles).on(
		'change',
		browserSync.reload
	);
	watch(['app/**/*.pug'], pages).on(
		'change', 
		browserSync.reload
	);
	watch(['app/assets/fonts/**/*.*'], copyFonts).on(
		'change', 
		browserSync.reload
	);
	watch(['app/assets/images/**/*.*'], copyImages).on(
		'change', 
		browserSync.reload
	);
	watch(['app/assets/icons/**/*.*'], copyIcons).on(
		'change', 
		browserSync.reload
	);
}

exports.clean = clean;
exports.scripts = scripts;
exports.styles = styles;
exports.pages = pages;
exports.copyResources = copyResources;
exports.browsersync = browsersync;

exports.default = parallel(
	clean,
	scripts,
	styles,
	pages,
	copyResources,
	browsersync, 
	watching,
);