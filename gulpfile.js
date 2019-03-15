'use strict'

var gulp = require('gulp');
var less = require('gulp-less');
var htmlmin = require('gulp-htmlmin');  //压缩html
var cleanCSS = require('gulp-clean-css');//压缩css
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify'); //压缩js
var imagemin = require('gulp-imagemin'); //压缩image
var gutil = require('gulp-util');//如果有自定义方法，会用到
var cache = require('gulp-cache');//清除缓存
var plumber = require('gulp-plumber');//检测错误
var fileinclude = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var changed = require('gulp-changed');

//error hint
function errrHandler(e){
	//错误时beep一下
	gutil.beep();
	gutil.log(e);
	this.emit('end');
}

//clear cache
function clearCache(done) {
	return cache.clearAll(done)
}

//html
function appHtml() {
	return gulp.src('app/*.html')
		.pipe(plumber({errorHandler:errrHandler}))
		.pipe(fileinclude())
		.pipe(htmlmin({
			removeComments: false,//清除HTML注释
			collapseWhitespace: true , //压缩html
			removeEmptyAttributes: false,//删除所有空格作属性值
			removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
			minifyJS: true,//压缩页面JS
			minifyCSS: true//压缩页面CSS
		}))
		.pipe(changed('dist'))
		.pipe(gulp.dest('dist'))
}

//style
function appStyle() {
	return gulp.src('app/style/*.less')
		.pipe(plumber({errorHandler:errrHandler}))
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
      cascade: false
		}))
		.pipe(cleanCSS({compatibility:'ie8'}))
		.pipe(changed('dist'))
		.pipe(gulp.dest('dist/style'))
}

//js
function appScript() {
	return gulp.src('app/js/*.js')
		.pipe(plumber({ errorHandler: errrHandler }))
    .pipe(jshint())//检查代码
		.pipe(uglify())
		.pipe(changed('dist'))
		.pipe(gulp.dest('dist/js'))
}

//images
function appImages() {
	return gulp.src('app/images/*.{jpg,png,svg,gif}')
		.pipe(imagemin(
			[
				imagemin.gifsicle({interlaced: true}),//类型：Boolean 默认：false 隔行扫描gif进行渲染
				imagemin.jpegtran({progressive: true}), //逐行扫描jpg进行渲染
				imagemin.optipng({optimizationLevel: 5}),//类型：Number  默认：3  取值范围：0-7（优化等级）
				imagemin.svgo({
					plugins: [
						{removeViewBox: true},//不要移除svg的viewbox属性
						{cleanupIDs: false}
					]
				})
			]
		))
		.pipe(changed('dist'))
		.pipe(gulp.dest('dist/images'))
}

function server() {
	browserSync.init({
		port: 3000,
		notify:false,
		server: {
			baseDir: 'dist',
			index:'index.html'
		}
	})
	gulp.watch('app/*.html', appHtml)
	gulp.watch('app/style/*.less', appStyle)
	gulp.watch('app/js/*.js', appScript)
	gulp.watch('app/images/*.{jpg,png,svg,gif}', appImages)
	gulp.watch('dist/**/*').on('change',reload)
}


gulp.task('default',gulp.series(clearCache,appHtml,appStyle,appScript,appImages,server));
