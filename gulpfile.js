const gulp = require('gulp');
const del = require('del');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const gulpWebpack = require('webpack-stream');
const webpack = require('webpack');
const rename = require('gulp-rename');
const beautify = require('gulp-jsbeautifier');
const webpackDevConfig = require('./webpack.dev.js');
const webpackProdConfig = require('./webpack.prod.js');

function stylesDev() {
	return gulp.src('app/scss/**/*.{scss,sass}')
		.pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: [__dirname + '/', 'node_modules']
		}))
        .pipe(postcss(require('./postcss.config')))
        .pipe(rename({
            suffix: '.min',
            prefix: ''
        }))
        .pipe((sourcemaps.write('.')))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function stylesProd() {
	return gulp.src('app/scss/**/*.{scss,sass}')
		.pipe(sass({
			includePaths: [__dirname+'/','node_modules']
		}))
		.pipe(postcss(require('./postcss.config')))
		.pipe(rename({
			suffix: '.min',
			prefix: ''
		}))
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
}

function scriptsDev() {
    return gulp.src('app/js/**/*.js')
        .pipe(gulpWebpack(webpackDevConfig, webpack))
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
}

function scriptsProd() {
	return gulp.src('app/js/**/*.js')
		.pipe(gulpWebpack(webpackProdConfig, webpack))
		.pipe(gulp.dest('build/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
}

function svgSprite() {
	return gulp.src('app/img/icons/icon-*.svg')
		.pipe(svgmin({
			plugins: [{
				removeViewBox: false
			}]
		}))
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename('sprite.svg'))
		.pipe(gulp.dest('app/img/icons'))
}

function html() {
	return gulp.src('app/*.html')
		.pipe(posthtml([
			include()
		]))
		.pipe(beautify())
		.pipe(gulp.dest('build'))
		.pipe(browserSync.reload({
			stream: true
		}))
}

function server() {
	browserSync.init({
		server: {
			baseDir: 'build/'
		},
		open: false
	});
	gulp.watch('app/scss/**/*.{scss,sass}', stylesDev);
	gulp.watch(['app/js/**/*.js'], scriptsDev);
	gulp.watch(['!app/img/icons/**/*', 'app/img/**/*{jpg,png,webp}', 'app/fonts/**/*{woff,woff2}'], copy);
	gulp.watch('app/img/icons/icon-*.svg', gulp.series(svgSprite, html));
	gulp.watch('app/**/*.html', html);
}

function clean() {
	return del('build');
}

function copy() {
	return gulp.src([
			'app/.htaccess',
			'app/fonts/**/*',
			'!app/img/icons/**/*',
			'app/img/**/*{jpg,png,webp}'
		], {
			base: 'app'
		})
		.pipe(gulp.dest('build'))
        .pipe(browserSync.reload({
            stream: true
        }))
}

exports.styles = stylesDev;
exports.scripts = scriptsDev;
exports.svgSprite = svgSprite;
exports.html = html;
exports.server = server;
exports.clean = clean;
exports.copy = copy;

exports.buildDev = gulp.series(clean, stylesDev, scriptsDev, svgSprite, html, copy);
exports.buildProd = gulp.series(clean, stylesProd, scriptsProd, svgSprite, html, copy);
