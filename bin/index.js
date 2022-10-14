#!/usr/bin/env node
const program = require('commander');
const {version, description} = require('../package.json');
program
    .name('zeaho-ci')
    .version(version)
    .description(description)
    .option('-s, --start', 'run script file')
    .option('-i, --init', 'init ci.config.json')
    .parse();

const options = program.opts();


Object.entries(options).forEach(([key, value]) => {
    value && require(`../scripts/${key}`)();
})

