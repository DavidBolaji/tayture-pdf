const puppeteer = require("puppeteer");
const ejs = require('ejs')
const path =  require('path')
const fs = require('fs')
const { PDFDocument } = require('pdf-lib');
const { sendCvMail } = require("./mail/sendCvMail");
require("dotenv").config();


async function generatePDFPages(
  page,
  templatePath,
  data,
  colorList,
  pdfPaths,
) {
  const html = await ejs.renderFile(templatePath, {
    data,
    colorList,
    page: 1,
  })

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  })

  const height = await page.evaluate(() => {
    const body = document.body
    const html = document.documentElement

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    )
    return height
  })

  const a4PageHeight = 842
  let totalPages = Math.ceil(height / a4PageHeight)

  for (let i = 0; i < totalPages; i++) {
    const pageHtml = await ejs.renderFile(templatePath, {
      data,
      colorList,
      page: i + 1,
    })

    await page.setContent(pageHtml, {
      waitUntil: 'networkidle0',
    })

    const pdfPath = path.join(process.cwd(), `html2pdf_${i + 1}.pdf`)
    pdfPaths.push(pdfPath)

    try {
      await page.pdf({
        path: pdfPath,
        format: 'a4',
        printBackground: true,
        displayHeaderFooter: true,
        margin:
          i + 1 === 1
            ? { top: 0, right: 0, bottom: 40, left: 0 }
            : { top: 10, right: 0, bottom: 40, left: 0 },
        preferCSSPageSize: true,
        pageRanges: `${i + 1}`,
      })
    } catch (_) {
      pdfPaths.pop()
      return (totalPages = totalPages - 1)
    }
  }

  return totalPages
}

async function mergePDFs2(pdfPaths, baseName) {
  try {
    const mergedPdf = await PDFDocument.create()

    for (const pdfPath of pdfPaths) {
      const pdfBytes = fs.readFileSync(pdfPath)
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices(),
      )

      for (const page of copiedPages) {
        mergedPdf.addPage(page)
      }
    }

    const mergedPdfBytes = await mergedPdf.save()
    const mergedPdfPath = path.join(process.cwd(), `${baseName}.pdf`)
    fs.writeFileSync(mergedPdfPath, mergedPdfBytes)

    console.log('PDFs merged successfully.')
  } catch (error) {
    console.error('Error merging PDFs:', error)
  }
}

const scrapeLogic = async (res, arg) => {

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const { data, colorList, email } = arg;

    const page = await browser.newPage()

    let pdfPaths = []
    const templatePath = path.join(process.cwd(), 'template', 'templateOne.ejs')
    await generatePDFPages(page, templatePath, data, colorList, pdfPaths)
    const name = `html_full`
    const pdfPathz = path.join(process.cwd(), `${name}.pdf`)
    await mergePDFs2(pdfPaths, name)

      // Delete generated PDFs
    // for (const pdfPath of pdfPaths) {
    // fs.unlink(pdfPath, (err) => {
    //   if (err) {
    //     console.error('Error deleting PDF file:', err)
    //   } else {
    //     console.log('PDF file deleted successfully')
    //   }
    // })
    // }

  await browser.close()
  await sendCvMail({
    firstName: data.name.split(' \n')[0],
    email: email,
    filename: `${name}.pdf`,
    path: pdfPathz,
  })

  // fs.unlink(pdfPathz, (err) => {
  //   if (err) {
  //     console.error('Error deleting PDF file:', err)
  //   } else {
  //     console.log('PDF file deleted successfully')
  //   }
  // })
  
    res.send({message: "Resume sent to email"});
  } catch (e) {
    console.error(e);
    res.status(400).send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };



