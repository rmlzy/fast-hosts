// Inspire from https://github.com/Moonvy/Figma-Net-OK/blob/master/app/script/test-dns.js

const nslookup = require('nslookup');
const dns = require('dns');
const { default: axios } = require('axios');

const ipInfo = async (ip) => {
  try {
    let re = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
      timeout: 3000
    });
    return `${re.data.countryCode},${re.data.country},${re.data.city}`;
  } catch (e) {
    // console.log("ipInfo", e)
    return `未知地区`;
  }
};

const dnsList = async (name, url) => {
  let allAddrs = [];

  await Promise.all(
    [
      async () => {
        let localDNSServers = dns.getServers();

        // "本地 DNS"
        for (const localDNSServer of localDNSServers) {
          allAddrs.push(...(await dnsLookup(name, localDNSServer)));
        }
      },
      async () => {
        // Google DNS
        allAddrs.push(...(await dnsLookup(name, '8.8.8.8')));
      },
      async () => {
        // 百度 DNS
        allAddrs.push(...(await dnsLookup(name, '180.76.76.76')));
      },
      async () => {
        // 阿里 DNS
        allAddrs.push(...(await dnsLookup(name, '223.5.5.5')));
      },
      async () => {
        // 114 DNS
        allAddrs.push(...(await dnsLookup(name, '114.114.114.114')));
      },
      async () => {
        // Cloudflare DNS
        allAddrs.push(...(await dnsLookup(name, '1.1.1.1')));
      },
      async () => {
        // Quad9 DNS
        allAddrs.push(...(await dnsLookup(name, '9.9.9.9')));
      },
      async () => {
        // 腾讯 DNS
        allAddrs.push(...(await dnsLookup(name, '119.29.29.29')));
      },
      async () => {
        // level3.net  DNS
        allAddrs.push(...(await dnsLookup(name, '4.2.2.1')));
      }
    ].map((f) => f())
  );

  allAddrs = Array.from(new Set(allAddrs));

  let list = [];
  let minTime = 5500;
  let i = 0;
  for (const addr of allAddrs) {
    i++;
    let ob = { ip: addr, info: {} };
    try {
      let info = await ipInfo(addr);
      ob.info = info;
    } catch (error) {
      console.error(error);
    }

    try {
      if (url) {
        let time = await testUrl(url, ob.ip, minTime);
        ob.time = time;
        minTime = Math.min(minTime, time);
      }
    } catch (error) {
      console.error(error);
    }
    list.push(ob);
  }

  list = list
    .sort((a, b) => a.time - b.time)
    .filter((x) => x != undefined && typeof x.ip != undefined);
  return list;
};

const dnsLookup = (name, server = '8.8.8.8') => {
  return new Promise((resolve, reject) => {
    nslookup(name)
      .server(server)
      .timeout(5 * 1000)
      .end(function (err, addrs) {
        if (err) {
          resolve([]);
        } else {
          resolve(addrs.filter((x) => /./.test(x)));
        }
      });
  });
};

const staticLookup = (ip, v) => (hostname, opts, cb) => cb(null, ip, v || 4);

const staticDnsAgent = (scheme, ip) =>
  new require(scheme).Agent({ lookup: staticLookup(ip) });

const testUrl = (url, ip, timeout = 5500) => {
  return new Promise((resolve) => {
    let t0 = new Date().getTime();
    axios
      .get(url, {
        httpsAgent: staticDnsAgent('https', ip),
        timeout: timeout + 10
      })
      .then((r) => {
        let t1 = new Date().getTime();
        resolve(t1 - t0);
      })
      .catch((e) => {
        resolve(9999999);
      });
  });
};

const findHosts = async (options) => {
  const output = [];
  const len = options.length;
  for (let i = 0; i < len; i++) {
    const host = options[i];
    console.log(`🐌 [查找 ${i + 1}/${len}] ${host.name}`);
    try {
      const ips = await dnsList(host.name, host.url);
      if (ips.length) {
        host.ip = ips[0].ip;
        output.push(host);
      }
    } catch (e) {
      // ignore
    }
  }
  return output;
};

module.exports = { findHosts };
