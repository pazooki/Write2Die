#!/bin/bash

cp /home/mehrdadpazooki/tajiran-upstream/backend/provision/update.py /home/mehrdadpazooki/
cp /home/mehrdadpazooki/tajiran-upstream/backend/provision/provision.py /home/mehrdadpazooki/

sudo chmod +x /home/mehrdadpazooki/update.py
sudo chmod +x /home/mehrdadpazooki/provision.py

sudo chown mehrdadpazooki:mehrdadpazooki /home/mehrdadpazooki/update.py
sudo chown mehrdadpazooki:mehrdadpazooki /home/mehrdadpazooki/provision.py