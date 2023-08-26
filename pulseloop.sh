#!/bin/sh

pulsecnt=0
dopulse(){
let pulsecnt+=1;
if [ $pulsecnt -gt 10 ]
then
	#echo "dopulse"
	#/userdisk/util/stun_pulse >/dev/null 2>&1 &
    ./busybox wget -O - https://myservice-5t4n.onrender.com >/dev/null 2>&1
	pulsecnt=0
fi
}



count=100

while true
do
  # loop infinitely
    
    str=$(./busybox netstat -anp |grep web1.js | grep ESTABLISHED | grep -v :2052 | grep -v 127.0.0.1 |./busybox wc -l)
    #echo $str
    #str1="$(echo $str | cut -d' ' -f1)"
    #echo $str1
    if [ $str -gt 0 ]
    then
	#echo settozero 
        if [ $count -gt 30 ]
        then
           ./busybox wget -O - https://myservice-5t4n.onrender.com >/dev/null 2>&1
           pulsecnt=0
        fi
        count=0
        #echo $count
    else
	#echo add1
        let count+=1;
        #echo $count
    fi
    if [ $count -lt 30 ]
    then
        #echo stop
        #dostop
        #./busybox wget -O - https://myservice-5t4n.onrender.com >/dev/null
	    dopulse
    else
	    count=100
    fi
    #echo $count 
    sleep 60
    
done

