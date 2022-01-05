module.exports = function haproxyConf(maxconn, port, backends) {
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


listen www
\tbind *:${port}
\tbalance roundrobin
\thttp-response set-header Access-Control-Allow-Origin "http://localhost:8080"
\thttp-response set-header Access-Control-Allow-Methods "GET, POST, OPTIONS"
\thttp-response set-header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"
${backends}`
}
