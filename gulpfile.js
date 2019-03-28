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
const mode = require('gulp-mode')({modes: ['production', 'development']});
const beautify = require('gulp-jsbeautifier');
const webpackDevConfig = require('./webpack.dev.js');
const webpackProdConfig = require('./webpack.prod.js');

function styles() {
    return gulp.src('app/scss/**/*.{scss,sass}')
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass())
        .pipe(postcss(require('./postcss.config')))
        .pipe(rename({
            suffix: '.min',
            prefix: ''
        }))
        .pipe(mode.development(sourcemaps.write('.')))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function scripts() {
    return gulp.src('app/js/**/*.js')
        .pipe(mode.development(gulpWebpack(webpackDevConfig, webpack)))
        .pipe(mode.production(gulpWebpack(webpackProdConfig, webpack)))
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
	gulp.watch('app/scss/**/*.{scss,sass}', styles);
	gulp.watch(['app/js/**/*.js'], scripts);
	gulp.watch(['!app/img/icons/**/*', 'app/img/**/*{jpg,png,webp}'], copy);
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

exports.styles = styles;
exports.scripts = scripts;
exports.svgSprite = svgSprite;
exports.html = html;
exports.server = server;
exports.clean = clean;
exports.copy = copy;

exports.build = gulp.series(clean, styles, scripts, svgSprite, html, copy);
