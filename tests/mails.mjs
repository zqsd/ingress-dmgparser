import {promises as fs} from "fs";
import { test } from "uvu";
import * as assert from "uvu/assert";
import parseMail from "../parseMail.mjs";

[
    '1link1link',
    'neutralized',
    'manylinks',
    'noimage',
].forEach(filename => {
    test(`mail : ${filename}`, async () => {
        const [mail, json] = await Promise.all([
            fs.readFile(`./tests/samplemails/${filename}.eml`),
            fs.readFile(`./tests/samplemails/${filename}.json`)
        ]);
        const parsedMail = await parseMail(mail);
        const expected = JSON.parse(json);
        expected.timestamp = new Date(expected.timestamp);

        assert.equal(parsedMail.attackee, expected.attackee);
        assert.equal(parsedMail.timestamp, expected.timestamp);
        assert.equal(parsedMail.agents, expected.agents);
        assert.equal(parsedMail.portals, expected.portals);
        assert.equal(parsedMail.damages, expected.damages);
    });
});

test.run();