import {simpleParser} from 'mailparser';
import {getDmgRows, parseAgent, parseDamage, parseMainAgent, parseStatus, parsePortal, parseMap} from './dmgReportHelpers';
import {JSDOM} from 'jsdom';

async function readMail(data) {
    const fixedData = data.toString('utf8').replace(/\r?\n/g, '\r\n');
    return await simpleParser(fixedData);
}

function portalKey(portal) {
    return `${portal.latitude},${portal.longitude}`;
}

export default async function(rawMail) {
    const mail = await readMail(rawMail);
    const html = new JSDOM(mail.html).window.document.body;

    const timestamp = mail.date;
    const attackee = Object.assign(parseMainAgent(html), {email: mail.to.value[0].address});
    const agentsMap = {},
          portalsMap = {};

    function addPortal(portalData, damage, status) {
        const key = portalKey(portalData);
        if(damage) {
            portalData.resonators = damage.resonators;
        }
        if (status) {
            portalData.level = status.level;
            portalData.health = status.health;
            addAgent(status.owner);
            portalData.owner = status.owner.name;
        }
        return portalsMap[key] = key in portalsMap ? Object.assign(portalsMap[key], portalData) : portalData;
    }

    function addAgent(agentData) {
        const key = agentData.name;
        return agentsMap[key] = key in agentsMap ? Object.assign(agentsMap[key], agentData) : agentData;
    }

    addAgent(attackee);

    const dmgsRows = getDmgRows(html);
    const damages = [];
    dmgsRows.forEach(rows => {
        const damage = parseDamage(rows[rows.length - 1]);
        const status = parseStatus(rows[rows.length - 1].querySelector('td > table > tbody > tr > td:nth-child(2) > div'));
        const portals = [];
        for(let i = 0; i < rows.length - 1; i += 3) {
            const portal = parsePortal(rows[i], rows[i + 1]);
            if(i === 0) {
                portals.push(addPortal(portal, damage, status));
            }
            else {
                portals.push(addPortal(portal));
            }
        }

        addAgent(damage.attacker);

        if(damage.damage.links !== portals.length - 1)
            throw new Error('incoherent numbers of links and portals');

        damages.push({
            portal: portalKey(portals[0]),
            attacker: damage.attacker.name,
            resonators: damage.damage.resonators,
            mods: damage.damage.mods,
            links: portals.slice(1).map(portal => {
                return portalKey(portal);
            }),
        });
    });

    return {
        timestamp,
        attackee: attackee.name,
        agents: agentsMap,
        portals: portalsMap,
        damages,
    };
}