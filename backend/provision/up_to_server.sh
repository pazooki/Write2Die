#!/bin/bash

# groupadd mehrdadpazooki
# useradd -m mehrdadpazooki -g mehrdadpazooki
# usermod -g mehrdadpazooki root
# echo "mehrdadpazooki ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
# echo "%mehrdadpazooki ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
# passwd mehrdadpazooki

# sestatus
# sudo setenforce 0
# sudo sed -i s/^SELINUX=.*$/SELINUX=disabled/ /etc/selinux/config

IP_ADDRESS="135.181.241.104";

PROJECT_DIR="/home/mehrdadpazooki/PycharmProjects/Tajiran/";
DATABASE_DIR="/home/mehrdadpazooki/PycharmProjects/database/";
KEYS_DIR="/home/mehrdadpazooki/PycharmProjects/Tajiran/backend/provision/config/keys";

scp -r -P 3031 $KEYS_DIR  mehrdadpazooki@$IP_ADDRESS:~/keys;
scp -r -P 3031 $DATABASE_DIR  mehrdadpazooki@$IP_ADDRESS:~/database;