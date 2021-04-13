const querystring = require('querystring');

export function getDmgRows(document) {
    const trs = document.querySelector('table[width="750px"] > tbody > tr > td > table[width="700px"] > tbody').childNodes;
    const damages = [];
    let start = 2; // skip agent name and DAMAGE REPORT ROW

    for(let i = start; i < trs.length; i++) {
        const td = trs[i].childNodes[0];
        // manage separator
        if(td && td.childNodes.length === 0) {
            damages.push(Array.prototype.slice.call(trs, start, i));
            start = i + 1;
        }
    }
    damages.push(Array.prototype.slice.call(trs, start));
    return damages;
}

export function parseMainAgent(tr) {
    const agent = parseAgent(tr.querySelector('span:nth-child(2)'));
    return Object.assign(agent, {
        level: parseInt(tr.querySelector('span:last-child').textContent.substring(1)),
    });
}

export function parseStatus(element) {
    return {
        level: parseInt(element.childNodes[2].wholeText.match(/^Level (\d+)$/)[1]),
        health: parseInt(element.childNodes[4].wholeText.match(/^Health: (\d+)%$/)[1]),
        owner: element.childNodes[7] ? parseAgent(element.childNodes[7]) : null,
    };
}

export function parseDamage(element) {
    let linksDestroyed = 0, resonatorsDestroyed = 0, modsDestroyed = 0, resonators, attacker;
    (function traverse(element) {
        for(let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            const text = child.wholeText;
            if(text) {
                if(text.match(/ Link[s]? destroyed by $/)) {
                    linksDestroyed = parseInt(text);
                    attacker = parseAgent(element.childNodes[i + 1]);
                }
                else if(text.match(/ Mod[s]? destroyed by $/)) {
                    modsDestroyed = parseInt(text);
                    attacker = parseAgent(element.childNodes[i + 1]);
                }
                else if(text.match(/ Resonator[s]? destroyed by $/)) {
                    resonatorsDestroyed = parseInt(text);
                    attacker = parseAgent(element.childNodes[i + 1]);
                }
                else if(text.endsWith(' Resonators remaining on this Portal.')) {
                    resonators = parseInt(text);
                }
                else if(text.endsWith('No remaining Resonators detected on this Portal.')) {
                    resonators = 0;
                }
            }
            else {
                traverse(child);
            }
        }
    })(element);
    if(resonatorsDestroyed === 0 && linksDestroyed === 0 && modsDestroyed === 0) {
        throw new Error('no damage detected');
    }
    
    return {
        damage: {
            resonators: resonatorsDestroyed,
            links: linksDestroyed,
            mods: modsDestroyed,
        },
        resonators,
        attacker,
    };
}

export function parseAgent(element) {
    const color = element.style.getPropertyValue('color');
    if(color === 'rgb(66, 143, 67)') {
        return {
            name: element.textContent,
            team: 'enlightened',
        };
    }
    if(color === 'rgb(54, 121, 185)') {
        return {
            name: element.textContent,
            team: 'resistance',
        };
    }
    throw new Error('agent parsing failed');
}

export function parseMap(url) {
    const [, icon] = url.match(/\/marker_images\/(.+)\.png/);
    const icon_split = icon.split('_');
    let team = {'neutral': 'neutral', 'enl': 'enlightened', 'hum': 'resistance'}[icon_split[0]],
        resonators = parseInt(icon_split[1]) || 0;
    if(!team) {
        throw new Error(`unknown portal team ${icon}`);
    }
    return {
        team,
        resonators,
    };
}

export function parsePortal(tr1, tr2) {
    const a = tr1.querySelector('a');
    const address = a.textContent.trim();
    const intel = a.getAttribute('href');
    const latlng = querystring.parse(intel).pll.split(',').map(Number.parseFloat);

    const imgImage = tr2.querySelector('img[alt^="Portal - "]');
    const imgMap = tr2.querySelector('img[alt="Map"]');
    const name = imgImage.getAttribute('alt').substr(9);
    const image = imgImage.getAttribute('src');
    const map = imgMap.getAttribute('src');
    const {resonators, team} = parseMap(map);

    return {
        name,
        address,
        image,
        latitude: latlng[0],
        longitude: latlng[1],
        resonators,
        team,
    }
}