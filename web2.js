const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const net = require('net');

const html = `<!DOCTYPE html>
<body>
  <h1>Welcome to my space</h1>
  <p>This a portal page.</p>
</body>`;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}).listen(8000);


var httpprotocol = 'https'
var wakeupurl = 'https://myservice-5t4n.onrender.com/'

function waitForNextMessageList(receiveMessageobj) {
    let messageBuffer = [];
    return new Promise((resolve) => {
        receiveMessageobj.receiver = (message) => {
            messageBuffer.push(message);
            // Only resolve the promise for the first message in the
            // current call stack. After that we can keep pushing messages
            // to the buffer.
            if (messageBuffer.length === 1) {
                resolve(messageBuffer);
            }
        };
    });
}
async function* createMessageListStream(receiveMessageobj) {
    while (true) {
        yield waitForNextMessageList(receiveMessageobj);
    }
}
async function* createMessageStream(receiveMessageobj) {
    let messageListStream = createMessageListStream(receiveMessageobj);
    for await (let messageList of messageListStream) {
        for (let message of messageList) {
            yield message;
        }
    }
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function randomString(length) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (let i = length; i > 0; --i)
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

function openconn(port, host) {

    return new Promise(accept => {

        let client = net.connect({ port: port, host: host }, () => {

            accept(client)
        })

        client.on('error', () => {
            accept(null)
        })
    })
}

var lastproxy = Date.now()
var getcount = null

function keepserverrun() {
    if (Date.now() - lastproxy < 1800000 || (getcount && getcount() > 0)) {
        //do wakeup
        if (wakeupurl != '') {

            const options = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.3.1 Mobile/15E148 Safari/604.1"
                }
            }

            if (httpprotocol == 'http') {
                http.get(wakeupurl, options)
            } else {
                https.get(wakeupurl, options)
            }

        }

    }
    setTimeout(keepserverrun, 180000)
}
keepserverrun()

