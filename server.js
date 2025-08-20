console.clear();

const express = require('express');
const app = express();
const path = require('path');

const port = 2000;

const fs = require('fs');

const { exec } = require('child_process');

var Twig = require('twig'), twig = Twig.twig; 

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

async function checkPort(port) {
    try {
        const res = await eexec(`lsof -i :${port}`);

        let out = [], headers;

        if (new RegExp(`:${port}.*?\(LISTEN\)`).test(res.stdout)) return true;

        return false;
    }
    catch (e) {
        throw `Command->checkPort - Error: Could not check port. "${e.message}"`;
    }
}

app.use(express.static(path.join(__dirname, 'deps')));
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'class.html'));
});

app.get('/resources', (req, res) => {
    const lesson = req.query.lesson;

    if (!lesson) {
        return res.status(400).json({ error: 'Missing lesson number in query parameters' });
    }

    const filePath = path.join(__dirname, `lessons/lesson-${lesson}.json`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: `Lesson ${lesson} not found` });
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Error reading lesson file' });
            }

            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (parseErr) {
                res.status(500).json({ error: 'Invalid JSON in lesson file' });
            }
        });
    });
});

app.get('/class.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'class.html'));
});

app.get('/personal-statement.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'personal-statement.html'));
});

app.get('/portfolio.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio.html'));
});

app.get('/education.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'education.html'));
});

var Markdown = require('markdown-to-html').Markdown;
var md = new Markdown();

md.bufmax = 2048;

app.get('/github-markdown.html', async (req, res) => {
    try {
		const profiledMd = __dirname + '/github/profile.md';

		const profileData = {
			something: 'RYAN',
		};

		const opts = {
			title: 'File $BASENAME in $DIRNAME',
			stylesheet: 'test/style.css'
		};

		// first render the profile mark down
		const mdResult = Twig.twig({
			data: fs.readFileSync(__dirname + '/github/profile.twig').toString(),
		});

		// output that to a temporary file
		fs.writeFileSync(profiledMd, mdResult.render(profileData));

		const html = await new Promise((resolve, reject) => {
			md.render(profiledMd, opts, function(err) {
	
				if (err) {
					console.error('>>>' + err);
					process.exit();
				}
			
				resolve(md.html);
			});
		});

		const result = Twig.twig({
			data: fs.readFileSync(__dirname + '/github-markdown.html').toString(),
		});

		res.header('Content-Type', 'text/html');

		res.send(result.render({ html: html }));
    }
    catch (error) {
        console.error('Error rendering template:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || port;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    if (!await checkPort(2100)) {
        require('./reload-server');
    }
});