#!/usr/bin/env python3

import os
from pathlib import Path
from subprocess import Popen, PIPE
import datetime
from time import sleep
from config import setup_logger
import logging
setup_logger('provision.update', os.path.join('/home/mehrdadpazooki/', 'provision.update.log'))
log = logging.getLogger('provision.update')

lock_provisioning = "/home/mehrdadpazooki/__provisioning.lock"
lock_updating = "/home/mehrdadpazooki/__updating.lock"
needs_provisioning = '/home/mehrdadpazooki/__needs_provisioning__'

def run(cmd, log=True):
    if log:
        logging.info([cmd])
    return Popen(cmd, stdout=PIPE).communicate()[0]

j = os.path.join

def update_repo():
    GIT_DIR = '--git-dir=/home/mehrdadpazooki/tajiran/.git'
    run(['git', GIT_DIR, 'fetch', 'origin'], False)
    is_update_available = run( ['git', GIT_DIR, 'log', 'HEAD..origin/main', '--oneline'], False)
    logging.info(['UPDATE CHECK RESULT:', is_update_available or 'NO UPDATE'])
    if is_update_available:
        run(['rm', '-rf', '/home/mehrdadpazooki/tajiran-upstream'])
        run(['mkdir', '-p', '/home/mehrdadpazooki/tajiran-upstream'])
        run(['git', 'clone', '--depth', '1', 'git@github.com:pazooki/tajiran.git', 'tajiran-upstream'])
        run(['rm', '-rf', '/home/mehrdadpazooki/tajiran'])
        run(['mv', '/home/mehrdadpazooki/tajiran-upstream', '/home/mehrdadpazooki/tajiran'])
        run(['sudo', 'chmod', '+x', '/home/mehrdadpazooki/tajiran/backend/scheduled/tse.py'])
        # run(['sudo', 'chmod', '+x', '/home/mehrdadpazooki/tajiran/backend/provision/update.py'])
        # run(['sudo', 'chmod', '+x', '/home/mehrdadpazooki/tajiran/backend/provision/service.sh'])
        Path(needs_provisioning).touch()
        logging.info(['Successfully updated repo.'])

    run(['rm', '-f', lock_updating], False)

if __name__ == '__main__':
    while True:
        now = datetime.datetime.now()
        ts = now.strftime("%Y-%m-%d %H:%M:%S")

        logging.info(["UPDATE.py - " + ts])

        if os.path.exists(lock_updating) or os.path.exists(lock_provisioning):
            logging.info([lock_updating + "or" + lock_provisioning + " exists."])
            sleep(10)
            continue
        
        update_repo()




