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
      list.push(a.attr('href'));
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
    // episodes.forEach(episode => {
      request(url + episodes[0], (err, response, html) => {
        let $ = cheerio.load(html);
        let lines = [];

        $('#mw-content-text p b, #mw-content-text p b a').each((i, element) => {
          let l = $(element).parent().text();
          let quote = l.split(/\(.*\) .{1}/)[1];
          if(quote != undefined) {
            quote = quote.replace(/\[.*\] /, '');
            console.dir(quote.trim());
            lines.push(quote.trim());
          }
          
        });

        fs.writeFile(`${this.path}/${episodes[0].split(':')[1]}.txt`, lines.join(require('os').EOL), () => {
          console.log(`Quote from ${episodes[0]} written to ${this.path}/${episodes[0].split(':')[1]}.txt`);
        });
        
        
      });
    // });
  });
}