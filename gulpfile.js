'use strict';


// NORMAL - TEMPLATE


// NODE MODULES
const gulp = require('gulp'), // https://gulp.readme.io/docs/getting-started
    $ = require('gulp-load-plugins')({
        lazy: true
    }), // https://github.com/jackfranklin/gulp-load-plugins#options
    htmlhintStylish = require('htmlhint-stylish'),
    browserSync = require('browser-sync'),
    del = require('del'),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminJpegtran = require('imagemin-jpegtran'),
    imageminOptipng = require('imagemin-optipng'),
    imageminSvgo = require('imagemin-svgo'),
    ftp = require('vinyl-ftp'),
    runSequence = require('run-sequence');


// PROJECT CONFIG
const PROJECT_CONFIG = require('./project.config');


// USEFUL FUNCTIONS
// To display a console log message in five types: normal, success, info, warning and error
function alertHandler(args) {

    args = args || {};

    let types = {
            normal: 'white',
            success: 'green',
            info: 'blue',
            warning: 'yellow',
            error: 'red'
        },
        type = args.type || 'info',
        title = args.title || type,
        message = args.message || 'Remember to specify necessary property type & message in a configuration object.',
        color = types[type],
        messageTemplate = `
**~~~~~~~~* ${title.toUpperCase()} LOG - OPEN *~~~~~~~~~**
${message}
**~~~~~~~~* ${title.toUpperCase()} LOG - CLOSE *~~~~~~~~**`;

    $.util.log($.util.colors[color](messageTemplate)); // https://github.com/gulpjs/gulp-util#usage

};


// To get a parameter after comand option
function getOption(option) {
    if (!option) {
        return false;
    }

    let index = process.argv.indexOf(option);

    return index !== -1 ? {
        value: process.argv[index + 1]
    } : false;
};


