const { findHosts } = require('./find-hosts');
const { writeHosts, removeByHost } = require('./write-hosts');
const { config } = require('./config');

const fastAction = async (type) => {
  const options = config[type];
  if (!options) {
    console.log('π εζ°ιθ―― !');
    return;
  }

  console.log('π΅ εΌε§ε―»ζΎε―η¨η hosts...');
  const hosts = await findHosts(options);

  if (hosts.length === 0) {
    console.log('π ζͺζΎε°ε―η¨η hosts !');
    return;
  }

  console.log('π΅ εΌε§εε₯ hosts...');
  const success = await writeHosts(hosts);

  if (success) {
    console.log('π εε₯ζε !');
  } else {
    console.log('π εε₯ε€±θ΄₯ !');
  }
};

const clearAction = async (type) => {
  const options = config[type];
  if (!options) {
    console.log('π εζ°ιθ―― !');
    return;
  }
  options.forEach((host) => {
    removeByHost(host.name);
  });
  console.log('π ε ι€ζε !');
};

module.exports = { fastAction, clearAction };
