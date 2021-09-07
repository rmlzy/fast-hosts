const hostile = require('hostile');

const removeByHost = (host) => {
  const lines = hostile.get(false) || [];
  lines.forEach((item) => {
    if (item[1] === host) {
      hostile.remove(item[0], host);
    }
  });
};

const writeHosts = async (hosts) => {
  try {
    hosts.forEach((host) => {
      removeByHost(host.name);
      hostile.set(host.ip, host.name);
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { writeHosts };
