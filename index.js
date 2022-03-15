#!/usr/bin/env node
const { exec } = require('child_process');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 5693;
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');

function command_new() {

    const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
    const QUESTIONS = [
    {
        name: 'name',
        type: 'input',
        message: 'What would you like to keep the project/workspace name?'
    },
    {
    	name: 'templateName',
    	type: 'list',
    	message: 'Choose a project template',
    	choices: ['basic']
    }
    ];
    
    // list of file/folder that should not be copied
    const SKIP_FILES = ['node_modules', '.template.json'];
    function createDirectoryContents(templatePath, projectName) {
        // read all files/folders (1 level) from template folder
        const filesToCreate = fs.readdirSync(templatePath);
        // loop each file/folder
        filesToCreate.forEach(file => {
            const origFilePath = path.join(templatePath, file);
            
            // get stats about the current file
            const stats = fs.statSync(origFilePath);
        
            // skip files that should not be copied
            if (SKIP_FILES.indexOf(file) > -1) return;
            
            if (stats.isFile()) {
                // read file content and transform it using template engine
                let contents = fs.readFileSync(origFilePath, 'utf8');
                // write file to destination folder
                const writePath = path.join(process.cwd(), projectName, file);
                fs.writeFileSync(writePath, contents, 'utf8');
            } else if (stats.isDirectory()) {
                // create folder in destination folder
                fs.mkdirSync(path.join(process.cwd(), projectName, file));
                // copy files/folder inside current folder recursively
                createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
            }
        });
    }
    
    inquirer.prompt(QUESTIONS).then(a => {
        //
        fs.mkdirSync(a['name']);
        createDirectoryContents(path.join(__dirname, 'templates', a['templateName']), a['name']);
        console.log('Installing dependencies...');
        exec('cd ' + a['name'] + ' && npm i');
    });
}

function command_dev() {
    const publicDir = process.cwd();

    app.use(express.static(publicDir));
    http.listen(port, () => {
        console.log('Listening on http://localhost:' + port);
        console.log('Opening...');

        if (process.argv[3] === 'open') {
            if (process.platform === 'linux')
                exec('google-chrome http://localhost:' + port);
            if (process.platform === 'win32')
                exec('start google-chrome http://localhost:' + port);
            if (process.platform === 'darwin')
                console.log('Open your browser to: http://localhost:' + port);
        }
    });
}

if (process.argv[2] === 'new') {
    command_new();
} else if (process.argv[2] === 'dev') {
    command_dev();
}
