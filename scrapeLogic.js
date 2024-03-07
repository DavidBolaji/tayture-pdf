const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const keyWord = "";
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
    const page = await browser.newPage();
    await page.goto("https://news.ycombinator.com/");

    const data = await page.evaluate((keyWord) => {
      let $$news = [...document.querySelectorAll(".athing")].filter((elem) =>
        elem.querySelector(".votearrow")
      );
    
      if (keyWord) {
        $$news = $$news.filter(($news) =>
          $news
            .querySelector(".titleline")
            .innerText.toLowerCase()
            .includes(keyWord)
        );
      }
    
      return $$news.map((elem) => {
        const $info = elem.nextElementSibling;
    
        return {
          title: elem.querySelector(".titleline").innerText,
          url: elem.querySelector(".titleline a").href,
          score: parseInt($info.querySelector(".score").innerText),
          date: $info.querySelector("span.age").title,
          by: $info.querySelector(".hnuser").innerText,
        };
      });
    }, keyWord);
  
    res.send(data);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
