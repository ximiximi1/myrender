chmod +x web1.js

./web1.js client --keepalive 55s --max-retry-interval 60s http://oa2.ximiximi.eu.org:2052 R:2443:8080 >/dev/null 2>&1 &

python -m http.server

