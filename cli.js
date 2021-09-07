#!/usr/bin/env node

const cac = require('cac');
const update = require('update-notifier');
const pkg = require('./package');
const { fastAction, clearAction } = require('./lib/index');

const cli = cac('fast-hosts');

cli.command('github', '一键加速 Github').action(function (params) {
  fastAction('github');
});

cli.command('figma', '一键加速 Figma').action(function (params) {
  fastAction('figma');
});

cli.command('clear <type>', '清空配置').action(function (type) {
  clearAction(type);
});

cli.version(pkg.version);
cli.help();
cli.parse();

update({ pkg }).notify();
