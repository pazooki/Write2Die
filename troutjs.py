import optparse
import json
import os
import shutil
from pathlib import Path
import sys


# generate empty config files
# create subapp 
#    associated files 
#    add it to json config file
# 

class Config:
    def __init__(self, path):
        self.home_path = Path(__file__).parent.resolve()
        self.config_path = Path(self.home_path).joinpath(Path(path))
        self.config =  json.load(open(self.config_path, 'r'))

    def add_subapp(self, path, name):
        self.config['subapps'][path] = name
        json.dump(self.config, open(self.config_path, 'w+'), indent=4)
        # if self.config['subapps'][path]:
        #     raise Exception('Path already exists.')
        self.add_directory(path, name)
        print(json.dumps(self.config, indent=4))
        
        
    def add_directory(self, path, name):
        if path.startswith('/'):
            path = path[1:-1]
        js_path = Path(self.home_path).joinpath('js/').joinpath(self.config.get('appName')).joinpath('subapps').joinpath(Path(path))
        html_path = Path(self.home_path).joinpath('html/').joinpath('subapps').joinpath(Path(path))
        css_path = Path(self.home_path).joinpath('css/').joinpath('subapps').joinpath(Path(path))
        
        js_path.mkdir(parents=True, exist_ok=True)
        html_path.mkdir(parents=True, exist_ok=True)
        css_path.mkdir(parents=True, exist_ok=True)
        
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.js'), js_path.joinpath(name + '.desktop.js'))
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.js'), js_path.joinpath(name + '.mobile.js'))
        
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.html'), html_path.joinpath(name + '.desktop.html'))
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.html'), html_path.joinpath(name + '.mobile.html'))
        
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.css'), css_path.joinpath(name + '.desktop.css'))
        shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.css'), css_path.joinpath(name + '.mobile.css'))

        
    def generate_subapps(self):
        for path, uname in self.config.get('subapps').items():
            if path.startswith('/'):
                path = path[1:-1]
            js_file = Path(self.home_path).joinpath('js/').joinpath(self.config.get('appName')).joinpath('subapps').joinpath(Path(path))
            if js_file.exists():
                print('Already exists.', str(js_file), uname)
            else:
                print('Creating SubApp For: .', str(js_file), uname)
                self.add_directory(path, uname)
            



if __name__ == '__main__':

    usage = "usage: %prog [options] arg1 arg2"
    parser = optparse.OptionParser(usage=usage)
    
    parser.add_option("-c", "--config-path", dest="config_path", default=None, type="string", help="config path")
    parser.add_option("-g", "--generate-subapps", dest="generate", default=False, action="store_true", help="generate from config")
    
    parser.add_option("-s", "--subapp-path", dest="subapp_path", default=None, type="string", help="subapp path")
    parser.add_option("-n", "--subapp-name", dest="subapp_name", default=None, type="string", help="subapp name")

    (options, args) = parser.parse_args()
    
    if options.config_path is not None:
        config = Config(options.config_path)
    else:
        print('Specify Config File Location First.')
        sys.exit(0)
        
    if options.generate:
        config.generate_subapps()

    if options.subapp_path is not None and options.subapp_name is not None:
        print(options.subapp_path, options.subapp_name)
        config.add_subapp(options.subapp_path, options.subapp_name)
    else:
        print('Specify subapp path and subapp name.')