var gulp = require('gulp'),
	del = require('del'),
	posthtml = require('gulp-posthtml'),
	include = require('posthtml-include'),
	sourcemaps = require('gulp-sourcemaps'),
	svgmin = require('gulp-svgmin'),
	mqpacker = require('css-mqpacker'),
	svgstore = require('gulp-svgstore'),
	plumber = require('gulp-plumber'),
	cache = require('gulp-cache'),
	postcss = require('gulp-postcss'),
	csso = require('postcss-csso'),
	sass = require('gulp-sass'),
	browsersync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	smartgrid = require('smart-grid'),
	mode = require('gulp-mode')({
		modes: ["production", "development"]
	}),
	autoprefixer = require('autoprefixer'),
	flexbugs = require('postcss-flexbugs-fixes'),
	sortCSSmq = require('sort-css-media-queries'),
	beautify = require('gulp-jsbeautifier'),
	babel = require("gulp-babel");

gulp.task('smartgrid', function (done) {
	const settings = {
		outputStyle: 'scss',
		columns: 12,
		offset: '30px',
		mobileFirst: false,
		container: {
			maxWidth: '1200px',
			fields: '30px'
		},
		breakPoints: {
			lg: {
				width: '1100px'
			},
			md: {
				width: '960px'
			},
			sm: {
				width: '780px',
				fields: '15px'
			},
			xs: {
				width: '560px'
			}
		}
	};
	smartgrid('app/libs/smartgrid', settings);
	done();
});

gulp.task('sass', function () {
	return gulp.src('app/scss/**/*.{scss,sass}')
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(mode.development(sourcemaps.init()))
		.pipe(sass())
		.pipe(postcss([
			autoprefixer(),
			flexbugs(),
			mqpacker({
				sort: sortCSSmq.desktopFirst
			}),
			csso({
				comments: false
			})
		]))
		.pipe(rename({
			suffix: '.min',
			prefix: ''
		}))
		.pipe(mode.development(sourcemaps.write('.')))
		.pipe(gulp.dest('build/css'))
		.pipe(browsersync.reload({
			stream: true
		}));
});

gulp.task('js', function () {
	return gulp.src([
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/swiper/dist/js/swiper.min.js',
			'node_modules/tooltipster/dist/js/tooltipster.bundle.min.js',
			'node_modules/baron/baron.min.js',
			'node_modules/choices.js/public/assets/scripts/choices.min.js',
			'app/libs/ion-tabs/ion.tabs.min.js',
			'app/libs/ion-tabs/ion.tabs.min.js',
			'app/js/common.js' // Always at the end
		])
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(mode.development(sourcemaps.init()))
		.pipe(babel())
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(mode.development(sourcemaps.write('.')))
		.pipe(gulp.dest('build/js'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('svgsprite', function () {
	return gulp.src('app/img/icons/icon-*.svg')
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(cache(svgmin({
			plugins: [{
				removeViewBox: false
			}]
		})))
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename('sprite.svg'))
		.pipe(gulp.dest('app/img/icons'));
});

gulp.task('html', function () {
	return gulp.src('app/*.html')
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(posthtml([
			include({
				encoding: 'utf8'
			})
		]))
		.pipe(beautify())
		.pipe(gulp.dest('build'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('browser-sync', function () {
	browsersync({
		server: {
			baseDir: 'build/'
		},
		open: false
	});
	gulp.watch('app/scss/**/*.{scss,sass}', gulp.parallel('sass'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('js'));
	gulp.watch(['!app/img/icons/**/*', 'app/img/**/*{jpg,jpeg,png,gif,svg,webp}'], gulp.parallel('copy'));
	gulp.watch('app/img/icons/icon-*.svg', gulp.parallel('svgsprite'));
	gulp.watch('app/**/*.html', gulp.parallel('html'));
});

gulp.task('delbuild', function () {
	return del('build');
});

gulp.task('clearcache', function () {
	return cache.clearAll();
});

gulp.task('copy', function () {
	return gulp.src([
			'app/.htaccess',
			'app/fonts/**/*',
			'!app/img/icons/**/*',
			'app/img/**/*{jpg,jpeg,png,gif,svg,webp}'
		], {
			base: 'app'
		})
		.pipe(gulp.dest('build'))
});

gulp.task('build', gulp.series('delbuild', 'copy', 'sass', 'js', 'svgsprite', 'html'));
