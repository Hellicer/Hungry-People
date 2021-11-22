const { src, gulp, task, series, parallel, dest } = require('gulp'); // gulp
const browserSync = require('browser-sync').create() // Сервер
const watch = require('gulp-watch'); // Обработчик изменений
const sass = require('gulp-sass')(require('sass')); // SASS
const cleanCSS = require('gulp-clean-css'); // Минификатор CSS
const autoprefixer = require('gulp-autoprefixer'); // Префиксы
const groupMedia = require('gulp-group-css-media-queries'); // Групировка медиа-запросов
const fileinclude = require('gulp-file-include'); // PUG
const fs = require('fs'); // Файловая система (Для подключения JSON-файла)
const webp = require('gulp-webp'); // Конвертация картинок
const del = require('del'); // Удаление файлов
const babel = require('gulp-babel'); // Компилятор JS
const concat = require('gulp-concat'); // Объединение файлов в один
const sourcemaps = require('gulp-sourcemaps'); // Sourcemap-ы для JS и CSS
const notify = require('gulp-notify'); // Отображение уведомлений
const plumber = require('gulp-plumber'); // Обработчик ошибок
const include = require('gulp-include'); // Подключение файлов
const webpHTML = require('gulp-webp-html');


// Пути к файлам
const public_folder = "./public/"
const source_folder = "./src/"

const path = {
  build: {
    html: public_folder,
    css: public_folder + "assets/css/",
    js: public_folder + "assets/js/",
    img: public_folder + "assets/images/",
    fonts: public_folder + "assets/fonts/",
  },
  src: {
    html: source_folder + "views/index.html",
    css: source_folder + "assets/sass/main.sass",
    js: source_folder + "assets/js/index.js",
    json: source_folder + "assets/json/html-data.json",
    img: source_folder + "assets/images/**/*",
    fonts: source_folder + "assets/fonts/**/*",
  },
  watch: {
    html: source_folder + "views/**/*.html",
    css: source_folder + "**/*.+(sass|scss|css)",
    js: source_folder + "**/*.js",
    img: source_folder + "assets/images/**/*",
    fonts: source_folder + "assets/fonts/**/*",
  },
}

// Сборка HTML файлов
let streamHTML = (callback) => {
  return src(path.src.html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webpHTML())
    .pipe(dest(path.build.html)) // Компиляция файлов в /index.html
    .pipe(browserSync.stream()) // Обновление страницы
  callback();
};

// Компиляция JS файлов
let streamJs = (callback) => {
  return src(path.src.js)
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'JS',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    })) // Компиляция JS
    .pipe(include())
    .pipe(concat('build.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest(path.build.js)) // Компиляция файлов в /js/dev.js
  callback();
};

// Компиляция SASS файлов
let streamSass = (callback) => {
  return src(path.src.css)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Запуск задачи
    .pipe(groupMedia())
    .pipe(autoprefixer({overrideBrowserslist: ['> 0.1%']})) // Добавление префиксов
    .pipe(concat('main.css'))
    .pipe(cleanCSS({compatibility: 'ie8'})) // Минификатор CSS
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest(path.build.css)) // // Компиляция файлов в /css/main.css
    .pipe(browserSync.stream()) // Обновление страницы
  callback();
};

// Конвертирование картинок
let convertWebp = (callback) => {
  return src([path.src.img, '!src/assets/images/favicon{,/**}']) // Исключение папки favicon из обработки
    .pipe(webp({
      quality: 75
    })) // Конвертация картинок в WEBP
    .pipe(dest(path.build.img)) // Перемещение картинок в папку /images
  callback();
};

let copyImg = (callback) => {
  return src(path.src.img)
    .pipe(dest(path.build.img)) // Перемещение картинок в папку /images
  callback();
};

// Копирование шрифтов
let copyFonts = (callback) => {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts)) // Перемещение шрифтов в папку /fonts
  callback();
};

// Задача для отслеживания изменений файлов
let watchTask = (callback) => {
  // Слежелние за картинками и шрифтами
  watch(path.watch.img, series(cleanImg, copyImg, convertWebp, browserReload))
  watch(path.watch.fonts, series(cleanFonts, copyFonts, browserReload))

  // Слежение за файлами SASS, JS, PUG
  watch(path.watch.css, series(streamSass));
  watch(path.watch.js, series(streamJs, browserReload));
  watch([path.watch.html, path.src.json], series(streamHTML));

  callback();
};

// Задача для старта сервера
let serverTask = () => {
  browserSync.init({
    server: {
      baseDir: public_folder
    },
    notify: false
  })
};

// Обновление страницы
let browserReload = (done) => {
  browserSync.reload();
  done();
};
// Очистка папки /dist
let cleanDev = () => {
  return del(public_folder)
};
// Очистка папки /images
let cleanImg = () => {
  return del(path.build.img)
};
// Очистка папки /fonts
let cleanFonts = () => {
  return del(path.build.fonts)
};

exports.default = series(streamSass, streamHTML, streamJs, copyImg, convertWebp, copyFonts, watchTask, serverTask) // Запуск сборки
exports.clean = series(cleanDev) // Очистка /dist