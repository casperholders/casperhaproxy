const { CasperServiceByJsonRPC } = require('casper-js-sdk');
const axios = require('axios');
const haproxyConf = require('./haproxy.conf');
const fs = require('fs');

const awaitTimeout = (delay, reason) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () => (reason === undefined ? resolve() : reject(reason)),
      delay,
    ),
  );

const wrapPromise = (promise, delay, reason) =>
  Promise.race([promise, awaitTimeout(delay, reason)]);

async function getStatus(address, apiVersion, chainspecName, height) {
  console.log(address);
  try {
    const status = (await axios.get('http://' + address + '/status', { timeout: 300 })).data;
    if (status.api_version === apiVersion && status.chainspec_name === chainspecName && status.last_added_block_info.height >= height) {
      console.log('http://' + address.replace(/:[0-9]*/g, ':7777'));
      try {
        const block = await wrapPromise(new CasperServiceByJsonRPC('http://' + address.replace(/:[0-9]*/g, ':7777') + '/rpc').getBlockInfoByHeight(height), 1000, { reason: 'timeout' });
        if (block.block.header.height === height) {
          console.log('good');
          addresses.push(address);
        } else {
          console.log(block);
          console.log('bad block');
        }
      } catch (e) {
        console.log(e);
        console.log('timeout ?');
      }
    }
  } catch (e) {
    console.log(e);
    console.log('timeout');
  }
}

async function peersStatus(rpc) {
  const casperClient = new CasperServiceByJsonRPC(rpc);
  const status = await casperClient.getStatus();

  const peers = (await casperClient.getPeers()).peers;
  let arrayIp = [];
  for (const peer of peers) {
    arrayIp.push(peer.address.replace(/:[0-9]*/g, ':8888'));
  }

  arrayIp = [...new Set(arrayIp)];
  console.log(arrayIp);
  for (const ip of arrayIp) {
    await getStatus(ip, status.api_version, status.chainspec_name, status.last_added_block_info.height);
  }

  let backends = '';

  for (let i = 0; i < addresses.length; i++) {
    backends += '\tserver www' + (i + 1) + ' ' + addresses[i].replace(/:[0-9]*/g, ':7777') + ' maxconn 50 check inter 10s\n';
  }

  const configFile = haproxyConf(addresses.length * 50, 8500, backends);
  console.log(configFile);
  fs.writeFile('haproxy.cfg', configFile, function (err) {
    if (err) throw err;
    console.log('Saved!');
    process.exit();
  });
}

let addresses = [];
const args = process.argv.slice(2)

peersStatus(args[0])
