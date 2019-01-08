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
	fs = require('fs');

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

gulp.task('sass', gulp.parallel('smartgrid', function () {
	return gulp.src('app/sass/**/*.{scss,sass}')
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
}));

gulp.task('common-js', function () {
	return gulp.src([
			'app/js/common.js'
		])
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(concat('common.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('js', gulp.parallel('common-js', function () {
	return gulp.src([
			'app/libs/jquery/jquery.min.js',
			'app/js/common.min.js' // Always at the end
		])
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'))
		.pipe(browsersync.reload({
			stream: true
		}))
}));

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

const spriteSvgPath = 'app/img/icons';
gulp.task('html', function () {
	if (fs.existsSync(spriteSvgPath)) {
		return gulp.src('app/*.html')
			.pipe(plumber({
				errorHandler: function (err) {
					console.log(err);
					this.emit('end');
				}
			}))
			.pipe(posthtml([
				include()
			]))
			.pipe(gulp.dest('build'))
			.pipe(browsersync.reload({
				stream: true
			}))
	}
});

gulp.task('browser-sync', function () {
	browsersync({
		server: {
			baseDir: 'build/'
		},
		open: false
	});
	gulp.watch('app/sass/**/*.{scss,sass}', gulp.parallel('sass'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('js'));
	gulp.watch(['!app/img/icons/**/*', 'app/img/**/*{jpg,jpeg,png,gif,svg,webp}'], gulp.parallel('copy'));
	gulp.watch('app/img/icons/icon-*.svg', gulp.parallel('svgsprite'));
	gulp.watch('app/*.html', gulp.parallel('html'));
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
