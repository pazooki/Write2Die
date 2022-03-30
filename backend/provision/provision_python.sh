sudo yum -y update
(cd /etc/yum.repos.d/; wget https://download.opensuse.org/repositories/shells:fish:release:3/CentOS_7/shells:fish:release:3.repo;)
sudo yum install centos-release-scl -y
sudo yum install -y epel-release -y
sudo yum install centos-release-scl
sudo yum install devtoolset-9-gcc devtoolset-9-gcc-c++
sudo yum install openssl-devel libffi-devel bzip2-devel wget git \
                 mlocate zlib-devel bzip2 bzip2-devel readline-devel \
                 sqlite sqlite-devel openssl-devel xz xz-devel libffi-devel \
                 fish mosh fish -y
sudo yum group install "Development Tools" -y

sudo firewall-cmd --zone=public --permanent --add-port=60000-61000/udp
sudo firewall-cmd --reload

wget https://www.python.org/ftp/python/3.9.6/Python-3.9.6.tar.xz
tar xvf Python-3.9.6.tar.xz
#  --enable-optimizations
(cd Python-3.9*/; ./configure --enable-shared --with-threads --with-ssl; sudo make -j "$(nproc)"; sudo make altinstall;)
sudo ln -s /usr/local/bin/python3.9 /usr/bin/python3
sudo ln -s /usr/local/bin/pip3.9 /usr/bin/pip3
export LD_LIBRARY_PATH=/usr/local/lib/:/usr/lib64/;
echo 'export LD_LIBRARY_PATH=/usr/local/lib/:/usr/lib64/' >> /home/mehrdadpazooki/.bashrc;
# sudo echo 'export PATH=$PATH:/usr/bin/python3' >> /etc/profile
source /etc/profile
source /home/mehrdadpazooki/.bashrc;
sudo ldconfig;
python3.9 --version
pip3.9 --version



/usr/local/bin/python3.9 -m pip install --upgrade pip
python3 -m venv .venv
/home/mehrdadpazooki/.venv/bin/python3 -m pip install --upgrade pip setuptools wheel

export CPLUS_INCLUDE_PATH=/usr/local/include/python3.9
export C_INCLUDE_PATH=/usr/local/include/python3.9
export PYTHON_INCLUDE=/usr/local/include/python3.9
export PYTHONPATH=/home/mehrdadpazooki/tajiran/backend
export LD_LIBRARY_PATH=/usr/local/lib/

ln -s /usr/local/include/python3.9 .venv/include/python3

(wget https://boostorg.jfrog.io/artifactory/main/release/1.76.0/source/boost_1_76_0.tar.gz; tar -xzf boost_1_*)
cp /home/mehrdadpazooki/tajiran/backend/provision/config/boost/user-config.jam /home/mehrdadpazooki/
(cd boost_1_*; ./bootstrap.sh --prefix=/home/mehrdadpazooki/libs/boost \
        --with-python=/usr/local/bin/python3.9 \
        --with-python-version=3.9 \
        --with-python-root=/usr/local/lib/python3.9 \
        --with-libraries=python;
        ./b2 -j4 install --enable-unicode=ucs4 --prefix=/home/mehrdadpazooki/libs/boost --with-python --buildid=3 --with=all)

export BOOST_HOME=/home/mehrdadpazooki/libs/boost
export BOOST_ROOT=/home/mehrdadpazooki/libs/boost
export BOOST_INCLUDE=/home/mehrdadpazooki/libs/boost/include
export BOOST_LIBDIR=/home/mehrdadpazooki/libs/boost/lib

export LD_LIBRARY_PATH=/opt/rh/devtoolset-9/root/usr/lib64:/opt/rh/devtoolset-9/root/usr/lib:/opt/rh/devtoolset-9/root/usr/lib64/dyninst:/opt/rh/devtoolset-9/root/usr/lib/dyninst:/opt/rh/devtoolset-9/root/usr/lib64:/opt/rh/devtoolset-9/root/usr/lib:/usr/local/lib/:/usr/lib64/

# might need logout login
# /home/mehrdadpazooki/.venv/bin/pip3 install --force-reinstall --ignore-installed --no-binary :all: pyhash
wget -c https://files.pythonhosted.org/packages/f0/bf/4db9bed05d10824a17697f65063de19892ca2171a31a9c6854f9bbf55c02/pyhash-0.9.3.tar.gz
tar -xvf pyhash-0.9.3.tar.gz 
(cd pyhash-0.9.3/; /home/mehrdadpazooki/.venv/bin/python3 setup.py bdist_wheel; /home/mehrdadpazooki/.venv/bin/python3 setup.py install)



