(function(){
    var fs = require('fs');
    var p = require("path");
    var hasha = require("hasha");
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('test.sqlite');
    
    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS  files (path TEXT PRIMARY KEY, filename TEXT, directory TEXT, hash TEXT)");
    });

    function mapWalkPath(path, mapFunction){
        path = path || '.';
        mapFunction = mapFunction || function(){};
        
        fs.readdir(path, function(err, items) {
            for (var i=0; i<items.length; i++) {
                var ap = p.resolve(`${path}/${items[i]}`);
                (function(ap){
                    fs.stat(ap, function(err, stats){
                        if(stats.isDirectory()){
                            //console.log(ap+"/");
                            mapWalkPath(ap, mapFunction);
                        }else{
                            mapFunction(ap);
                        }
                    });
                })(ap);
            }
        });
    }
    
    
    function recordFile(filepath, db){
        (function(filepath){
            hasha.fromFile(filepath, {algorithm: 'sha256'}).then(hash => {
                console.log(`file: ${filepath}, hash: ${hash}`);
            });
        })(filepath);
    }
    
    mapWalkPath('.', function(ap){
        recordFile(ap, db);
    });
    
    db.close();
})();