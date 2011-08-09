#!/bin/bash 
mkdir -p /var/www/paste2image/logs

kill -9 `pgrep -f paste2image.py`;

sleep 0.5;

python /var/www/paste2image/paste2image.py --log_file_max_size=10240000 --log_file_num_backups=10 --log_file_prefix=/var/www/paste2image/logs/paste2image8000.log --port=8000 &
python /var/www/paste2image/paste2image.py --log_file_max_size=10240000 --log_file_num_backups=10 --log_file_prefix=/var/www/paste2image/logs/paste2image8001.log --port=8001 &
python /var/www/paste2image/paste2image.py --log_file_max_size=10240000 --log_file_num_backups=10 --log_file_prefix=/var/www/paste2image/logs/paste2image8002.log --port=8002 &
python /var/www/paste2image/paste2image.py --log_file_max_size=10240000 --log_file_num_backups=10 --log_file_prefix=/var/www/paste2image/logs/paste2image8003.log --port=8003 &

