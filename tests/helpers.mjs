import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {JSDOM} from 'jsdom';
import {getDmgRows, parseAgent, parseDamage, parseMainAgent, parseStatus, parsePortal, parseMap} from '../dmgReportHelpers.mjs';

function html(code) {
    return new JSDOM(code).window.document.body;
}

test('getDmgRows', () => {
    const body = html('<table width="750px"><tbody><tr><td><table width="700px"><tbody><tr><td><div>AGENT NAME</div></td></tr><tr><td><div>DAMAGE REPORT</div></td></tr><tr><td><div>portal name</div></td></tr><tr><td><div>portal image</div></td></tr><tr><td></td></tr><tr><td><div>portal name</div></td></tr></tbody></table></td></tr></tbody></table>');
    const dmgs = getDmgRows(body);
    assert.equal(dmgs.length, 2);
    assert.equal(dmgs[0].length, 2);
    assert.equal(dmgs[1].length, 1);
});

test('parseAgent', () => {
    assert.equal(parseAgent(html('<span style="color:#428f43">yoda</span>').querySelector('span')), {name: 'yoda', team: 'enlightened'});
    assert.equal(parseAgent(html('<span style="color:#428f43">__JARVIS__</span>').querySelector('span')), {name: '__JARVIS__', team: 'enlightened'});
    assert.equal(parseAgent(html('<span style="color:#3679b9">blu</span>').querySelector('span')), {name: 'blu', team: 'resistance'});
    assert.equal(parseAgent(html('<span style="color:#3679b9">__ADA__</span>').querySelector('span')), {name: '__ADA__', team: 'resistance'});
});

test('parseStatus', () => {
    assert.equal(parseStatus(html('<div>STATUS:<br>Level 7<br>Health: 98%<br>Owner: <span style="color: #428F43;">yoda</span></div>').querySelector('div')), {level: 7, health: 98, owner: {name: 'yoda', team: 'enlightened'}});
    assert.equal(parseStatus(html('<div>STATUS:<br>Level 1<br>Health: 0%<br>Owner: [uncaptured]</div>').querySelector('div')), {level: 1, health: 0, owner: null});
});

test('parseDamage', () => {
    assert.equal(parseDamage(html('<div><span class="im">DAMAGE:<br>1 Resonator destroyed by <span style="color:#3679b9">JePassePartout</span> at 12:07 hrs GMT<br></span>1 Mod destroyed by <span style="color:#3679b9">smurf</span> at 12:07 hrs GMT<br>5 Resonators remaining on this Portal.</div>').querySelector('div')), {
        resonators: 5,
        attacker: {team: 'resistance', name: 'smurf'},
        damage: {resonators: 1, mods: 1, links: 0}
    });
    assert.equal(parseDamage(html('<div><span class="im">DAMAGE:<br>1 Resonator destroyed by <span style="color:#3679b9">smurfette</span> at 09:49 hrs GMT<br></span>No remaining Resonators detected on this Portal.</div>').querySelector('div')), {
        resonators: 0,
        attacker: {team: 'resistance', name: 'smurfette'},
        damage: {resonators: 1, mods: 0, links: 0}
    });
    assert.equal(parseDamage(html('<div>DAMAGE:<br>1 Link destroyed by <span style="color: #3679B9;">blu</span> at 11:57 hrs GMT<br>8 Resonators remaining on this Portal.</div>').querySelector('div')), {
        resonators: 8,
        attacker: {team: 'resistance', name: 'blu'},
        damage: {resonators: 0, mods: 0, links: 1}
    });
    assert.equal(parseDamage(html('<div>DAMAGE:<br>4 Resonators destroyed by <span style="color:#428f43">gre</span> at 12:03 hrs GMT<br>2 Mods destroyed by <span style="color:#428f43">gre</span> at 12:03 hrs GMT<br>4 Resonators remaining on this Portal.</div>').querySelector('div')), {
        resonators: 4,
        attacker: {team: 'enlightened', name: 'gre'},
        damage: {resonators: 4, mods: 2, links: 0}
    });
});

