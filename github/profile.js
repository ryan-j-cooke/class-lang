const { LinkedInProfileScraper } = require('linkedin-profile-scraper')

const fs = require('fs');
const linkedInProfile = 'https://www.linkedin.com/in/ryan-j-cooke/';

// google-chrome --headless --disable-gpu --no-sandbox --disable-software-rasterizer --disable-dev-shm-usage --virtual-time-budget=10000 --js-flags="--script=/user_data/projects/vue/resume/github/profile.js" --dump-dom https://www.linkedin.com/in/ryan-j-cooke/


const data = require('../profile-data');

function randDarkColor() {
    let lum = -0.5; // Adjust the luminance value for even darker colors
    let hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
    
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    let rgb = '#', c, i;

    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
    }

    return rgb;
}

function darkenColor(rgb, amount) {
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;

    // Darken the RGB values
    const darkenedR = Math.round(r * (1 - amount));
    const darkenedG = Math.round(g * (1 - amount));
    const darkenedB = Math.round(b * (1 - amount));

    // Convert back to hex
    const darkenedHex = ((darkenedR << 16) | (darkenedG << 8) | darkenedB).toString(16);

    // Ensure leading zeros are included
    return '#' + '0'.repeat(6 - darkenedHex.length) + darkenedHex;
}

function getRandomDarkColor() {
    // Generate a random color in hexadecimal format
    const randomColor = randDarkColor();

    // Darken the color by reducing its brightness
    const darkenAmount = 0.2;
    const darkColor = darkenColor(randomColor, darkenAmount);

    return {
        color: randomColor,
        dark: darkColor,
    };
}

function allTags() {
    const tagsOut = {};

    // loop over each job and get the top level tabs
    for (const j of data.workHistory) {
        const tags = j?.skills ?? [];

        // loop over top level skill tags
        for (const t of tags) {
            if (typeof tagsOut[t] == 'undefined') {
                tagsOut[t] = {
                    color: getRandomDarkColor(),
                    tag: t,
                    badge: data.badges?.[t],
                    count: 0,
                };
            }

            // keep the count to display which are my most prominent skills
            tagsOut[t].count++;
        }

        // then loop over each project in the job if present
        if (j?.projects && j?.projects?.length > 0) {
            for (const p of j.projects) {
                // then loop over each skill within that project
                if (p?.skills && p.skills.length > 0) {
                    for (const t of p.skills) {
                        if (typeof tagsOut[t] == 'undefined') {
                            tagsOut[t] = {
                                color: getRandomDarkColor(),
                                tag: t,
                                badge: data.badges?.[t],
                                count: 0,
                            };
                        }

                        // keep the count to display which are my most prominent skills
                        tagsOut[t].count++;
                    }
                }
            }
        }
    }

    return tagsOut;
}

function allTagsSorted(allTags) {
    return Object.values(allTags).sort((a, b) => {
        return b.count - a.count;
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function() {

    const wh = data.workHistory;

    // console.log(wh)

    const highlighted = [
        'flutter',
        'typescript',
        'laravel',
        'symfony',
        'node-js',
        'php',
        'git',
        'javascript',
        'vue-js',
        'react-native',
        'project-management',
        'nuxt',
    ];
// https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
// https://api.linkedin.com/v2/ryan-j-cooke

    const tags = allTags();
    const aTags = allTagsSorted(tags);
    const highlightedTags = aTags.filter(t => highlighted.includes(t.tag));

    // const reviews = await new Promise(async (resolve, reject) => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();

    //     await page.goto(linkedInProfile, { waitUntil: 'domcontentloaded' });

    //     await page.waitForFunction(() => document.getElementsByClassName('artdeco-card'), { visible: true, timeout: 10000 });

    //     await page.waitForFunction(() => {
    //         if (document.getElementsByClassName('artdeco-Create One If Not Exists (On Menu Id) One If Not Exists (On Menu Id)rd')) {
    //             return true;
    //         }
    //       }, { timeout: 10000 });

    //     const htmlContent = await page.content();

    //     await browser.close();

    //     const reviews = [];

    //     // \<li.*?>([\d\D\s\S\w\W]+?)<\/li>
    //     const section = htmlContent.match(/\<section .*?class=".*?artdeco-card[\d\D\w\W\s\S]+?">([\d\D\w\W\s\S]+?)<\/section>/gm);

    //     console.log('FROM HERE: ', section);

    //     fs.writeFileSync(`${__dirname}/linkedInProfile.html`, htmlContent);

    //     // console.log(response.data);

    //     resolve(reviews);
    // });

    return {
        description: data.intro.join('\n\n'),
        highlightedTags: highlightedTags,
        allTags: tags,
        allTagsSorted: aTags,
    };
}