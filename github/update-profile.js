require('dotenv').config();

const { Octokit } = require('@octokit/rest');

const username = 'TheGuy686';
const token = process.env.GIT_HUB_TOKEN;

const octokit = new Octokit({ auth: token });

const fs = require('fs');

const updateReadme = async () => {
    const repositoryName = 'TheGuy686';
    const filePath = 'README.md';

    try {
        // Read the existing content of README.md
        const existingContentResponse = await octokit.repos.getContent({
            owner: username,
            repo: repositoryName,
            path: filePath,
        });

        // Update the content (replace with your desired changes)
        // const newContent = '# Updated README\n\nThis is the updated content. [![Build Status](https://img.shields.io/travis/user/repo.svg)](https://travis-ci.org/user/repo)';
        const newContent = '# Updated README\n\nThis is the updated content. [![Build Status](https://img.shields.io/travis/user/repo.svg)](https://travis-ci.org/user/repo)';

        // Create the request payload
        const updateData = {
            message: 'Update README.md',
            content: Buffer.from(fs.readFileSync(__dirname + '/profile.md')).toString('base64'),
            sha: existingContentResponse.data.sha,
        };

        // Make the PUT request to update the README content
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: username,
            repo: repositoryName,
            path: filePath,
            message: updateData.message,
            content: updateData.content,
            sha: updateData.sha,
        });

        console.log('README.md updated successfully:', response.data);
    }
	catch (error) {
        console.error('Error updating README.md:', error.response ? error.response.data : error.message);
    }
};

updateReadme();
