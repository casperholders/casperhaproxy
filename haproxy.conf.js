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

listen mainnet_metrics
\tbind *:8888
\tbalance roundrobin
\thttp-response set-header Access-Control-Allow-Origin "http://localhost:8080"
\thttp-response set-header Access-Control-Allow-Methods "GET, POST, OPTIONS"
\thttp-response set-header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding"
\tserver www1 116.202.217.126:8888 maxconn 50 check inter 10s

listen testnet_metrics
\tbind *:8889
\tbalance roundrobin
\thttp-response set-header Access-Control-Allow-Origin "http://localhost:8080"
\thttp-response set-header Access-Control-Allow-Methods "GET, POST, OPTIONS"
\thttp-response set-header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding"
\tserver www1 95.216.44.9:8888 maxconn 50 check inter 10s

listen www
\tbind *:${port}
\tbalance roundrobin
\thttp-response set-header Access-Control-Allow-Origin "http://localhost:8080"
\thttp-response set-header Access-Control-Allow-Methods "GET, POST, OPTIONS"
\thttp-response set-header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding"
\toption httpchk
\thttp-check send meth POST  uri /rpc  hdr Content-Type application/json  body "{ \\"jsonrpc\\": \\"2.0\\", \\"id\\": 1,    \\"method\\": \\"info_get_status\\",    \\"params\\": []}"
\thttp-check expect string ${chainspec_name}
\tcompression algo gzip
\tcompression type text/html text/plain text/xml text/css text/javascript application/javascript application/json text/json
\tlog stdout  format raw  local0  info
${backends}`
}
