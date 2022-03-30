# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
        . /etc/bashrc
fi

# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

# scl enable devtoolset-9 -- bash
# User specific aliases and functions
export GOOGLE_APPLICATION_CREDENTIALS="/home/mehrdadpazooki/keys/google-api-key.json"
source /etc/profile.d/java8.sh
export BOOST_ROOT=/home/mehrdadpazooki/libs/boost
export BOOST_INCLUDE=/home/mehrdadpazooki/libs/boost/include
export BOOST_LIBDIR=/home/mehrdadpazooki/libs/boost/lib

export CPLUS_INCLUDE_PATH=/usr/local/include/python3.9
export C_INCLUDE_PATH=/usr/local/include/python3.9
export PYTHON_INCLUDE=/usr/local/include/python3.9
export PYTHONPATH=/home/mehrdadpazooki/tajiran/backend
export LD_LIBRARY_PATH=/usr/local/lib/:/usr/lib64/
export PYTHON_HOME=/usr/local/bin/python3
export PATH=$PATH:/usr/local/lib:/usr/lib64:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/usr/bin/python3:/root/bin
source /opt/rh/devtoolset-9/enable