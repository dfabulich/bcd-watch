let lastTopic = ""

function formatFeatureStr(str, topic) {
	let ret = str.replace("bcd ::: ", "")
	if (topic) {
		ret = ret.replace(`${topic} :::`, '')
	}
	return ret.replaceAll(':::', "➞")
}

function formatSummary(delta, data) {
	
	let rTS = new Date(Date.parse(delta.__meta[0].newer.releaseDate)); // 'reportTimeStamp'
	let reportDate = `${rTS.toDateString()}`;
	let out = `
	<h1>BCD Changes Report, <time>${reportDate}</time></h1>
	<div>
		<p>Summary of BCD changes <br>
		<span>from <time>${delta.__meta[0].older.releaseDate}</time></span><br>
		<span>to <time>${delta.__meta[0].newer.releaseDate}</time></span></p>
	</div>
	<h2>Added Features: ${delta.addedFeatures.length}</h2>
	 <details class="added features">
	 		<summary>Expand to see the full list</summary>
	 		${delta.addedFeatures.map((feature) => {
	 			let retVal = ''
	 			let topic = feature.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")
	 			if (topic !== lastTopic) {
	 				if (lastTopic) {
	 					retVal += "</ol>"
	 				}
	 				retVal += `<h4>${topic}</h4><ol>`
	 				lastTopic = topic
	 			}
	 			retVal += `<li>${formatFeatureStr(feature, topic).trim()}</li>\n`
	 			return retVal
	 		}).join('')}
	 	</ol>
	 </details>

	 <h2>Removed Features: ${delta.removedFeatures.length}</h2>
	 <details class="removed features">
	 		<summary>Expand to see the full list</summary>
	 		${delta.removedFeatures.map((feature) => {
	 			let retVal = ''
	 			let topic = feature.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")
	 			if (topic !== lastTopic) {
	 				if (lastTopic) {
	 					retVal += "</ol>"
	 				}
	 				retVal += `<h4>${topic}</h4><ol>`
	 				lastTopic = topic
	 			}
	 			retVal += `<li>${formatFeatureStr(feature, topic).trim()}</li>\n`
	 			return retVal
	 		}).join('')}
	 	</ol>
	 </details>

	 <h2>Implementation Status Changes: +${delta.addedImplementations.length}, -${delta.removedImplementations.length}</h2>

		<h3>Added (${delta.addedImplementations.length})</h3>`;
		out += `<section class="added implementations">`;
		out += `<ol><li>
 		${delta.addedImplementations.map((feature) => {
 			let retVal = ''
 			let topic = feature.key.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")
 			if (topic !== lastTopic) {
 				if (lastTopic) {
 					retVal += "</ol>"
 				}
 				retVal += `<h4>${topic}</h4><ol>`
 				lastTopic = topic
 			}
 			retVal +=  `<li>`;
 			if (feature.mdn_url || feature.spec_url) {
	 			retVal += `<a href="${feature.mdn_url || feature.spec_url}">`;
	 		} else {
	 			retVal += '<span>';
	 		}
 			retVal += `${formatFeatureStr(feature.key, topic)}`;
 			if (feature.mdn_url || feature.spec_url) {
	 			retVal += `</a>`;
 			} else {
	 			retVal += '</span>';
	 		}
 			retVal += ' <b>↠</b> ';
 			retVal += ` <span class="browsers">Added to <strong>${feature.addedImplementations.join(', ')}</strong></span> `;
 			retVal += ' <b>↠</b> ';
 			retVal += ` <span class="ni${feature.totalImplementations} engines">Now in <strong>${feature.totalImplementations}</strong> of 3 engines</span></li>\n`;
 			return retVal;
 		}).join('')}
 		</ol>
	 	</section>`
	 	
	 	if (delta.removedImplementations.length > 0) {
			out += `<h3>Removed (${delta.removedImplementations.length})</h3>

			<section class="removed implementations">
				<ol class="removed implementations">
					${delta.removedImplementations.map((feature) => {
						return `<li><a href="${''}">${formatFeatureStr(feature.name)}</a> implementation removed in: ${feature.implementationsRemoved };</li>\n`
					}).join('')}
				</ol>
			</section>
		 `
		}

	 return out
}

function formatCompleted(delta, data) {
	let complete = delta.addedImplementations.filter(feature => { return feature.totalImplementations === 3 })

	let out = `<h1>${complete.length} New Universal Implementations Reported!</h2>
		<ol  class="added implementations"><li>
 		${complete.map((feature) => {
 			let retVal = ''
 			let topic = feature.key.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")
 			if (topic !== lastTopic) {
 				if (lastTopic) {
 					retVal += "</ol>"
 				}
 				retVal += `<h4>${topic}</h4><ol>`
 				lastTopic = topic
 			}
 			retVal +=  `<li>`;
 			if (feature.mdn_url || feature.spec_url) {
	 			retVal += `<a href="${feature.mdn_url || feature.spec_url}">`;
	 		}
 			retVal += `${formatFeatureStr(feature.key, topic)}`;
 			if (feature.mdn_url || feature.spec_url) {
	 			retVal += `</a>`;
 			}
 			retVal += ` <span class="browsers">Added to <strong>${feature.addedImplementations.join(',')}</strong></span> <span class="ni${feature.totalImplementations} engines">Now in <strong>${feature.totalImplementations}</strong> of 3 engines</span></li>\n`;
 			return retVal;
 		}).join('')}
 		</ol>
	 `

	 return out
}
exports.formatSummary = formatSummary
exports.formatCompleted = formatCompleted
