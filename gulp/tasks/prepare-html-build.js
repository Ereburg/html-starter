module.exports = () => {
  $.gulp.task('prepareHtmlBuild', () => {
    // Исходные данные
    const metaImages = $.fs.readdirSync(`${$.config.sourcePath}/${$.config.metaPath}`); // изображения
    const templates = $.fs.readdirSync(`${$.config.sourcePath}/${$.config.hbsPath}/pages`).concat([`ui-toolkit.hbs`]); // шаблоны страниц

    const html = []; // Массив генерируемых элементов
    const pages = {}; // Объект, содержащий информацию о всех страницах

    // Наполняем объект Pages информацией из meta-изображений
    for (const meta of metaImages) {
      if (meta === '.gitkeep' || meta === '.DS_Store') continue;

      // Получаем имя шаблона/страницы
      const pageName = meta.substring(
        meta.indexOf('_') + 1,
        meta.lastIndexOf('.'),
      );

      // Создаем объект с названием страницы и присваиваем ему изображение
      pages[pageName] = {};
      pages[pageName].image = meta;
    }

    // Наполняем объект Pages информацией из шаблонов
    for (const template of templates) {
      if (template === 'index' || template === '.DS_Store') continue;

      // Получаем имя шаблона/страницы
      const pageName = template.substring(0, template.lastIndexOf('.'));
      // Проверяем, существует ли данная страница
      if (pages[pageName] === undefined) pages[pageName] = {};

      // Получаем доступ к локальному файлу текущей страницы
      const file = $.fs
        .readFileSync(
          `${$.config.sourcePath}/${$.config.hbsPath}/${pageName === 'ui-toolkit' ? '' : 'pages'}/${pageName}.hbs`)
        .toString();

      // Получаем заголовок страницы
      if (file.indexOf('{{!') !== -1) pages[pageName].title = file.substring(3, file.indexOf('}}'));

      // Получаем данные готовой страницы
      const hbs = $.fs
        .readFileSync(`${$.config.outputPath}/html/${pageName}.html`)
        .toString();

      // Если заголовка в странице нет, то заменяем его на полученный из шаблона
      if (hbs.indexOf(`<title></title>`) !== -1) {
        $.fs.writeFileSync(`${$.config.outputPath}/html/${pageName}.html`,
          hbs.replace(
            /<title>(.*)/,
            '<title>' + pages[pageName] + '</title>'),
        );
      }

      // Генерируем данные в наш массив со страницами
      html.push(`
        <li class="main__item">
          <article class="main__article">
            <h2 class="main__title">${pages[pageName].title}</h2>
            <a class="main__link" href="${pageName}.html" title="${pages[pageName].title}" aria-label="Link to ${pages[pageName].title} page.">
              <img class="${pages[pageName].image === undefined ? 'main__image main__image--default' : 'main__image'}" src="../${$.config.metaPath}/${pages[pageName].image === undefined ? 'default.svg' : pages[pageName].image}" alt="Preview image." loading="lazy">
            </a>
          </article>
        </li>`);
    }

    const sourceTemplate = $.fs.readFileSync('./config/template-build.html').toString();
    // Получаем время сборки
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timezone: 'Europe/Moscow',
      hour: 'numeric',
      minute: 'numeric',
    };

    // Подставляем полученные данные и генерируем билд
    $.fs.writeFileSync(
      `${$.config.outputPath}/html/index.html`,
      sourceTemplate
        .replace('{{items}}', `${html.join('')}`)
        .replace(/{{siteName}}/g, $.config.siteName)
        .replace('{{buildDate}}', new Date().toLocaleString('ru', options)),
    );

    return $.gulp.src(`${$.config.outputPath}/html/**/*.html`)
      .pipe($.gulpPlugin.cheerio({
        run: jQuery => {
          jQuery('script').each(function() {
            let src = jQuery(this).attr('src');

            if (src !== undefined &&
              src.substr(0, 5) !== 'http:' &&
              src.substr(0, 6) !== 'https:') src = `../${$.config.scriptsPath}/${src}`;

            jQuery(this).attr('src', src);
          });
        },
        parserOptions: { decodeEntities: false },
      }))
      .pipe($.gulp.dest(`${$.config.outputPath}/html/`))
      .pipe($.bs.reload({ stream: true }));
  });
};