// GULP TASKS
// Compiling SASS to CSS, adding right prefixes to CSS methods - depending on configuration, creating source map, finally injects CSS styles into browser
gulp.task('sass:css', () => {

    $.util.log($.util.colors.green('SASS TO CSS TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/sass/*.s+(a|c)ss`)
        .pipe($.plumber()) // https://github.com/floatdrop/gulp-plumber#monkey-gulp-plumber
        .pipe($.sourcemaps.init()) // https://github.com/floridoo/gulp-sourcemaps#init-options
        .pipe($.sass.sync({ // https://github.com/sass/node-sass#options
            outputStyle: 'nested' // compact - compressed - expanded - nested
        }))
        .pipe($.autoprefixer({ // https://github.com/postcss/autoprefixer#options
            browsers: ['last 5 version'],
            stats: ['> 1%']
        }))
        .pipe($.sourcemaps.write('./maps/'))
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/css/`))
        .pipe(browserSync.stream({
            match: '**/*.css'
        })); // https://www.browsersync.io/docs/gulp

});


// Validates Syntactically Awesome Style Sheets (SASS) Code, atm custom configuration for more info / rules check ---> https://github.com/sasstools/sass-lint#configuring
gulp.task('sass:lint', () => {

    $.util.log($.util.colors.cyan('SASS LINT TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/sass/**/*.s+(a|c)ss`)
        .pipe($.plumber())
        .pipe($.sassLint({
            options: {
                'formatter': 'stylish', // checkstyle / stylish
                'merge-default-rules': false
            },
            rules: {
                'no-color-keywords': 2,
                'no-color-literals': 2,
                'no-ids': 2,
                'no-important': 2,
                'no-invalid-hex': 2,
                'hex-notation': 2
            }
        }))
        .pipe($.sassLint.format()); // https://github.com/sasstools/sass-lint/blob/master/docs/options/formatter.md

});


// Validates JavaScript (JS) Code, atm default configuration for more info check ---> http://eslint.org/
gulp.task('js:eslint', () => {

    $.util.log($.util.colors.cyan('JS ESLINT TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/js/**/*.js`)
        .pipe($.plumber())
        .pipe($.eslint('.eslintrc.json')) // http://eslint.org/docs/user-guide/configuring
        .pipe($.eslint.format());

});


// Changing extensions of files from .jade to .pug, finally removes all .jade files
gulp.task('jade:pug', () => {

    $.util.log($.util.colors.green('JADE TO PUG TASK RUNNING...'));


    gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates/**/*.jade`, {
            base: PROJECT_CONFIG.DIRECTORY.WORK_DIR
        })
        .pipe($.plumber())
        .pipe($.rename({ // https://github.com/hparra/gulp-rename#usage
            extname: '.pug'
        }))
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/`))
        .on('end', () => {
            del(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates/**/*.jade`) // https://github.com/sindresorhus/del#usage
        });

});


// Compiling .pug files to .html files
gulp.task('pug', () => {

    $.util.log($.util.colors.green('PUG TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates/*.pug`, {
            base: `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates`
        })
        .pipe($.plumber())
        .pipe($.pug({ // https://pugjs.org/api/getting-started.html
            pretty: true,
            compileDebug: true
        }))
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/`));

});


// Validates Pug / Jade Code, atm custom configuration for more info check ---> https://github.com/pugjs/pug-lint#pug-lint
gulp.task('pug:lint', () => {

    $.util.log($.util.colors.cyan('PUG LINT TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates/**/*.pug`)
        .pipe($.plumber())
        .pipe($.pugLint({ // https://github.com/pugjs/pug-lint/blob/master/docs/rules.md
            disallowDuplicateAttributes: true,
            disallowMultipleLineBreaks: true,
            disallowSpacesInsideAttributeBrackets: true,
            requireLowerCaseAttributes: true,
            requireLowerCaseTags: true,
            requireSpaceAfterCodeOperator: true,
            requireSpecificAttributes: [{
                img: ['alt']
            }],
            validateAttributeQuoteMarks: '\"',
            validateDivTags: true,
        }));

});


// Combines CSS or JS files into one and MINIFY - Minification via modules Clean Css & Uglify
gulp.task('html', () => {

    $.util.log($.util.colors.green('HTML TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.html`, {
            base: PROJECT_CONFIG.DIRECTORY.WORK_DIR
        })
        .pipe($.plumber())
        .pipe($.useref()) // https://github.com/jonkemp/gulp-useref#usage
        .pipe($.if('*.css', $.cleanCss())) // https://github.com/jakubpawlowicz/clean-css#--------
        .pipe($.if('*.js', $.uglify({
            output: {
                max_line_len: false
            }
        }))) // {preserveComments: 'license'} ~ https://github.com/terinjokes/gulp-uglify#options
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/`));

});


// Validates HyperText Markup Language (HTML) code, atm custom configuration for more info / rules check ---> https://github.com/bezoerb/gulp-htmlhint#api
gulp.task('html:hint', () => {

    $.util.log($.util.colors.cyan('HTML HINT TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.html`)
        .pipe($.plumber())
        .pipe($.htmlhint({ // https://github.com/yaniswang/HTMLHint/wiki/Rules
            'tagname-lowercase': true,
            'attr-lowercase': true,
            'attr-value-double-quotes': true,
            'attr-no-duplication': true,
            'doctype-first': false, // true
            'tag-pair': true,
            'tag-self-close': false,
            'spec-char-escape': false,
            'id-unique': true,
            'src-not-empty': true,
            'title-require': true
        }))
        .pipe($.htmlhint.reporter(htmlhintStylish)); // https://github.com/bezoerb/gulp-htmlhint#reporters

});


// Minify HTML code, atm custom configuration for more info check ---> https://github.com/jonschlinkert/gulp-htmlmin#gulp-htmlmin---
gulp.task('html:minify', () => {

    $.util.log($.util.colors.green('HTML MINIFY TASK RUNNING...'));


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/*.html`, {
            base: PROJECT_CONFIG.DIRECTORY.DIST_DIR
        })
        .pipe($.plumber())
        .pipe($.htmlmin({ // https://github.com/kangax/html-minifier#options-quick-reference
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
        }))
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/`));

});


// Runs locally server which allows to sync file changes with browser preview and to browse websites using connected devices, more info about module BROWSER SYNC ---> https://www.browsersync.io/docs/gulp
gulp.task('server', () => {

    $.util.log($.util.colors.red('SERVER TASK RUNNING...'));


    return browserSync.init({
        server: `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/`
    });

});


// Watching a file changes then runs the appropriate tasks
gulp.task('watch', () => {

    $.util.log($.util.colors.blue('WATCH TASK RUNNING...'));


    gulp.watch(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/sass/**/*.s+(a|c)ss`, [
        'sass:lint',
        'sass:css'
    ]);

    gulp.watch(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/js/**/*.js`, [
        'js:watch'
    ]);

    gulp.watch(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/templates/**/*.pug`, [
        'pug:lint',
        'pug'
    ]);

    gulp.watch(`${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.html`, [
        'html:watch'
    ]);

});


// Created to fix problem with browserSync.reload, more info ---> https://github.com/BrowserSync/browser-sync/issues/717#issuecomment-119713757
gulp.task('js:watch', ['js:eslint'], browserSync.reload);


// Created to fix problem with browserSync.reload, more info ---> https://github.com/BrowserSync/browser-sync/issues/717#issuecomment-119713757
gulp.task('html:watch', ['html:hint'], browserSync.reload);


// Removes production directory, more info about module DEL ---> https://github.com/sindresorhus/del#del--
gulp.task('clean', () => {

    $.util.log($.util.colors.gray('CLEAN TASK RUNNING...'));


    return del(PROJECT_CONFIG.DIRECTORY.DIST_DIR);

});


// Copies a files from the working directory to the production directory
gulp.task('copy', () => {

    $.util.log($.util.colors.grey('COPY TASK RUNNING...'));


    return gulp.src([
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/css/{flexbox-unsupport,scrollbar-support}.css`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/files/**/*`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/fonts/**/*`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/images/**/*`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.png`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.xml`,
        `${PROJECT_CONFIG.DIRECTORY.WORK_DIR}/*.ico`
        ], {
            base: PROJECT_CONFIG.DIRECTORY.WORK_DIR
        })
        .pipe($.plumber())
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/`));

});


// Optimizes images by using standard modules avaible via NPM or by TinyPNG API, for more info check ---> https://tinypng.com/developers/reference/nodejs
gulp.task('images', () => {

    $.util.log($.util.colors.magenta('IMAGES TASK RUNNING...'));

    let condition = getOption('--option').value === 'advanced', // https://github.com/joshbroton/gulp-tinify#gulp-tinify
        imgExtname = '{jpg,png}',
        optimizationModule = condition ? require('gulp-tinify') : require('gulp-imagemin'), // https://github.com/sindresorhus/gulp-imagemin#api
        args = PROJECT_CONFIG.API_KEYS.TINIFY;

    if (!condition) {

        imgExtname = '{jpg,png,svg,gif}';
        args = [imageminGifsicle(), imageminJpegtran(), imageminOptipng(), imageminSvgo()];

        alertHandler({
            type: 'info',
            message: `Default options passed to images task.
To change that, add command arguments to this task ---> gulp [TASK NAME = images / build / build:server] --option [advanced].`
        });

    }

    if (condition && !PROJECT_CONFIG.API_KEYS.TINIFY) {

        return alertHandler({
            type: 'error',
            message: `Task can not be complited.
Remember to set up your TINIFY API KEY in ${PROJECT_CONFIG.CONFIG_FILE} file.`
        });

    }


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/images/**/*.${imgExtname}`, {
            base: PROJECT_CONFIG.DIRECTORY.DIST_DIR
        })
        .pipe($.plumber())
        .pipe(optimizationModule(args))
        .pipe(gulp.dest(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/`));

});