function wsconn() {
    return new Promise(async (resovle) => {


        let ws = new WebSocket('ws://oa1.ximiximi.gentile.cc:2052/ovXAFB' + randomString(6), { 'headers': { 'mymask': 1 }, 'handshakeTimeout': 8000 });
        //let tmp = new WebSocket('wss://bad-shark-59.deno.dev/ovXAFB' + randomString(6), { 'headers': { 'host': 'bad-shark-59.deno.dev', 'mymask':1}, 'servername': 'bad-shark-59.deno.dev', 'handshakeTimeout': 8000 });
        //let tmp = new WebSocket('ws://127.0.0.1:8080/ovXAFB' + randomString(6), { 'headers': { 'host': 'bad-shark-59.deno.dev', 'mymask':1}, 'servername': 'bad-shark-59.deno.dev', 'handshakeTimeout': 8000 });
        //let tmp = new WebSocket('ws://cf80fra.ximiximi:8080/erp3' + randomString(12), { 'headers': { 'host': 'erp.ximiximi.kalja.info' + ':2052a' }, 'handshakeTimeout': 8000 });
        //let ws = new WebSocket('ws://cf80fra.ximiximi:8080/oa1' + randomString(12), { 'headers': { 'host': 'oa.ximiximi.kalja.info' + ':2052a' }, 'handshakeTimeout': 8000 });
        //messageBuffer = []

        ws.on('open', function () {
            //console.log('ws open')

            resovle(true)
            //mainconn = tmp
            //ismainconnok = true
            // for (let i = 0; i < waitingforwsok.length; i++) {
            //     if (waitingforwsok[i].receiver) {
            //         console.log('!!!receiver' + i)
            //         waitingforwsok[i].receiver(true)
            //     }
            // }


            var dataqueue = []
            var conns = []
            var mask = '1'
            var keepaliveobj = { receiver: null }


            function getactiveconn() {
                let count = 0
                for (let i = 0; i < conns.length; i++) {
                    if (conns[i].isopen == true)
                        count++
                }
                return count
            }
            getcount = getactiveconn



            async function wskeepalive() {

                //console.log('send ping')
                let ping = new Uint8Array(1)
                ping[0] = 251
                wswrite(ping)


                let keepaliveStream = createMessageStream(keepaliveobj);

                //let tmp=await keepaliveStream.next()

                let ptmp = await Promise.race([keepaliveStream.next(), new Promise(accept => {
                    setTimeout(() => {
                        accept(false)
                    }, 10000)
                })])

                keepaliveobj.receiver = null

                //console.log(ptmp)

                if (ptmp == false) {
                    ws.close()
                }
                if (ws.readyState == WebSocket.OPEN) {
                    setTimeout(wskeepalive, 25000)
                }


            }
            wskeepalive()

            async function wswrite(chunk) {
                if (ws.readyState != WebSocket.OPEN) {
                    return
                }

                await new Promise(accept => {
                    if (mask == '') {
                        ws.send(chunk, () => {
                            accept()
                        });
                    } else {
                        let tmp = new Uint8Array(chunk)
                        //console.log(tmp)
                        for (let i = 0; i < tmp.length; i++) {
                            //tmp[i]=255-tmp[i]
                            tmp[i] = (tmp[i] >>> 5) + ((tmp[i] << 3) & 0b11111111)
                        }
                        //console.log(tmp)
                        ws.send(tmp, () => {
                            accept()
                        })
                    }
                })

            }
            async function forawaitreadable(id, stream) {
                try {
                    for await (const data of stream) {
                        //console.log('in for await')

                        //console.log(data)
                        //console.log(data.length)
                        if (data.length > 65536) {
                            //console.log('big data')
                            //console.log(data.length)
                        }

                        let j = 0
                        let isover = false
                        while (isover == false) {
                            let tmpdata
                            if (data.length - j * 65536 > 65536) {
                                tmpdata = data.slice(j * 65536, (j + 1) * 65536)
                                j++

                            } else {

                                tmpdata = data.slice(j * 65536)
                                isover = true
                            }

                            let dataframe = new Uint8Array(tmpdata.length + 5)
                            dataframe[0] = 200
                            dataframe[1] = (id >>> 8) & 0b11111111
                            dataframe[2] = (id) & 0b11111111
                            dataframe[3] = ((tmpdata.length - 1) >>> 8) & 0b11111111
                            dataframe[4] = (tmpdata.length - 1) & 0b11111111
                            for (let i = 0; i < tmpdata.length; i++) {
                                dataframe[5 + i] = tmpdata[i]
                            }
                            //console.log(dataframe)

                            await wswrite(dataframe)

                        }


                    }
                } catch (error) {
                    //console.log('in forawait catch')
                    //console.log(error)
                }

                //console.log('after for await')

                for (let i = 0; i < conns.length; i++) {
                    if (conns[i].id == id) {
                        conns[i].isopen = false

                        conns[i].conn.destroy()

                        break
                    }

                }

                let closeframe = new Uint8Array(3)
                closeframe[0] = 252
                closeframe[1] = (id >>> 8) & 0b11111111
                closeframe[2] = (id) & 0b11111111
                wswrite(closeframe)

            }

            ws.on('message', async function message(data) {
                //console.log('received: %s', data);
                if (keepaliveobj.receiver) {
                    keepaliveobj.receiver(true)
                }
                //console.log('in message listener');
                //console.log(data);
                //console.log(type);
                if (data) {
                    //console.log(data)
                    //console.log(dataqueue)
                    let tmp = new Uint8Array(data)
                    for (let i = 0; i < tmp.length; i++) {
                        if (mask == '') {
                            dataqueue.push(tmp[i])
                        } else {
                            tmp[i] = (tmp[i] >>> 5) + ((tmp[i] << 3) & 0b11111111)
                            dataqueue.push(tmp[i])
                        }
                    }
                    //console.log(dataqueue)

                    let flag = -1
                    while (true) {
                        if (flag == dataqueue.length || dataqueue.length == 0) {
                            break
                        }
                        flag = dataqueue.length

                        if (dataqueue[0] == 255) {
                            if (dataqueue.length >= 6 && dataqueue.length >= (6 + dataqueue[5])) {
                                lastproxy = Date.now()

                                //console.log(dataqueue)
                                let raw_id = dataqueue.slice(1, 3)
                                let raw_port = dataqueue.slice(3, 5)
                                let raw_host = dataqueue.slice(6, 6 + dataqueue[5])
                                dataqueue.splice(0, 6 + dataqueue[5])
                                let id = raw_id[0] * 256 + raw_id[1]
                                let port = raw_port[0] * 256 + raw_port[1]
                                let host_buffer = new Uint8Array(raw_host.length)
                                for (let i = 0; i < raw_host.length; i++) {
                                    host_buffer[i] = raw_host[i]
                                }
                                let host = new TextDecoder().decode(host_buffer)

                                //console.log(id)
                                //console.log(port)
                                //console.log(host)

                                let conn = await openconn(port, host)
                                if (conn) {
                                    conns.push({ conn: conn, id: id, isopen: true })
                                    let openokframe = new Uint8Array(3)
                                    openokframe[0] = 254
                                    openokframe[1] = raw_id[0]
                                    openokframe[2] = raw_id[1]
                                    wswrite(openokframe)

                                    forawaitreadable(id, conn)

                                } else {
                                    //send error msg here
                                    //console.log('open fail')

                                    let openfailframe = new Uint8Array(3)
                                    openfailframe[0] = 253
                                    openfailframe[1] = raw_id[0]
                                    openfailframe[2] = raw_id[1]
                                    wswrite(openfailframe)

                                }

                            }
                        } else if (dataqueue[0] == 200) {
                            if (dataqueue.length >= 5) {
                                let raw_len = dataqueue.slice(3, 5)
                                let len = raw_len[0] * 256 + raw_len[1] + 1
                                if (dataqueue.length >= (5 + len)) {
                                    let raw_id = dataqueue.slice(1, 3)
                                    let id = raw_id[0] * 256 + raw_id[1]
                                    let data = dataqueue.slice(5, 5 + len)
                                    dataqueue.splice(0, 5 + len)
                                    // console.log(id)
                                    // console.log(len)
                                    // console.log(data)
                                    for (let i = 0; i < conns.length; i++) {
                                        if (conns[i].id == id) {
                                            if (conns[i].isopen) {
                                                let dataarray = new Uint8Array(data.length)
                                                for (let i = 0; i < data.length; i++) {
                                                    dataarray[i] = data[i]
                                                }

                                                conns[i].conn.write(dataarray)


                                            } else {
                                                //send error msg here
                                            }
                                            break
                                        }
                                    }
                                }
                            }
                        } else if (dataqueue[0] == 252) {
                            //console.log('in 252')
                            let raw_id = dataqueue.slice(1, 3)
                            let id = raw_id[0] * 256 + raw_id[1]
                            dataqueue.splice(0, 3)

                            for (let i = 0; i < conns.length; i++) {
                                if (conns[i].id == id) {
                                    conns[i].isopen = false

                                    conns[i].conn.destroy()

                                    break
                                }

                            }

                        } else if (dataqueue[0] == 251) {
                            //console.log('recieve ping')
                            dataqueue.splice(0, 1)
                            let pong = new Uint8Array(1)
                            pong[0] = 250
                            wswrite(pong)

                        } else if (dataqueue[0] == 250) {
                            //console.log('recieve pong')
                            dataqueue.splice(0, 1)
                            if (keepaliveobj.receiver) {
                                keepaliveobj.receiver(true)
                            }
                        } else {
                            console.log('dataqueue wrong')
                        }
                    }

                }
            });


            ws.on('close', function (code, reason) {
                //obj.c_ws.destroy();
                //console.log(code)
                //console.log(reason.toString())
                //closeall()
                getcount = null
                dial()
            });

            ws.on('error', function (e) {
                //obj.c_ws.destroy();
                //closeall()
                getcount = null
                dial()
            });



            // for (let message of messageBuffer) tmp.send(message);
            // messageBuffer = undefined;

        })
        ws.on('error', (err) => {
            console.error(` client [ERROR] - ${err}`);
            //c_tcp.destroy()
            resovle(false)

        });
    })
}


var isconnecting = false

async function dial() {
    if (isconnecting)
        return
    isconnecting = true
    while (true) {
        if (await wsconn())
            break
        await sleep(3000)
    }
    isconnecting = false
}


dial()

