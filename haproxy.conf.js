module.exports = function haproxyConf(maxconn, port, backends, chainspec_name) {
  return `global
\tmaxconn ${maxconn}

defaults
\tlog\tglobal
\tmode\thttp
\toption\thttplog
\toption\tdontlognull
\ttimeout connect 5000
\ttimeout client  50000
\ttimeout server  50000

frontend stats
\tbind *:8404
\tstats enable
\tstats uri /stats

listen www
\tbind *:${port}
\tbalance roundrobin
\thttp-response set-header Access-Control-Allow-Origin "http://localhost:8080"
\thttp-response set-header Access-Control-Allow-Methods "GET, POST, OPTIONS"
\thttp-response set-header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
\toption httpchk
\thttp-check send meth POST  uri /rpc  hdr Content-Type application/json  body "{ \\"jsonrpc\\": \\"2.0\\", \\"id\\": 1,    \\"method\\": \\"info_get_status\\",    \\"params\\": []}"
\thttp-check expect string ${chainspec_name}
${backends}`
}
