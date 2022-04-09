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

    def update_config_file(self):
        json.dump(self.config, open(self.config_path, 'w+'), indent=4)


    def add_subapp(self, path, filename):
        if path in self.config['subApps'].keys():
            raise Exception('Path already exists.')
        self.config['subApps'][path] = {'filename': filename}
        self.update_config_file()
        self.add_directory_n_files(path, filename)
        print('Created files and dir path for new SubApp:', [path, filename])
        print(json.dumps(self.config, indent=4))
        
    
    def remove_subapp(self, path, filename):
        if path not in self.config['subApps'].keys():
            raise Exception('There is no such a subapp. Failed to delete subapp: ', path, filename)
        else:
            del self.config['subApps'][path]
            self.update_config_file()
        if path.startswith('/'):
            path = path[1:-1]
            
        js_path = Path(self.home_path).joinpath(Path('js/')).joinpath(Path(self.config['settings'].get('appName'))).joinpath(Path('subapps')).joinpath(Path(path))
        html_path = Path(self.home_path).joinpath('html/').joinpath('subapps').joinpath(Path(path))
        css_path = Path(self.home_path).joinpath('css/').joinpath('subapps').joinpath(Path(path))
        try:
            os.remove(js_path.joinpath(Path(filename + '.desktop.js')))
        except Exception as ex:
            print(ex)
        try:
            os.remove(js_path.joinpath(Path(filename + '.mobile.js')))
        except Exception as ex:
            print(ex)
        try:
            os.remove(html_path.joinpath(Path(filename + '.desktop.html')))
        except Exception as ex:
            print(ex)
        try:
            os.remove(html_path.joinpath(Path(filename + '.mobile.html')))
        except Exception as ex:
            print(ex)
        try:
            os.remove(css_path.joinpath(Path(filename + '.desktop.css')))
        except Exception as ex:
            print(ex)
        try:
            os.remove(css_path.joinpath(Path(filename + '.mobile.css')))
        except Exception as ex:
            print(ex)
            
    def add_directory_n_files(self, path, filename):
        if path.startswith('/'):
            path = path[1:-1]
        js_path = Path(self.home_path).joinpath(Path('js/')).joinpath(Path(self.config['settings'].get('appName'))).joinpath(Path('subapps')).joinpath(Path(path))
        html_path = Path(self.home_path).joinpath('html/').joinpath('subapps').joinpath(Path(path))
        css_path = Path(self.home_path).joinpath('css/').joinpath('subapps').joinpath(Path(path))
        
        if not js_path.exists():
            js_path.mkdir(parents=True, exist_ok=True)
        else:
            print('JS directory already exists', js_path)
            
        if not html_path.exists():
            html_path.mkdir(parents=True, exist_ok=True)
        else:
            print('HTML directory already exists', html_path)
        
        if not css_path.exists():
            css_path.mkdir(parents=True, exist_ok=True)
        else:
            print('CSS directory already exists', css_path)
        
        print('Created Script: ', js_path)
        print('Created HTML File: ', html_path)
        print('Created CSS File: ', css_path)
        
        if not js_path.joinpath(filename + '.desktop.js').exists():
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.js'), js_path.joinpath(filename + '.desktop.js'))
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.js'), js_path.joinpath(filename + '.mobile.js'))
        
        if not html_path.joinpath(filename + '.desktop.html').exists():
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.html'), html_path.joinpath(filename + '.desktop.html'))
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.html'), html_path.joinpath(filename + '.mobile.html'))
            with open(html_path.joinpath(filename + '.desktop.html'), 'w') as html_f:
                html_f.write('<h3>You Successfully Created Sub App: </h3>\n')
                html_f.write('</br></br>\n')
                html_f.write(' <h2>Sub App Path: <u>' + path + '</u></h2></br>\n')
                html_f.write(' <h2>File Name: <u>' + filename + '</u></h2></br>\n')
                
                html_f.write('<small>Here are the files associated with subapp: </small>\n')
                html_f.write('</br></br>\n')
                html_f.write('<ul>\n');

                html_f.write('<li>\n');
                html_f.write(str(js_path.joinpath(filename + '.desktop.js\n'))),
                html_f.write('</li>\n');
                
                html_f.write('<li>\n');
                html_f.write(str(js_path.joinpath(filename + '.mobile.js\n\n'))),
                html_f.write('</li>\n');
                
                html_f.write('<li>\n');
                html_f.write(str(html_path.joinpath(filename + '.desktop.html\n'))),
                html_f.write('</li>\n');
                
                html_f.write('<li>\n');
                html_f.write(str(html_path.joinpath(filename + '.mobile.html\n\n'))),
                html_f.write('</li>\n');
                
                html_f.write('<li>\n');
                html_f.write(str(css_path.joinpath(filename + '.desktop.css\n'))),
                html_f.write('</li>\n');
                
                html_f.write('<li>\n');
                html_f.write(str(css_path.joinpath(filename + '.mobile.css\n')))
                html_f.write('</li>\n');

                html_f.write('</ul>\n');
        
        if not css_path.joinpath(filename + '.desktop.css').exists():
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.desktop.css'), css_path.joinpath(filename + '.desktop.css'))
            shutil.copy(Path(self.home_path).joinpath('meta/template.subapp.mobile.css'), css_path.joinpath(filename + '.mobile.css'))

        
    def generate_subapps(self):
        for path, resource in self.config.get('subApps').items():
            if path.startswith('/'):
                path = path[1:-1]
        
            js_file = Path(self.home_path).joinpath(Path('js/')).joinpath(Path(self.config['settings'].get('appName'))).joinpath(Path('subapps')).joinpath(Path(path))
            css_file = Path(self.home_path).joinpath('css/').joinpath('subapps/').joinpath(Path(path))
            html_file = Path(self.home_path).joinpath('html/').joinpath('subapps/').joinpath(Path(path))
            
            # if js_file.exists() or css_file.exists() or html_file.exists():
            #     print(path, resource['filename'])
            #     print('Already exists.', [str(js_file),], resource['filename'])
            #     print('Already exists.', [str(html_file),], resource['filename'])
            #     print('Already exists.', [str(css_file),], resource['filename'])
            #     print('+'*100)
            # else:
            print('Creating SubApp For: .', path, resource, [str(js_file), str(html_file), str(css_file)], resource)
            self.add_directory_n_files(path, resource['filename'])
            print('+'*100)
            



if __name__ == '__main__':

    usage = "usage: %prog [options] arg1 arg2"
    parser = optparse.OptionParser(usage=usage)
    
    parser.add_option("-c", "--config-path", dest="config_path", default=None, type="string", help="config path")
    parser.add_option("-g", "--generate-subapps", dest="generate", default=False, action="store_true", help="generate from config")
    
    parser.add_option("-a", "--add", dest="add_subapp", default=False, action="store_true", help="Add subapp config and files")
    parser.add_option("-e", "--remove", dest="remove_subapp", default=False, action="store_true", help="Remove subapp config and files")
    
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
        if options.add_subapp:
            config.add_subapp(options.subapp_path, options.subapp_name)
        elif options.remove_subapp:
            config.remove_subapp(options.subapp_path, options.subapp_name)
    else:
        print('Specify subapp path and subapp name.')