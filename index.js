/*
  Exports: run(oldFilePath, latestFilePath)  
  
  Takes file paths for two bcd json files, 
  does some processing, produces a flattened delta
  and outputs out/index.html
 */
let fs = require('fs'),
store_path = './store',
output_path = './out'
flatten = require('./flatten.js').flatten,
delta = require('./delta.js').delta,
formatter = require('./format'),
RSS = require('./feed-creator.js')


function shortDate(date) {
  let dateParts = date.toDateString().split(' ')
  dateParts.shift()
  return dateParts.join('-')
}

function run(o,l) {
  let inputA = JSON.parse(fs.readFileSync(`${store_path}/${o}`))
  let inputB = JSON.parse(fs.readFileSync(`${store_path}/${l}`))
  let latestBrowsers = {
    chrome: Object.keys(inputB.browsers.chrome.releases).map(n => parseFloat(n)).slice(-4),
    firefox: Object.keys(inputB.browsers.firefox.releases).map(n => parseFloat(n)).slice(-4),
    safari: Object.keys(inputB.browsers.safari.releases).map(n => parseFloat(n)).slice(-4)
  }

  let flattenedA = flatten(inputA)
  let flattenedB = flatten(inputB)
  
  let data = delta(flattenedA, flattenedB, latestBrowsers)

  let fromDate = new Date(inputA.__meta.timestamp)
  let toDate =  new Date(inputB.__meta.timestamp)
  
  // TODO: this is messy, should probably reconsider
  // how it is stored and recalled, but at least for now
  // this keeps the old thing working 
  data.__meta = [{
      older: { releaseDate: fromDate },
      newer: { releaseDate: toDate }
  }]
  data.addedFeatures = data.added
  data.removedFeatures = data.removed


  let out = formatter.formatSummary(data, flattenedB)
  let title = `BCD Changes Report, ${fromDate.toDateString()} - ${toDate.toDateString()}`
  

  markup = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link type="text/css" href="styles.css" rel="stylesheet">\n<title>${title}</title>\n</head>\n<body>\n` + out + `\n</body>\n</html>`,
        
  // current...
  fs.writeFileSync(
      output_path + '/index.html',
      markup,
      'utf8'
  )

  let name = shortDate(toDate)

  // archived
  fs.writeFileSync(
      output_path + `/${name}.html`,
      markup,
     'utf8'
  )

  RSS({
      items: [{ 
        title: title,
        file: `${name}.html`,
        blurb: 'Weekly summary of changes to BCD data',
        content: out,
        pubDate: toDate, // I guess always use the to date?
        image: ""
      }]
    },
		{
			title: `BCD changes (weekly)`,
			filename: "weekly"
		}
  )

  let outComplete = formatter.formatCompleted(data, flattenedB)

  title =  `BCD New Baselines Report, ${fromDate.toDateString()} - ${toDate.toDateString()}`
  markup = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8" />\n<link type="text/css" href="styles.css" rel="stylesheet">\n<title>${title}</title>\n</head>\n<body>\n` + outComplete + `\n</body>\n</html>`,
  
  fs.writeFileSync(
      output_path + `/${name}-completed.html`,
      markup,
     'utf8'
  )

  RSS({
      items: [{ 
        title: title,
        file: `${name}-completed.html`,
        blurb: 'Weekly summary of new Baseline items in BCD data',
        content: outComplete,
        pubDate: toDate, // I guess always use the to date?
        image: ""
      }]
  	},
		{
			title: `New baselines (weekly)`,
			filename: "weekly-completed"
		}
	)

}

exports.run = run