// Uploads a files from the production directory to the FTP server, more info about module VINYL FTP ---> https://github.com/morris/vinyl-ftp#vinyl-ftp
gulp.task('upload', () => {

    $.util.log($.util.colors.yellow('UPLOAD TASK RUNNING...'));

    let ftpConfig = { // https://github.com/morris/vinyl-ftp#api
        host: PROJECT_CONFIG.FTP_CONFIG.HOST,
        user: PROJECT_CONFIG.FTP_CONFIG.USER,
        password: PROJECT_CONFIG.FTP_CONFIG.PASSWORD
    };

    if (!ftpConfig.host || !ftpConfig.user || !ftpConfig.password || !PROJECT_CONFIG.FTP_CONFIG.DESTINATION || !getOption('--upload')) {

        return alertHandler({
            type: 'error',
            message: `Task can not be complited.
Rememeber to set up your FTP CONFIG in ${PROJECT_CONFIG.CONFIG_FILE} file.
Then add command argument to this task ---> gulp [TASK NAME = upload / build / build:server] --upload.`
        });

    }

    let conn = ftp.create(ftpConfig);


    return gulp.src(`${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/**/*`)
        .pipe($.plumber())
        .pipe(conn.dest(PROJECT_CONFIG.FTP_CONFIG.DESTINATION));

});


// Runs a sequence of gulp tasks in the specified order ---> https://github.com/OverZealous/run-sequence#run-sequence
gulp.task('build', (cb) => {

    $.util.log($.util.colors.red('BUILD TASK RUNNING...'));


    runSequence('clean', 'sass:lint', 'sass:css', 'js:eslint', 'pug:lint', 'pug', 'html:hint', 'html', 'html:minify', 'copy', 'images', 'upload', cb);

});


// Runs locally server which listening on the production directory after finish building the web application
gulp.task('build:server', ['build'], () => {

    $.util.log($.util.colors.red('BUILD SERVER TASK RUNNING...'));


    browserSync.init({
        server: `${PROJECT_CONFIG.DIRECTORY.DIST_DIR}/`
    });

});


// Runs a sequence of gulp tasks in the specified order ---> https://github.com/OverZealous/run-sequence#run-sequence
gulp.task('default', (cb) => {

    $.util.log($.util.colors.red('DEFAULT TASK RUNNING...'));


    runSequence('sass:lint', 'sass:css', 'js:eslint', 'pug:lint', 'pug', 'html:hint', 'server', 'watch', cb);

});
