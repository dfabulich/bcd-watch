const browsers = ['firefox', 'chrome', 'safari']
const unimplemented = {
    "support": {
        "fake": {},
        "chrome": {
            "version_added": false
        },
        "edge": {
            "version_added": false
        },
        "firefox": {
            "version_added": false
        },
        "firefox_android": {
            "version_added": false
        },
        "opera": {
            "version_added": false
        },
        "safari": {
            "version_added": false
        },
        "safari_ios": {
            "version_added": false
        }
    }
}

function union(setA, setB) {
    const _union = new Set(setA);
    for (const elem of setB) {
        _union.add(elem);
    }
    return _union;
}

/*
    @key The node name/path
    @past the past bcd entry under that name
    @cur the cur bcd entry under that name, modified by ref where relevant
    @out the output object, modified by ref (added/removed)
    @latestBrowsers the browser keys with numeric arrays of the 'latest browsers'

    returns whether or not there was any delta
*/
function deltaSupport(key, past, cur, out, latestBrowsers) {
    let added = [],
        removed = [],
        backfilled = [],
        total = 0,
        changed = false;

    browsers.forEach(browser => {
        browsername = browser.charAt(0).toUpperCase() + browser.slice(1);
        if (cur.support[browser].version_added) {
            total++
        }
        if (!past.support[browser].version_added && cur.support[browser].version_added) {
            cur.key = key

            let v = parseFloat(cur.support[browser].version_added)
            if (latestBrowsers[browser].indexOf(v) !== -1) {
                added.push(browsername)
                if (!changed) {
                    out.addedImplementations.push(cur)
                }
                changed = true
            } else {
                if (!changed) {
                    out.backfilledImplementations.push(cur)
                }
                changed = true
            }
        } else if (past.support[browser].version_added && !cur.support[browser].version_added) {
            removed.push(browsername)
            changed = true
        }
    })
    if (added.length > 0) {
        cur.addedImplementations = added
    }

    if (removed.length > 0) {
        cur.removedImplementations = removed
    }

    cur.totalImplementations = total;
    return changed
}

function delta(bcdObjA, bcdObjB, latestBrowsers) {
    let out = { added: [], removed: [], changed: {}, addedImplementations: [], removedImplementations: [], backfilledImplementations: [] }
    let keySetA = new Set(Object.keys(bcdObjA))
    let keySetB = new Set(Object.keys(bcdObjB))
    let allKeys = union(keySetA, keySetB)
    for (const key of allKeys) {
        let inA = keySetA.has(key)
        let inB = keySetB.has(key)

        let cur = bcdObjB[key] || unimplemented
        let past = bcdObjA[key] || unimplemented


        if (inA && !inB) {
            out.removed.push(key)
        } else if (!inA && inB) {
            out.added.push(key)
        }
        let hasChanges = deltaSupport(key, past, cur, out, latestBrowsers)
        if (hasChanges) {
            out.changed[key] = cur[key]
        }
    }

    out.addedImplementations.sort((a, b) => {
       let one = a.key.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")
       let two = b.key.match(/bcd ::: (\w)*/)[0].replace("bcd ::: ", "")

       if (one < two) { return -1; }
       if (two > one) { return +1; }
       return 0;  
    })
    
    return out
}

exports.delta = delta