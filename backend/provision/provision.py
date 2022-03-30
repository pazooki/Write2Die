#!/usr/bin/env python3

import os
import datetime
from time import sleep
from config import setup_logger
import logging
setup_logger('provision.provision', os.path.join('/home/mehrdadpazooki/', 'provision.provision.log'))
log = logging.getLogger('provision.provision')

from subprocess import Popen, PIPE
try:
    import colorama
    from colorama import Fore, Style
except Exception as ex:
    log.info(ex)


def provision():
    ERRORS = ['error', 'failed', 'fails', 'errors', 'missing', 'miss']
    def run(cmd, pass_colour=False):
        print('=' * 10, ' '.join(map(str, [Fore.YELLOW] + cmd + [Style.RESET_ALL])), '=' * 10)
        with Popen(cmd, stdout=PIPE, stderr=PIPE, bufsize=1, universal_newlines=True) as p:
            for line in p.stdout:
                error = any(error in line for error in ERRORS)
                if error and not pass_colour:
                    print(Fore.RED + line + Style.RESET_ALL, end='')
                else:
                    print(Fore.GREEN + line + Style.RESET_ALL, end='')
            for line in p.stderr:
                print(Fore.RED + line + Style.RESET_ALL, end='')
        print('=' * 100)

    _ = lambda x: Fore.GREEN + str(x) + Style.RESET_ALL

    def append_to_file(path, list_of_lines):
        log.info([_('Appending: '), _(list_of_lines)])
        log.info([_('TO: '), _(path)])
        with open(path, 'a') as f:
            f.writelines('\n'.join(list_of_lines) + '\n')           


    _s = 'sudo'
    j = os.path.join

    PATH_TAJIRAN_CODE_ROOT = '/home/mehrdadpazooki/tajiran/'
    PATH_PROVISIONER_CONFIG = j('/home/mehrdadpazooki/tajiran/', 'backend', 'provision')
    PATH_TAJIRAN_FRONTEND_SRC = j('/home/mehrdadpazooki/tajiran/', "frontend/src/")
    PATH_TAJIRAN_BACKEND_SRC = j('/home/mehrdadpazooki/tajiran/', "backend/")
    PATH_VENV_PYTHON = "/home/mehrdadpazooki/.venv/bin/python3"
    PATH_REQUIREMENTS = '/home/mehrdadpazooki/tajiran/backend/requirements.txt'

    CLEAN_UP_LOCAL_DEV_PATHS = [j('/home/mehrdadpazooki/tajiran/', 'config/nginx/conf.d/localhost.conf'),]

    yum_packages_install = [
        _s, 'yum', 'install', '-y',
        
        'epel-release',
        'git',
        'rsync',
        'gunicorn',
        'tree',
        'mosh',
        'fish',
        'java-1.8.0-openjdk',
        'java-1.8.0-openjdk-devel',
        'pcre',
        'zlib.i686'
    ]

    run(yum_packages_install)
    run(['/home/mehrdadpazooki/.venv/bin/python3', '-m', 'pip', 'install', '--upgrade', 'pip'])
    run([_s, 'cp', '/home/mehrdadpazooki/tajiran/backend/provision/config/etc/profile.d/java8.sh', '/etc/profile.d/java8.sh'])

    mongodb_repo = '/etc/yum.repos.d/mongodb-org-4.4.repo'
    if (not os.path.isfile(mongodb_repo)):
        run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/repos/mongodb-org-4.4.repo'), mongodb_repo])
        run([_s, 'yum', 'install', '-y', 'mongodb-org'])
        run([_s, 'systemctl', 'daemon-reload'])
        run([_s, 'systemctl', 'enable', 'mongod'])
        run([_s, 'systemctl', 'start', 'mongod'])
        run(['mongorestore', '/home/mehrdadpazooki/database/dump/'], pass_colour=True)

    nginx_repo = '/etc/yum.repos.d/nginx.repo'
    if (not os.path.isfile(nginx_repo)):
        run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/repos/nginx.repo'), nginx_repo])
        run([_s, 'yum', 'install', '-y', 'nginx'])
        run([_s, 'systemctl', 'daemon-reload'])
        run([_s, 'systemctl', 'enable', 'nginx'])
        run([_s, 'systemctl', 'start', 'nginx'])


    # https://gist.github.com/mastry/162ad084fa8c151755f4
    elasticsearch_repo = '/etc/yum.repos.d/elasticsearch.repo'
    if (not os.path.isfile(elasticsearch_repo)):
        run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/repos/elasticsearch.repo'), elasticsearch_repo])
        run([_s, 'yum', 'install', '-y', 'elasticsearch-oss'])
        run([_s, 'systemctl', 'daemon-reload'])
        run([_s, 'systemctl', 'enable', 'elasticsearch'])
        run([_s, 'systemctl', 'start', 'elasticsearch'])


    for path in CLEAN_UP_LOCAL_DEV_PATHS:
        run([_s, 'rm', '-f', path])

    log.info(['======= Nginx Setup -> Starts'])
    run([_s, 'rsync', '-r', j(PATH_PROVISIONER_CONFIG, 'config/nginx/'), '/etc/nginx/'])
    run([_s, 'tree', '/etc/nginx'])
    run([_s, 'systemctl', 'restart', 'nginx.service'])
    run([_s, 'systemctl', 'status', 'nginx.service'])
    log.info(['======= Nginx Setup -> Ends'])
    
    
    log.info(['======= ElasticSearch Systemctl Service'])
    run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/etc/elasticsearch/jvm.options'), '/etc/elasticsearch/jvm.options'])
    run([_s, 'systemctl', 'daemon-reload'])
    run([_s, 'systemctl', 'enable', 'elasticsearch'])
    run([_s, 'systemctl', 'restart', 'elasticsearch'])

    log.info(['======= Gunicorn Systemctl Service'])
    run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/etc/systemd/system/tajiran.service'), '/etc/systemd/system/tajiran.service'])
    run([_s, 'systemctl', 'daemon-reload'])
    run([_s, 'systemctl', 'enable', 'tajiran.service'])
    run([_s, 'systemctl', 'restart', 'tajiran.service'])

    log.info(['======= Tajiran Import Data Systemctl Service'])
    run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/etc/systemd/system/tajiran.import.service'), '/etc/systemd/system/tajiran.import.service'])
    run([_s, 'systemctl', 'daemon-reload'])
    run([_s, 'systemctl', 'enable', 'tajiran.import.service'])
    run([_s, 'systemctl', 'restart', 'tajiran.import.service'])

    log.info(['======= Tajiran Repo Update Systemctl Service'])
    run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/etc/systemd/system/tajiran.repo.service'), '/etc/systemd/system/tajiran.repo.service'])
    run([_s, 'systemctl', 'daemon-reload'])
    run([_s, 'systemctl', 'enable', 'tajiran.repo.service'])
    # run([_s, 'systemctl', 'restart', 'tajiran.repo.service'])

    log.info(['======= Tajiran Provision Systemctl Service'])
    run([_s, 'cp', j(PATH_PROVISIONER_CONFIG, 'config/etc/systemd/system/tajiran.provision.service'), '/etc/systemd/system/tajiran.provision.service'])
    run([_s, 'systemctl', 'daemon-reload'])
    run([_s, 'systemctl', 'enable', 'tajiran.provision.service'])
    # run([_s, 'systemctl', 'restart', 'tajiran.provision.service'])

    log.info(['======= PIP Install'])
    run(['pip3', 'install', '-r', PATH_REQUIREMENTS])

    log.info(['======= .bashrc'])      
    run([_s, 'cp', '/home/mehrdadpazooki/tajiran/backend/provision/config/.bashrc', '/home/mehrdadpazooki/.bashrc'])

    log.info(['======= Firewall Rules'])
    run([_s, 'firewall-cmd', '--add-service=https', '--permanent'])
    run([_s, 'firewall-cmd', '--add-service=https', '--permanent'])
    run([_s, 'firewall-cmd', '--permanent', '--add-port=60000-61000/udp']) # Mosh
    run([_s, 'firewall-cmd', '--permanent', '--add-port=9200/tcp']) # elasticsearch
    run([_s, 'firewall-cmd', '--permanent', '--add-port=9300/tcp']) # elasticsearch
    run([_s, 'firewall-cmd', '--reload'])

    run([_s, 'sysctl', '-w', 'vm.swappiness=0'])

    run(['rm', '-f', needs_provisioning])
    run(['rm', '-f', lock_provisioning])

    log.info(['='*100])
    

if __name__ == '__main__':
    while True:
        now = datetime.datetime.now()
        ts = now.strftime("%Y-%m-%d %H:%M:%S")

        log.info(["PROVISION.py - " + ts])
        lock_provisioning = "/home/mehrdadpazooki/__provisioning.lock"
        needs_provisioning = '/home/mehrdadpazooki/__needs_provisioning__'

        if os.path.exists(lock_provisioning) or not os.path.exists(needs_provisioning):
            log.info([lock_provisioning + " exists."])
            sleep(10)
            continue

        provision()