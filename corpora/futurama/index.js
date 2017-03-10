const
  fs = require('fs'),
  request = require('request'),
  cheerio = require('cheerio');

exports.scrapeEpisodeUrls = (cb) => {
  const url = 'https://theinfosphere.org/Episode_Transcript_Listing';
  request(url, (err, response, html) => {
    let $ = cheerio.load(html);
    let episodes = [];
    $('b a').each((i, element) => {
      var a = $(element);
      episodes.push(a.attr('href'));
    });    
    fs.writeFile(`${this.path}/episodeUrls.txt`, episodes.join(require('os').EOL), () => {
      console.log(`Episode URLs written to ${this.path}/episodeUrls.txt`);
    });
    cb(episodes);
  });
}

exports.path = './corpora/futurama';

exports.scrapeEpisodeTranscripts = cb => {

  const url = 'https://theinfosphere.org';

  fs.readFile(`${this.path}/episodeUrls.txt`, 'utf-8', (err, data) => {
    let episodes = data.split(require('os').EOL);

    for(var number = 0; number < episodes.length; number++) {
      // if(number != 72) continue;
      let episode = episodes[number];
      getEpisode(url + episode, `${this.path}/${String('000' + number).slice(-3)}_${episode.split(':')[1]}.txt`, () => {
      })   
    }
  });
}

function getEpisode(url, filename, cb) {
  request(url, (err, response, html) => {
    if(!html) console.log(err, url);
    else {
      let $ = cheerio.load(html);
      let lines = [];

      $('div.poem p, #mw-content-text p').each((i, element) => {
        let l = $(element).text();
        let quote = l
          .replace(/\[[a-z0-9,.?_ '-]*\]/ig, '')
          .replace(/\([a-z0-9,.?_: '-]*\)/ig, '')
          .replace(/\s{2,}/g, ' ')
          .replace(/[^\x00-\x7F]/g, '');
        lines.push(quote.trim());
      });

      fs.writeFile(filename, lines.join(require('os').EOL), () => {
        console.log(`${filename} complete`);

      });
    }
    cb();
  });
}