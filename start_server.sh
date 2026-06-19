#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 8098 --bind 127.0.0.1 > /dev/null 2>&1 &
echo $!
sleep 1
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8098/index.html
