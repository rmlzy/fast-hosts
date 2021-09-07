// Inspire from https://github.com/Moonvy/Figma-Net-OK/blob/master/app/script/test-dns.js

const nslookup = require('nslookup');
const dns = require('dns');
const { default: axios } = require('axios');

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
      // console.error(error)
    }

    try {
      if (url) {
        let time = await testUrl(url, ob.ip, minTime);
        ob.time = time;
        minTime = Math.min(minTime, time);
      }
    } catch (error) {
      // console.error(error)
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

const findHosts = async () => {
  console.log(`🐌 [查找 1/3] s3-alpha-sig.figma.com`);
  const s3_ips = await dnsList(
    's3-alpha-sig.figma.com',
    'https://s3-alpha.figma.com/profile/9b3f693e-0677-4743-89ff-822b9f6b72be'
  );

  console.log(`🐌 [查找 2/3] www.figma.com`);
  const api_ips = await dnsList(
    'www.figma.com',
    'https://www.figma.com/api/community_categories/all?page_size=10'
  );

  console.log(`🐌 [查找 3/3] static.figma.com`);
  const static_ips = await dnsList(
    'static.figma.com',
    'https://static.figma.com/app/icon/1/icon-192.png'
  );

  const hosts = [];
  if (s3_ips.length) {
    hosts.push([s3_ips[0].ip, 's3-alpha-sig.figma.com']);
  }
  if (api_ips.length) {
    hosts.push([api_ips[0].ip, 'www.figma.com']);
  }
  if (static_ips.length) {
    hosts.push([static_ips[0].ip, 'static.figma.com']);
  }
  return hosts;
};

module.exports = { findHosts };
