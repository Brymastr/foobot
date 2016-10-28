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
      let episode = episodes[number];
      getEpisode(url + episode, `${this.path}/${String('000' + number).slice(-3)}_${episode.split(':')[1]}.txt`, () => {
        // console.log('done')
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

      $('div.poem p b, div.poem p b a').each((i, element) => {
        let l = $(element).parent().text();
        let quote = l.split(/\(.*\) .{1}/)[1];
        if(quote != undefined) {
          quote = quote.replace(/\[.*\] /, '');
          lines.push(quote.trim());
        }
      });

      fs.writeFile(filename, lines.join(require('os').EOL), () => {
        console.log(`${filename} complete`);
      });
    }
  });
}