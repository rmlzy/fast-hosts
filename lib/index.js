const { findHosts } = require('./find-hosts');
const { writeHosts, removeByHost } = require('./write-hosts');
const { config } = require('./config');

const fastAction = async (type) => {
  const options = config[type];
  if (!options) {
    console.log('🙈 参数错误 !');
    return;
  }

  console.log('🐵 开始寻找可用的 hosts...');
  const hosts = await findHosts(options);

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
};

const clearAction = async (type) => {
  const options = config[type];
  if (!options) {
    console.log('🙈 参数错误 !');
    return;
  }
  options.forEach((host) => {
    removeByHost(host.name);
  });
  console.log('🐒 删除成功 !');
};

module.exports = { fastAction, clearAction };
