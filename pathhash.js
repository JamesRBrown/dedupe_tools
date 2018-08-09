(function(){
    var fs = require('fs');
    var p = require("path");
    var hasha = require("hasha");
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('hash.sqlite');
    
    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS  files (path TEXT PRIMARY KEY, filesystem TEXT, inodeID int, filename TEXT, directory TEXT, hash TEXT)");
    });

    function mapWalkPath(path, mapFunction){
        path = path || '.';
        mapFunction = mapFunction || function(){};
        
        fs.readdir(path, function(err, items) {
            for (var i=0; i<items.length; i++) {
                var ap = p.resolve(`${path}/${items[i]}`);
                var pd = p.resolve(path);
                (function(ap, path, item){
                    fs.stat(ap, function(err, stats){
                        if(stats.isDirectory()){
                            //console.log(ap+"/");
                            mapWalkPath(ap, mapFunction);
                        }else{
                            //mapFunction(ap);
                            mapFunction({
                                path: path,
                                filename: item,
                                file: ap,
                                dev: stats.dev,
                                mode: stats.mode,
                                nlink: stats.nlink,
                                uid: stats.uid,
                                gid: stats.gid,
                                rdev: stats.rdev,
                                blksize: stats.blksize,
                                inodeID: stats.ino,
                                size: stats.size,
                                blocks: stats.blocks,
                                atimeMs: stats.atimeMs,
                                mtimeMs: stats.mtimeMs,
                                ctimeMs: stats.ctimeMs,
                                birthtimeMs: stats.birthtimeMs,
                                atime: stats.atime,
                                mtime: stats.mtime,
                                ctime: stats.ctime,
                                birthtime: stats.birthtime
                            });
                        }
                    });
                })(ap, pd, items[i]);
            }
        });
    }
    
    
    function recordFile(o, db){
        /*
        (function(filepath){
            hasha.fromFile(filepath, {algorithm: 'sha256'}).then(hash => {
                console.log(`file: ${filepath}, hash: ${hash}`);
            });
        })(filepath);//*/
        
        (function(o){
            hasha.fromFile(o.file, {algorithm: 'sha256'}).then(hash => {
                //console.log(`file: ${o.file}, hash: ${hash}`);
                o.hash = hash;
                console.log(o);
            });
        })(o);
        
    }
    
    mapWalkPath('.', function(ap){
        recordFile(ap, db);
    });
    
    db.close();
})();