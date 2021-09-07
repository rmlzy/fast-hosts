#!/usr/bin/env node

const cac = require('cac');
const update = require('update-notifier');
const pkg = require('./package');
const { bootstrap } = require('./lib/index');

const cli = cac('fast-figma');

cli.command('github', '一键加速 Github').action(function (params) {
  bootstrap('github');
});

cli.command('figma', '一键加速 Figma').action(function (params) {
  bootstrap('figma');
});

cli.version(pkg.version);
cli.help();
cli.parse();

update({ pkg }).notify();
