#!/usr/bin/env python
#
# Library to launch Karotz App with a given configuration
#
import socket
import re
import urllib
import os
import pprint

class LauncherLibKarotz(object):
   pathToApps = '/usr/karotz/apps'
   pathToTmpDir = '/tmp/tmpapp/'
   
   def launch(self, appcode, appconfig, configlibkarotz):
       self.appcode = appcode
       self.appconfig = appconfig
       
       dirpath = self.pathToApps + '/' + appcode + '/'
       newpath = self.pathToTmpDir + '/' + appcode + '/'
       configPath = newpath + '/ALTERNATECONFIG.js'
       
       if not os.path.isdir(dirpath): 
          print 'OH NO %s' % dirpath
          raise Exception('appdirnotfound')
   
       os.system('mkdir -p %s' % self.pathToTmpDir)
       os.system('rm -fr %s' % newpath)
       os.system('cp -fr "%s" "%s"' % (dirpath, newpath))
       
       print 'Generating JS Configuration'
       confElement = configlibkarotz.extractConfigByAppCodeAndConfig(self.appcode, self.appconfig)
       
       if (confElement == None): 
           raise Exception('appconfignotfound')
       
       stringConf = configlibkarotz.formatConfigInstance(confElement)
       
       print 'Writing JS Configuration to disk'
       fd = open(configPath, "w")
       fd.write(stringConf)
       fd.close()
       
       print 'Modifying the main.js file to add the custom configuration'
       os.system('cp -f %s/main.js %s/main.js.old' % (newpath,newpath))
       os.system('echo \'include("ALTERNATECONFIG.js")\' > %s/main.js'%(newpath))
       os.system('cat %s/main.js.old >> %s/main.js'%(newpath, newpath))
       os.system('rm -f %s/main.js.old'%(newpath))
       
       print 'Launching the command line'
       stdin = '%s AAAA %s\\n\\n' % (self.appcode, self.appconfig)
       cmd = 'printf "%s"|/usr/karotz/bin/karotzVM --app_folder=/usr/karotz/apps' % stdin
       os.system(cmd)
          