test('parseMap', () => {
    assert.equal(parseMap('https://ci6.googleusercontent.com/proxy/LGo4PiT6wE4iGmU7vv-je3E-4KTuvu2BsE1Fu2huQAyULuNj5rNx4G4qu9aNHZbO_dUKD3824wj-dl4nXa_4x69wKQbZgLIIEQ9A8i8vhh2IoS0ESrRasxpLyzlhKkPq3ChwLXgR2VJAaEIfBFs28o_wOrRIoQ0Wz0DZy3q0CSsv5DQl-pbxm1wT1XMKiPyoQhPesdO_Ci4ilOTOwldvzYK6mSqNp7iF9tfNFv7c30z-_rQkyAyAkWNDwDTa-9D_0G2ipoBwMgY7IYqm3V2NVC7CobuZxFwAiGDFHtTtD1ddnPYV-hMxtFNho4mczHFWqQe-9y5v4xTHVppHqAEZchhA_pOQeCg9MbpW3IO0DEz3ZKBZaj69hD5Lt_MJYwTGAbY1SY8LNNufU7P6NwsMGxY67p17FMOYFsQkDVLYt23gbDJFrSiGUXu5w8fP74jKeuBhzp_mw3oK7hm7FzT4psY9qIIOWJZS56kYWJWMz5R_HnaDWvF7N8uMcfc4e9bSh62sfrTPks8AmG6bF3b0Hbcn3wPG8ZMVAlsaB3ZyJpnmhoDookzTcJptL-cIamPpPtaBEKSH8fD3GQZSpRddoc0ct379m3-O2aXgM_twyMh9CSiDZQK0AWbB5iRYciAtRWJuYSnuokfWahOTcSBt7EjUm8jBuVv7L5suCC5IQV6sjM4lPyPydGHmIiMNcxHfBrohUPFPsXvMsRYw=s0-d-e1-ft#http://maps.googleapis.com/maps/api/staticmap?center=43.613138,3.893974&zoom=19&size=268x201&style=visibility:on%7Csaturation:-50%7Cinvert_lightness:true%7Chue:0x131c1c&style=feature:water%7Cvisibility:on%7Chue:0x005eff%7Cinvert_lightness:true&style=feature:poi%7Cvisibility:off&style=feature:transit%7Cvisibility:off&markers=icon:http://commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/hum_4res.png%7Cshadow:false%7C43.613138,3.893874&client=gme-nianticinc&signature=TLRiXLszBTg7m8axYo0w5XtSYkA='), {
        team: 'resistance',
        resonators: 4,
    });
    assert.equal(parseMap('https://ci6.googleusercontent.com/proxy/LGo4PiT6wE4iGmU7vv-je3E-4KTuvu2BsE1Fu2huQAyULuNj5rNx4G4qu9aNHZbO_dUKD3824wj-dl4nXa_4x69wKQbZgLIIEQ9A8i8vhh2IoS0ESrRasxpLyzlhKkPq3ChwLXgR2VJAaEIfBFs28o_wOrRIoQ0Wz0DZy3q0CSsv5DQl-pbxm1wT1XMKiPyoQhPesdO_Ci4ilOTOwldvzYK6mSqNp7iF9tfNFv7c30z-_rQkyAyAkWNDwDTa-9D_0G2ipoBwMgY7IYqm3V2NVC7CobuZxFwAiGDFHtTtD1ddnPYV-hMxtFNho4mczHFWqQe-9y5v4xTHVppHqAEZchhA_pOQeCg9MbpW3IO0DEz3ZKBZaj69hD5Lt_MJYwTGAbY1SY8LNNufU7P6NwsMGxY67p17FMOYFsQkDVLYt23gbDJFrSiGUXu5w8fP74jKeuBhzp_mw3oK7hm7FzT4psY9qIIOWJZS56kYWJWMz5R_HnaDWvF7N8uMcfc4e9bSh62sfrTPks8AmG6bF3b0Hbcn3wPG8ZMVAlsaB3ZyJpnmhoDookzTcJptL-cIamPpPtaBEKSH8fD3GQZSpRddoc0ct379m3-O2aXgM_twyMh9CSiDZQK0AWbB5iRYciAtRWJuYSnuokfWahOTcSBt7EjUm8jBuVv7L5suCC5IQV6sjM4lPyPydGHmIiMNcxHfBrohUPFPsXvMsRYw=s0-d-e1-ft#http://maps.googleapis.com/maps/api/staticmap?center=43.613138,3.893974&zoom=19&size=268x201&style=visibility:on%7Csaturation:-50%7Cinvert_lightness:true%7Chue:0x131c1c&style=feature:water%7Cvisibility:on%7Chue:0x005eff%7Cinvert_lightness:true&style=feature:poi%7Cvisibility:off&style=feature:transit%7Cvisibility:off&markers=icon:http://commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/enl_4res.png%7Cshadow:false%7C43.613138,3.893874&client=gme-nianticinc&signature=TLRiXLszBTg7m8axYo0w5XtSYkA='), {
        team: 'enlightened',
        resonators: 4,
    });
    assert.equal(parseMap('https://ci6.googleusercontent.com/proxy/jT4HFNoJnpUF4wYOqer_g7SsRV_iOwvTEtWeFtE_3usP_3LuU58-llKb2WrokpTIkkzAAFayROQocsEvlt2pTCmX7LJsNB2BZkGCN_MV7bTxyBFY-f5GocjMPHdTCCmAkgx5dAg6-b4RYGskzT-ItvlsPVGdiWdEZuF2hCh5TZ8j8AtFRNQ79ZQYMA0bIoNKH9uSP6m4A16DoPTk5-vxsggSUDOSS70Vv6qUo8UecbVR0KYO0A3UrrwDOcvuSUlfFIYNMikNejnUUZ9iUUVXmeC5kbqc45msc1u-tqunnsClH_pBcp3rOacHsrweLZfLYh4PwawtvNCjUB2o97-pULarEY73ztaZKwVIhGbpvKiSwhRY3_JfY8tBQhFdjRF-vudVNdC3ggPY0ppfxTb_F8YE68VnpEeKSO90fmmz33I9DdBothhByr-HKTBNBrEggOQDlkF00DHgX5NwA7stj03ndh0x-Kd_tEXXkYOj4jsKK9KmOpfKDJD-3Ke98qP6lXKW6iLDPyatb5Oz6_eEyXTbW2LPC3UttLz0vmJcZNZTGv4qfe1Rw3P1c8cKV-NC15I7ZffzbjSbestm5JXOySAaYlmuQMkZiZ3CRtjrzS5aC9dqjIgUCVs2bl-6h2ofEUy5KI_1LeevnWiSOHdDk0ABpweHM-PppSOifgmsaaMpmZoX_nxcF-4UOca7DZ1DK7muH6JFPWCUfcJDnarvEg=s0-d-e1-ft#http://maps.googleapis.com/maps/api/staticmap?center=43.607050,3.881696&zoom=19&size=268x201&style=visibility:on%7Csaturation:-50%7Cinvert_lightness:true%7Chue:0x131c1c&style=feature:water%7Cvisibility:on%7Chue:0x005eff%7Cinvert_lightness:true&style=feature:poi%7Cvisibility:off&style=feature:transit%7Cvisibility:off&markers=icon:http://commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/neutral_icon.png%7Cshadow:false%7C43.607050,3.881596&client=gme-nianticinc&signature=9U8yR8mJ4eAPFu1mzakHpXe67_I='), {
        team: 'neutral',
        resonators: 0,
    });
});

