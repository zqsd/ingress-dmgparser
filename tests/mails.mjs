import {promises as fs} from "fs";
import { test } from "uvu";
import * as assert from "uvu/assert";
import parseMail from "../parseMail.mjs";

test("real mails", async () => {
    const tests = [
        '1link1link',
        'neutralized',
        'manylinks',
    ];
    for(const test of tests) {
        const [mail, json] = await Promise.all([
            fs.readFile(`./tests/samplemails/${test}.eml`),
            fs.readFile(`./tests/samplemails/${test}.json`)
        ]);
        const parsedMail = await parseMail(mail);
        const expected = JSON.parse(json);
        expected.timestamp = new Date(expected.timestamp);

        assert.equal(parsedMail.attackee, expected.attackee);
        assert.equal(parsedMail.timestamp, expected.timestamp);
        assert.equal(parsedMail.agents, expected.agents);
        assert.equal(parsedMail.portals, expected.portals);
        assert.equal(parsedMail.damages, expected.damages);
    }
});

test.run();