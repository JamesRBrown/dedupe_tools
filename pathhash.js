(function(){
    var fs = require('fs');
    var p = require("path");
    var hasha = require("hasha");
    var sqlite3 = require('sqlite3').verbose();
    
    var initRun = true;
    var db = new sqlite3.Database('hash.sqlite');
    
    var processCount = 0;
    
    function mapWalkPath(path, mapFunction){
        path = path || '.';
        mapFunction = mapFunction || function(){};
        
        fs.readdir(path, function(err, items) {
            items.forEach(function(item){
                var ap = p.resolve(`${path}/${item}`);
                var pd = p.resolve(path);
                (function(ap, path, item){
                    fs.stat(ap, function(err, stats){
                        if(stats.isDirectory()){
                            //console.log(ap+"/");
                            mapWalkPath(ap, mapFunction);
                        }else{
                            //mapFunction(ap);
                            mapFunction({
                                file: ap,
                                filename: item,
                                path: path,
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
                })(ap, pd, item);
            });            
        });
    }
    
    
    function hashFile(o, mapFunction){
        /*
        (function(filepath){
            hasha.fromFile(filepath, {algorithm: 'sha256'}).then(hash => {
                console.log(`file: ${filepath}, hash: ${hash}`);
            });
        })(filepath);//*/
        o.hashAlgorithm = 'sha256';
        hasha.fromFile(o.file, {algorithm: o.hashAlgorithm}).then(hash => {
                //console.log(`file: ${o.file}, hash: ${hash}`);
                o.hash = hash;
                /*
                if(o.filename === "test"){
                    fs.link(o.file, `${o.path}/test5`);
                }//*/
                mapFunction(o);
            });
        
    }
    
    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    
    function recordFile(o){
        
        
        if(initRun){
            console.log(`${pad('count',10, ' ')} ${pad('inode', 13, ' ')} ${pad('hash', 67, ' ')} \t file`);
            initRun = false;
            (function(db){
                var columns = "";
                    columns += "file TEXT PRIMARY KEY, ";
                    columns += "filename TEXT, ";
                    columns += "path TEXT, ";
                    columns += "dev INT, ";
                    columns += "mode INT, ";
                    columns += "nlink INT, ";
                    columns += "uid INT, ";
                    columns += "gid INT, ";
                    columns += "rdev INT, ";
                    columns += "blksize INT, ";
                    columns += "inodeID INT, ";
                    columns += "size INT, ";
                    columns += "blocks INT, ";
                    columns += "atimeMs REAL, ";
                    columns += "mtimeMs REAL, ";
                    columns += "ctimeMs REAL, ";
                    columns += "birthtimeMs REAL, ";
                    columns += "atime TEXT, ";
                    columns += "mtime TEXT, ";
                    columns += "ctime TEXT, ";
                    columns += "birthtime TEXT, ";
                    columns += "hashAlgorithm TEXT, ";
                    columns += "hash TEXT ";

                var sql = `CREATE TABLE IF NOT EXISTS  files (${columns})`;
                //console.log(sql);
                db.serialize(function() {
                  db.run(sql);
                });
            })(db);
        }
        
        (function(o, db){
            var columns = "";
                columns += "file, ";
                columns += "filename, ";
                columns += "path, ";
                columns += "dev, ";
                columns += "mode, ";
                columns += "nlink, ";
                columns += "uid, ";
                columns += "gid, ";
                columns += "rdev, ";
                columns += "blksize, ";
                columns += "inodeID, ";
                columns += "size, ";
                columns += "blocks, ";
                columns += "atimeMs, ";
                columns += "mtimeMs, ";
                columns += "ctimeMs, ";
                columns += "birthtimeMs, ";
                columns += "atime, ";
                columns += "mtime, ";
                columns += "ctime, ";
                columns += "birthtime, ";
                columns += "hashAlgorithm, ";
                columns += "hash";
            var values = "";
                values += `"${o.file}", `;
                values += `"${o.filename}", `;
                values += `"${o.path}", `;
                values += `${o.dev}, `;
                values += `${o.mode}, `;
                values += `${o.nlink}, `;
                values += `${o.uid}, `;
                values += `${o.gid}, `;
                values += `${o.rdev}, `;
                values += `${o.blksize}, `;
                values += `${o.inodeID}, `;
                values += `${o.size}, `;
                values += `${o.blocks}, `;
                values += `${o.atimeMs}, `;
                values += `${o.mtimeMs}, `;
                values += `${o.ctimeMs}, `;
                values += `${o.birthtimeMs}, `;
                values += `"${o.atime}", `;
                values += `"${o.mtime}", `;
                values += `"${o.ctime}", `;
                values += `"${o.birthtime}", `;
                values += `"${o.hashAlgorithm}", `;
                values += `"${o.hash}"`;
            var sql = `INSERT OR REPLACE INTO files (${columns}) VALUES (${values})`;
            //console.log(sql);
            db.serialize(function() {
                db.run(sql);
            });
        })(o, db);
        
        processCount++;
        console.log(`${pad(processCount,10, ' ')} ${pad(o.inodeID, 13, ' ')} ${pad(o.hash, 67, ' ')} \t ${o.file}`);
        //console.log(o);
        //db.close();
    }
    
    mapWalkPath('.', function(o){
        hashFile(o, recordFile);
    });
    
    
})();