(function(){
    var fs = require('fs');
    var p = require("path");
    var hasha = require("hasha");
    //var sqlite = require('sqlite3').verbose();
    
    function mapWalkPath(path, mapFunction){
        path = path || '.';
        mapFunction = mapFunction || function(){};
        
        fs.readdir(path, function(err, items) {
            for (var i=0; i<items.length; i++) {
                var ap = p.resolve(`${path}/${items[i]}`);
                (function(ap){
                    fs.stat(ap, function(err, stats){
                        if(stats.isDirectory()){
                            console.log(ap+"/");
                            mapWalkPath(ap);
                        }else{
                            mapFunction(ap);
                        }
                    });
                })(ap);
            }
        });
    }
    
    function test(filepath, sqlpath){
        
    }
    
    mapWalkPath('.', function(ap){
        console.log(ap);
    });
})();