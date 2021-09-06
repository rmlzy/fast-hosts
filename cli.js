#!/usr/bin/env node

const cac = require('cac');
const update = require('update-notifier');
const { findHosts } = require('./lib/util');
const { writeHosts } = require('./lib/write-hosts');
const pkg = require('./package');

const cli = cac('fast-figma');

cli.command('').action(async function () {
  console.log('🐵 开始寻找可用的 hosts...');
  const hosts = await findHosts();

  if (hosts.length === 0) {
    console.log('🙈 未找到可用的 hosts !');
    return;
  }

  console.log('🐵 开始写入 hosts...');
  const success = await writeHosts(hosts);

  if (success) {
    console.log('🐒 写入成功 !');
  } else {
    console.log('🙈 写入失败 !');
  }
});

cli.version(pkg.version);
cli.help();
cli.parse();

update({ pkg }).notify();
