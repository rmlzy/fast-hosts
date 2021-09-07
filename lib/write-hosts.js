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
    ['s3-alpha-sig.figma.com', 'www.figma.com', 'static.figma.com'].forEach(
      (host) => {
        removeByHost(host);
      }
    );
    hosts.forEach((item) => {
      hostile.set(item[0], item[1]);
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { writeHosts };
