"use strict";

const puppeteer = require("puppeteer");
const isJSON = require("is-json");
const fs = require("fs");
const transporter = require("./config/mailer");
const cron = require("node-cron");

cron.schedule("0 07 * * *", () => {
  (async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    let rawdata = fs.readFileSync("wordsSearch.json").toString();

    let concursos = [];

    page.setDefaultNavigationTimeout(0);
    await page.goto(
      "https://www.guatecompras.gt/concursos/consultaConcursos.aspx?o=1&d=1&c=2"
    );

    // await page.click('#lnk-concurso > a');
    // Selecciona esto por el momento para lograr obtener data
    // await page.click('#chkUltimos7');


    await page.waitForSelector(".FilaTablaDetalle");
    await page.waitForSelector(".FilaTablaDetallef");

    try {
      concursos = await page.evaluate(
        (rawdata, concursos) => {
          let wordsSearch = JSON.parse(rawdata);
          //Fechas que se muestran en la página
          const months = [
            "ene",
            "feb",
            "mar",
            "abr",
            "may",
            "jun",
            "jul",
            "ago",
            "sep",
            "oct",
            "nov",
            "dic",
          ];

          let date_ob = new Date();
          let date = ("0" + date_ob.getDate()).slice(-2);
          let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
          let year = date_ob.getFullYear();
          let dateToday = year + "-" + month + "-" + date;
          let oneDay = 1000 * 60 * 60 * 24;

          let dateYesterday = new Date(date_ob.getTime() - oneDay);
          date = ("0" + dateYesterday.getDate()).slice(-2);
          month = ("0" + (dateYesterday.getMonth() + 1)).slice(-2);
          year = dateYesterday.getFullYear();
          dateYesterday = year + "-" + month + "-" + date;

          //Se obtiene la información así, ya que las clases de las filas en los concursos son con clases diferentes.
          var elementsRow1 = document.getElementsByClassName("FilaTablaDetalle");
          var elementsRow2 = document.querySelectorAll(".FilaTablaDetallef");
          var textos = '';
          for (let element of elementsRow1) {
            let descripcion = element
              .querySelector('td div [title="Descripción del concurso"]')
              .innerHTML.replace("<br>", "")
              .replace("<b>", "")
              .replace("</b>", "");
            for (let wordSearch of wordsSearch) {
              textos = textos + ' ' + descripcion;
              if (descripcion.toLowerCase().search(wordSearch.toLowerCase()) != -1) {
                let no_operacion = element.querySelector(
                  'td div [title="NOG (Número de Operación Guatecompras)"]'
                ).innerHTML;
                let fecha_publicacion = element.querySelector(
                  'td div [title="Fecha de publicación"]'
                ).innerHTML;
                fecha_publicacion = fecha_publicacion.replace(/\s+/g, "");
                let fecha_limite_oferta = element.querySelector(
                  'td div [title="Fecha límite para ofertar"]'
                ).innerHTML;
                fecha_limite_oferta = fecha_limite_oferta.replace(/\s+/g, "");
                let titulo = element
                  .querySelector('td div [title="Descripción del concurso"]')
                  .innerHTML.replace("<br>", "")
                  .replace("<b>", "")
                  .replace("</b>", "");
                let estatus = element.querySelector(
                  'td div [title="Estatus del concurso"]'
                ).innerHTML;
                let entidad_publica = element.querySelector(
                  'td div [title="Entidad que publica"]'
                ).innerHTML;
                //Fecha convertida a formato: Y-m-d
                fecha_publicacion =
                  fecha_publicacion.substring(8, 12) +
                  "-" +
                  (
                    "0" +
                    (months.indexOf(fecha_publicacion.substring(3, 6)) + 1)
                  ).slice(-2) +
                  "-" +
                  fecha_publicacion.substring(-1, 2);

                fecha_limite_oferta =
                  fecha_limite_oferta.substring(8, 12) +
                  "-" +
                  (
                    "0" +
                    (months.indexOf(fecha_limite_oferta.substring(3, 6)) + 1)
                  ).slice(-2) +
                  "-" +
                  fecha_limite_oferta.substring(-1, 2);
                if (
                  new Date(dateToday).getTime() ==
                  new Date(fecha_publicacion).getTime() ||
                  new Date(dateYesterday).getTime() ==
                  new Date(fecha_publicacion).getTime()
                ) {
                  concursos.push({
                    wordSearch,
                    no_operacion,
                    fecha_publicacion,
                    fecha_limite_oferta,
                    titulo,
                    estatus,
                    entidad_publica
                  });
                }
              }
            }
          }

          for (let element of elementsRow2) {
            let descripcion = element
              .querySelector('td div [title="Descripción del concurso"]')
              .innerHTML.replace("<br>", "")
              .replace("<b>", "")
              .replace("</b>", "");
            for (let wordSearch of wordsSearch) {
              if (descripcion.toLowerCase().search(wordSearch.toLowerCase()) != -1) {
                let no_operacion = element.querySelector(
                  'td div [title="NOG (Número de Operación Guatecompras)"]'
                ).innerHTML;
                let fecha_publicacion = element.querySelector(
                  'td div [title="Fecha de publicación"]'
                ).innerHTML;
                fecha_publicacion = fecha_publicacion.replace(/\s+/g, "");
                let fecha_limite_oferta = element.querySelector(
                  'td div [title="Fecha límite para ofertar"]'
                ).innerHTML;
                fecha_limite_oferta = fecha_limite_oferta.replace(/\s+/g, "");
                let titulo = element
                  .querySelector('td div [title="Descripción del concurso"]')
                  .innerHTML.replace("<br>", "")
                  .replace("<b>", "")
                  .replace("</b>", "");
                let estatus = element.querySelector(
                  'td div [title="Estatus del concurso"]'
                ).innerHTML;
                let entidad_publica = element.querySelector(
                  'td div [title="Entidad que publica"]'
                ).innerHTML;
                //Fecha convertida a formato: Y-m-d
                fecha_publicacion =
                  fecha_publicacion.substring(8, 12) +
                  "-" +
                  (
                    "0" +
                    (months.indexOf(fecha_publicacion.substring(3, 6)) + 1)
                  ).slice(-2) +
                  "-" +
                  fecha_publicacion.substring(-1, 2);
                fecha_limite_oferta =
                  fecha_limite_oferta.substring(8, 12) +
                  "-" +
                  (
                    "0" +
                    (months.indexOf(fecha_limite_oferta.substring(3, 6)) + 1)
                  ).slice(-2) +
                  "-" +
                  fecha_limite_oferta.substring(-1, 2);
                if (
                  new Date(dateToday).getTime() ==
                  new Date(fecha_publicacion).getTime() ||
                  new Date(dateYesterday).getTime() ==
                  new Date(fecha_publicacion).getTime()
                ) {
                  concursos.push({
                    wordSearch,
                    no_operacion,
                    fecha_publicacion,
                    fecha_limite_oferta,
                    titulo,
                    estatus,
                    entidad_publica,
                  });
                }
              }
            }
          }
          return concursos;
        },
        rawdata,
        concursos
      );
    } catch (error) {
      console.error(error);
    }

    if (concursos.length > 0) {
      if (isJSON(JSON.stringify(concursos))) {
        transporter.sendEmail(concursos);
      } else {
        console.log("JSON Data is not valid");
      }
    } else {
      transporter.sendEmailNotFoundCourses();
    }

    await browser.close();
  })();
});