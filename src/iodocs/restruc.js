var 	fs   = require('fs'),
path       = require('path'),
clone      = require('clone'),
beautify   = require('js-beautify').js_beautify;

const ERROR = {
 noError: {
  "code": 0, 
  "msg": ""
 },
 empty: {
  "code": 1, 
  "msg": "The parameter is empty"
 },
 noExists: {
  "code": 2, 
  "msg": "The path no exists"
 },
 exists: {
  "code": 3, 
  "msg": "The path already exists"
 },
 system : {
  "code": 999, 
  "msg": "System error"
 }
}

function Restruc(basedir, apisConfig) {

 var self = this;
 self.basedir = basedir;
 self.apisConfig = apisConfig;

 self.skelProject = {
  "src" : {
   "test" : {},
   "lib" : {
    "package.json": ""
   }
  }
 };
	
 self.skelApi = {
  "path": {},
  "app": {
   "main.js": ""
  },
  "test": {},
  "www": {
   "test": {},
   "app": {
    "init.js": "",
    "lang": {
     "en-us.js": ""
    },
    "resource": {},
    "screen": {
     "welcome.js": "",
     "welcome.html": ""
    },
    "ui": {}
   },
   "css": {},
   "js": {},
   "img": {},
   "index.html": ""
  }
 };
  
	
 var result = createDirectories();
 console.log("result", result)

 function createDirectories() {
  var e = ERROR.noError;
  try {
    for (var apiName in self.apisConfig) {
     self.skelProject.src[apiName] = clone(self.skelApi);
     var apiDefinition = require(__dirname + '/public/data/' + apiName + '.json');
     createServerPaths(apiDefinition, self.skelProject.src[apiName], apiName);
    }
    e = createSkel(self.basedir, self.skelProject);
    return e;
  } catch (err) {
   e = ERROR.system;
   e.err = err;
   return e;
  }
 }


 function createServerPaths(apiDefinition, skelApp, apiName) {
  skelApp[apiName + ".js"] = "";
  
  for (var i = 0; i < apiDefinition.endpoints.length; i++) {
   var endpoint = apiDefinition.endpoints[i];
   var service = formatName(endpoint.name);
   skelApp[ service + ".js"] = "";
   for (var j = 0; j < endpoint.methods.length; j++) {
    var method = endpoint.methods[j];
    if (method["hero"] && method["hero"]["handler"]) {
     if (Object.prototype.toString.call( method["hero"]["handler"] ) !== '[object Array]') {
      method["hero"]["handler"] = [method["hero"]["handler"]];
     }
     for (var k = 0; k < method["hero"]["handler"].length; k++) {
      var contents =  "/**___ DO NOT MODIFY. AUTOMATICALLY GENERATED BY RESTRUC FROM I/O Docs.\n";
      contents +=  "\n\tSynopsis\t: " + method["Synopsis"] ;
      contents +=  "\n\tMethod\t\t: " + method["HTTPMethod"];
      contents +=  "\n\tPath\t\t: " + method["URI"] + "\n";
      contents +=  "\n\tNum Params\t\t: " + method.parameters.length + "\n";
      for (var l = 0 ; l < method.parameters.length; l++) {
       var param = method.parameters[l];
       if (param.Location === "body") {
        contents +=  "\n\treq.body.";
       } else if (!param.Location || param.Location === "query") {
        contents +=  "\n\treq.query.";
       } else if (param.Location === "pathReplace") {
        contents +=  "\n\treq.params.";
       } else if (param.Location === "header") {
        contents +=  "\n\treq.readers.";
       }

       contents +=  param.Name + "\t\t\t: " + param["Description"];
       if (param["Default"]) {
        contents += " ( example: " + param["Default"] + " )";
       }
      }
      
      //contents += "\n}";
      //contents += "\n\nmodule.exports = handler;";
      contents += "\n\nEND OF AUTOMATICALLY GENERATED BY RESTRUC.___*/";
      contents = beautify(contents , {
       "indent_size": 1, 
       "indent_with_tabs": false, 
       "preserve_newlines": true
      });
      
      
      skelApp["path"][method["hero"]["handler"][k]] = {
       "type": "file",
       "overwrite": "replace",
       "contents": contents
      };
     }
    }
   }
  }
 }

 function createSkel(basePath, skel) {
  var e = ERROR.noError;

  for (var file in skel) {
   var pathFile = path.join(basePath, file);
   if (typeof skel[file] === "object" && skel[file].type !== "file") {
    e = createDir(pathFile);
    if (e !== ERROR.noError) {
     break;
    } else {
     e = createSkel(pathFile, skel[file]);
     if (e !== ERROR.noError) {
      break;
     }	
    }				
   } else {
    if (typeof skel[file] === "string") {
     createFile(pathFile, false, skel[file]);
    } else {
     createFile(pathFile, skel[file].overwrite, skel[file].contents);
    }    
   }   		
  }
  return e;
 }

 function checkPath(path) {
  if (!path) {
   return ERROR.empty;
  } else {
   if (!fs.existsSync(path)) {
    return ERROR.noExists;
   } else {
    return ERROR.exists;
   }
  }
 }

 function createDir(path) {
  var e = checkPath(path);
  if (e === ERROR.empty) {
   return e;
  } else {
   if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
   }
   return ERROR.noError;
  }
 }

 function createFile(path, overwrite, content) {
  var e = checkPath(path);
  if (e === ERROR.empty) {
   return e;
  } else {
   if (!fs.existsSync(path) || overwrite === true) {
    //fs.closeSync(fs.openSync(path, 'w'));
    fs.writeFileSync(path, content);
    return ERROR.noError;
   } else if (overwrite === "replace") {
    var oldContent = fs.readFileSync(path, 'utf8');
    var start = oldContent.indexOf(content.substr(0, 20));
    var end = oldContent.indexOf(content.substr(-20));
    if (start > -1 && end > -1) {
     end += 20;     
     var newContent = oldContent.substr(0, start) + content + oldContent.substr(end, oldContent.length) ;
     fs.writeFileSync(path, newContent);
    } else {
     fs.writeFileSync(path, content + "\n\n" + oldContent);
    }
    return ERROR.noError;
   }
  }
 }
 
 function readFile(path) {  
  if (!fs.existsSync(path)) {    
   return "";
  } else {
   fs.readFileSync(path);
  }
 }
 
 
 function formatName(name) {
  return name.replace(" ", "_").toLowerCase();
 }
}

exports.Restruc = Restruc;