test('parsePortal', () => {
    const h = html('<table><tr><td style="padding-top:1em;padding-bottom:1em"><div>Some portal</div><div><a href="https://www.ingress.com/intel?ll=13.37,42&amp;pll=13.37,42&amp;z=19" style="color:#d73b8e;border:none;text-decoration:none" target="_blank">1337 rue du leet, 42000 Sainté, France</a></div></td></tr><tr><td style="overflow:hidden"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td><img src="https://lh3.googleusercontent.com/urlbidon" alt="Portal - Some portal" height="201" style="display:block;border:0;line-height:100%;outline:none;text-decoration:none" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 128px; top: 485.286px;"><div id=":3yn" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " data-tooltip-class="a1V" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div></td><td><img src="https://ci6.googleusercontent.com/proxy/LGo4PiT6wE4iGmU7vv-je3E-4KTuvu2BsE1Fu2huQAyULuNj5rNx4G4qu9aNHZbO_dUKD3824wj-dl4nXa_4x69wKQbZgLIIEQ9A8i8vhh2IoS0ESrRasxpLyzlhKkPq3ChwLXgR2VJAaEIfBFs28o_wOrRIoQ0Wz0DZy3q0CSsv5DQl-pbxm1wT1XMKiPyoQhPesdO_Ci4ilOTOwldvzYK6mSqNp7iF9tfNFv7c30z-_rQkyAyAkWNDwDTa-9D_0G2ipoBwMgY7IYqm3V2NVC7CobuZxFwAiGDFHtTtD1ddnPYV-hMxtFNho4mczHFWqQe-9y5v4xTHVppHqAEZchhA_pOQeCg9MbpW3IO0DEz3ZKBZaj69hD5Lt_MJYwTGAbY1SY8LNNufU7P6NwsMGxY67p17FMOYFsQkDVLYt23gbDJFrSiGUXu5w8fP74jKeuBhzp_mw3oK7hm7FzT4psY9qIIOWJZS56kYWJWMz5R_HnaDWvF7N8uMcfc4e9bSh62sfrTPks8AmG6bF3b0Hbcn3wPG8ZMVAlsaB3ZyJpnmhoDookzTcJptL-cIamPpPtaBEKSH8fD3GQZSpRddoc0ct379m3-O2aXgM_twyMh9CSiDZQK0AWbB5iRYciAtRWJuYSnuokfWahOTcSBt7EjUm8jBuVv7L5suCC5IQV6sjM4lPyPydGHmIiMNcxHfBrohUPFPsXvMsRYw=s0-d-e1-ft#http://maps.googleapis.com/maps/api/staticmap?center=43.613138,3.893974&amp;zoom=19&amp;size=268x201&amp;style=visibility:on%7Csaturation:-50%7Cinvert_lightness:true%7Chue:0x131c1c&amp;style=feature:water%7Cvisibility:on%7Chue:0x005eff%7Cinvert_lightness:true&amp;style=feature:poi%7Cvisibility:off&amp;style=feature:transit%7Cvisibility:off&amp;markers=icon:http://commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/hum_4res.png%7Cshadow:false%7C43.613138,3.893874&amp;client=gme-nianticinc&amp;signature=TLRiXLszBTg7m8axYo0w5XtSYkA=" alt="Map" height="201" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none" class="CToWUd"></td></tr></tbody></table></td></tr></table>');
    assert.equal(parsePortal(h.querySelector('tr:nth-child(1)'), h.querySelector('tr:nth-child(2)')), {
        name: 'Some portal',
        address: '1337 rue du leet, 42000 Sainté, France',
        image: 'https://lh3.googleusercontent.com/urlbidon',
        latitude: 13.37,
        longitude: 42,
        team: 'resistance',
        resonators: 4,
    });

    // link destroyed portal
    const h2 = html('<table><tr><td><table cellpadding="0" cellspacing="0" border="0" width="700px"><tbody><tr><td width="50px" style="line-height:0"><img src="https://ci4.googleusercontent.com/proxy/h8BHrmdP_AOe8Egu6tNQbQvoCWyCLKxSYQ7NcFbsSAAlzZkR0kS0N5i-jQY0ZGc0D4dLEXDsQN3flIssgZdZStzcSnLk1su_XItqMIGNAcnIzOFr27DJGAJZSz5YsjM=s0-d-e1-ft#http://commondatastorage.googleapis.com/ingressemail/damagereport/line_1.png" width="50" height="26" class="CToWUd"></td><td>Other portal : <a href="https://www.ingress.com/intel?ll=4,0.4&amp;pll=4,0.4&amp;z=19" style="color:#d73b8e;border:none;text-decoration:none" target="_blank">404 street not found, 40400 Berea</a></td></tr></tbody></table></td></tr><tr><td style="overflow:hidden"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td width="50px" style="line-height:0;vertical-align:top"><img src="https://ci4.googleusercontent.com/proxy/SaqhP3ZwGEg9DIeDATfLXM6WjwNt-fnt447n2h2uRSqaWy7tU7XMd3KnNjO_FjxK75YR0hYl5K1TCwBzYvZvY07Ovv6hKtRZHBRIjtuPqQjYkY0KUZcuF6P8DGqMxRw=s0-d-e1-ft#http://commondatastorage.googleapis.com/ingressemail/damagereport/line_3.png" width="50" height="22" class="CToWUd"></td><td rowspan="2"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td><img src="https://lh3.googleusercontent.com/urlbidon" alt="Portal - Other portal" height="162" style="display:block;border:0;line-height:100%;outline:none;text-decoration:none" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 315.286px; top: 699px;"><div id=":34h" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " data-tooltip-class="a1V" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div></td><td><img src="https://ci4.googleusercontent.com/proxy/Idu6VpavGCBRPNGTDelyqgrhACnEEjQ5GqZ4b0Vr6XctagH1JGCCviq4RexXYZK8lNIfRfhMN5oOnYWPt3g6hlbeKN52XDIOSiTCmxrOdFkcrOubrioD91rXtgUBVESbFl4XGL_NI6s1-2HeH0laI9JA1bGx7Qj0jr-i1c3Tdq0ClIrainzXyu6l5ilRGJcBLbcUOCeh2-MCLw-JCZrff9xrJKKUERMCSAynH-4d2UDeVR6_4Mh2A3i_106Xsj26eXZ9vE295_3wWqppyMa4tD6tcD_fmxJrO59hxIkurr7et-l_-cN8xeo_FROiZC65-E75APx_kDEuXQYYXxQI3dF-EEhpeWvj42sofpKjIhJza8tItL-zmLxzAxcJXzy5Cnt_Se7yYag9pEy5EBkC1zBDR4tjxWd4rDchYCq5AI9P13squhul3xtBCbsKqkP3i12apGLTi8I4O9g4lI-WXSXElBVon494ffdft5S146wQrDRxbziQ6RQPvtdwxcMw4DeTJ8V-4gfx1EWe4BOKPcYuMacuVTuzgV73aAvUfAMHMbfu-kB_tYJO3NeoSC2ol-xLXr7f-bVRvqIMflj_3P4jYQfMQ-waXco-zgn5dio1VnidK53bHT1xtezbJnqD8tlSdIyfZFI3MbEzjORqqcbIHcexFV_Uu-nvUy9SPmE4aNg0OjcvleyBPEQh3ER343bqtjySwjncZBIv=s0-d-e1-ft#http://maps.googleapis.com/maps/api/staticmap?center=4,0.4&amp;zoom=19&amp;size=216x162&amp;style=visibility:on%7Csaturation:-50%7Cinvert_lightness:true%7Chue:0x131c1c&amp;style=feature:water%7Cvisibility:on%7Chue:0x005eff%7Cinvert_lightness:true&amp;style=feature:poi%7Cvisibility:off&amp;style=feature:transit%7Cvisibility:off&amp;markers=icon:http://commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/enl_8res.png%7Cshadow:false%7C43.591455,3.896052&amp;client=gme-nianticinc&amp;signature=4lzbyAho1Y_OkdOlr9DdrfXHMq0=" alt="Map" height="162" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none" class="CToWUd"></td></tr></tbody></table></td></tr><tr><td width="50px" style="line-height:0;vertical-align:top"><img src="https://ci4.googleusercontent.com/proxy/h8BHrmdP_AOe8Egu6tNQbQvoCWyCLKxSYQ7NcFbsSAAlzZkR0kS0N5i-jQY0ZGc0D4dLEXDsQN3flIssgZdZStzcSnLk1su_XItqMIGNAcnIzOFr27DJGAJZSz5YsjM=s0-d-e1-ft#http://commondatastorage.googleapis.com/ingressemail/damagereport/line_1.png" width="50" height="140" class="CToWUd"></td></tr></tbody></table></td></tr></table>');
    assert.equal(parsePortal(h2.querySelector('tr:nth-child(1)'), h2.querySelector('tr:nth-child(2)')), {
        name: 'Other portal',
        address: '404 street not found, 40400 Berea',
        image: 'https://lh3.googleusercontent.com/urlbidon',
        latitude: 4,
        longitude: 0.4,
        team: 'enlightened',
        resonators: 8,
    });
});

test('parseMainAgent', () => {
    assert.equal(parseMainAgent(html('<table><tr><td valign="top" style="font-size:13px;padding-bottom:1.5em"><span style="font-weight:normal;margin-right:.3em;font-size:10px;text-transform:uppercase">Agent Name:</span><span style="color:#428f43">gre</span><br><span style="font-weight:normal;margin-right:.3em;font-size:10px;text-transform:uppercase">Faction:</span><span style="color:#428f43">Enlightened</span><br><span style="font-weight:normal;margin-right:.3em;font-size:10px;text-transform:uppercase">Current Level:</span><span>L15</span></td></tr></table>').querySelector('tr')), {
        name: 'gre',
        team: 'enlightened',
        level: 15,
    });

});

test.run();