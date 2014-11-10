#!/usr/bin/env python
#
# Library to manage Karotz App configuration from Single XML File
# @author Rodolphe Franceschi <rodolphe.franceschi@gmail.com>
# 
# Here is the format of the javascript generated at the end:
# ----------------------------------------------------------
# var params = {
#    config: {
#       awake: "true",
#       content: "1",
#       interruptible: "true",
#       number: "5",
#       permanentTriggerActivator: "false",
#       scheduledDateTriggerActivator: "false",
#       scheduledTriggerActivator: "false",
#       uuid: "2149cac0-a1c0-49da-a0b0-d8d5cdb0340c"
#    }
# };
# var instanceName = "config";

#
import socket
import re
import urllib
import os
import pprint
import array
import numpy as np

class ConfigurationLibKarotz(object):

    # Init the main variables out of constructor
    def init(self, pathToConfigFile):
        if not os.path.isfile(pathToConfigFile):
            raise Exception('configfilenotfound')
        
        self.configfilepath = pathToConfigFile
   
    # Extract the list of Xml Elements relative to one appcode
    def extractConfigListByAppCode(self, appcode):
        nodeList = self.extractConfigByAppCode(appcode)
        
        subNodeList = []
        for node in nodeList:
            subNodeList = node.findall('configInstance')
    
        print "%s config found for app %s" % (len(subNodeList), appcode)
        return subNodeList
        
    # Extract the Xml Element relative to one appcode AND appconfig
    def extractConfigByAppCodeAndConfig(self, appcode, appconfig):
        nodeList = self.extractConfigListByAppCode(appcode)
        
        config = None
        for node in nodeList:
            if (node.find('name').text == '"%s"' % appconfig): 
                return node
        return None
    
    # Extract the Xml Element with all the configurations relative to one appcode
    def extractConfigByAppCode(self, appcode):
        try:
            self.configfilepath
        except:
            raise Exception('configurationnotset')
            
        import xml.etree.ElementTree as ET
        tree = ET.parse(self.configfilepath)
        root = tree.getroot()
        
        nodeList = []
        for configapp in root.findall('configapp'):
            apiKeyK = configapp.find('apiKey').text
            
            if (apiKeyK == '"%s"' % appcode): 
                nodeList.append(configapp)
        
        numFound = len(nodeList)
        print "Debug: %s elements found :)" % numFound
        
        if (numFound == 0): 
            raise Exception('noconfigurationfound')
        
        return nodeList
        

    # Format the configuration the javascript way
    def formatConfigInstance(self, node):
        configName = node.find('name').text
        uuid = node.find('uuid').text
        
        varList = []
        # First, extract all variables
        for paramnode in node.findall('params'):
            key = paramnode.find('key').text
            value = paramnode.find('value').text
            
            varChain = '%s: %s' % (re.sub('"', '', key), value)
            varList.append(varChain)
        
        # Append the uuid
        varList.append('uuid: %s' % (uuid))
        
        # Concat the string the javascript way
        carListString = ", \n        ".join(varList)
        carListString = "        " + carListString
        
        cStripped = re.sub('"', '',configName)
        head = 'var params = {\n\
   %s: {\n' % (cStripped)
   
        footer = '\n\
   }\n\
};\n\
var instanceName = "%s";\n\
' % (cStripped);

        fullString = head + carListString + footer
        
        return fullString
         
            
