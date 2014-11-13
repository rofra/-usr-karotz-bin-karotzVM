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
from xml.dom.minidom import xml

class ConfigurationLibKarotz(object):

    # Init the main variables out of constructor
    def init(self, pathToConfigFile):
        if not os.path.isfile(pathToConfigFile):
            raise Exception('configfilenotfound')
        self.configfilepath = pathToConfigFile
   
    # Extract the list of Xml Elements relative to one appcode
    def extractConfigListByAppCode(self, appcode):
        print "Extracting config for app code %s" % appcode
        nodeList = self.extractConfigByAppCode(appcode)
        
        subNodeList = []
        for node in nodeList:
            subNodeListTmp = node.getElementsByTagName('configInstance')
            subNodeList = subNodeListTmp + subNodeList
    
        pprint.pprint(nodeList)
        print "%s config found for app %s" % (len(subNodeList), appcode)
        return subNodeList
        
    # Extract the Xml Element relative to one appcode AND appconfig
    def extractConfigByAppCodeAndConfig(self, appcode, appconfig):
        print "Extracting config for app code %s/%s" % (appcode, appconfig)
        nodeList = self.extractConfigListByAppCode(appcode)
        
        config = None
        for node in nodeList:
            if (node.getElementsByTagName('name')[0].firstChild.nodeValue == '"%s"' % appconfig): 
                return node
        return None
    
    # Extract the Xml Element with all the configurations relative to one appcode
    def extractConfigByAppCode(self, appcode):
        try:
            self.configfilepath
        except:
            raise Exception('configurationnotset')
        
        print "Parsing XML"
        dom = xml.dom.minidom.parse(self.configfilepath)
        nodeList = []
        
        print "Going throw nodes in XML"
        
        for apikeyNode in dom.getElementsByTagName('apiKey'):
            apiKeyK = apikeyNode.firstChild.nodeValue
            
            print 'APIK = %s' % apiKeyK
            if (apiKeyK == '"%s"' % appcode): 
                nodeList.append(apikeyNode.parentNode)
                
        numFound = len(nodeList)
        print "Debug: %s elements found :)" % numFound
        
        if (numFound == 0): 
            raise Exception('noconfigurationfound')
    
        return nodeList
        

    # Format the configuration the javascript way
    def formatConfigInstance(self, node):
        configName = node.getElementsByTagName('name')[0].firstChild.nodeValue
        uuid = node.getElementsByTagName('uuid')[0].firstChild.nodeValue 
        
        varList = []
        # First, extract all variables
        for paramnode in node.getElementsByTagName('params'):
            key = paramnode.getElementsByTagName('key')[0].firstChild.nodeValue
            value = paramnode.getElementsByTagName('value')[0].firstChild.nodeValue
            
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
         
            
