console.clear();

const Twig = require('twig'), twig = Twig.twig; 

const fs = require('fs');

const { exec } = require('child_process');

function eexec (command) {
    return new Promise((resolve) => {
        const childProcess = exec(command);

        let dataM = '';

        childProcess.stdout.on('data', async (data) => {
            dataM += data;
        });

        childProcess.on('close', (code) => {
            resolve({
                success: true,
                stdout: dataM,
            });
        });
    });
}

const data = require('./profile')();

const profiledMd = __dirname + '/profile.md';

const profileData = {
    description: data.description,
    highlightedTags: data.highlightedTags,
    skills: data.allTagsSorted,
};

// first render the profile mark down
const mdResult = Twig.twig({
    data: fs.readFileSync(__dirname + '/profile.twig').toString(),
});

// output that to data: fs.readFileSync(__dirname + '/profile.twig').toString(),a temporary file
fs.writeFileSync(profiledMd, mdResult.render(profileData));

// console.log(mdResult.render(profileData));

(async () => {

    await eexec(`node ${__dirname}/update-profile.js`);

    console.log('Finished updating');

})();

// console.log('data: ', data);

