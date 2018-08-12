(function(){
    
    var arg1 = process.argv[2];
    var arg2 = process.argv[3];
    
    if(arg1 === '-h' || arg1 === '--help'){
        var help = '';
        
        help += "\n";
        help += "getfiles is a file analysis tool\n\n";
        
        help += "It will walk a given path and record all\n";
        help += "file meta data to a specified sqlite file.\n\n";
        
        help += "The first argument is the path to walk.\n";
        help += "The second argument is the destination sqlite file.\n\n";
        
        help += "If the sqlite file doesn't exist, it will be created.\n";
        help += "Otherwise an existing sqlite file will be updated.\n\n";
        
        help += "Usage example: node getfiles.js ./ test.sqlite\n";
        
        
        console.log(help);
    }else if(arg1 && arg2){
        (function(walkpath, dbname){    
    
            var fs = require('fs');
            var p = require("path");
            var sqlite3 = require('better-sqlite3');

            var initRun = true;
            var db = new sqlite3(dbname);

            var processCount = 0;

            function mapWalkPath(path, mapFunction){
                path = path || '.';
                mapFunction = mapFunction || function(){};
                try{
                    fs.readdir(path, function(err, items) {
                        if(items){
                            items.forEach(function(item){
                                if(item && fs.existsSync(`${path}/${item}`) && !exception(item)){
                                    var ap = p.resolve(`${path}/${item}`);
                                        var pd = p.resolve(path);
                                        (function(ap, path, item){
                                            try{
                                                fs.stat(ap, function(err, stats){
                                                    if(stats && stats.isDirectory()){
                                                        //console.log(ap+"/");
                                                        mapWalkPath(ap, mapFunction);
                                                    }else if(stats){
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
                                                    //console.log(err);
                                                });
                                            }
                                            catch(err){

                                            }
                                        })(ap, pd, item);
                                }
                            });   
                        }

                        //console.log(err);
                    });
                }catch (err){
                    //console.log(err);
                }

            }

            function exception(item){
                return false;
                //return !item.match(/^[^.]/);

            }


            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }

            function recordFile(o){


                if(initRun){
                    console.log(`${pad('count',10, ' ')} ${pad('inode', 13, ' ')}    file`);
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
                            columns += "birthtime TEXT";

                        var sql = `CREATE TABLE IF NOT EXISTS  files (${columns})`;
                        //console.log(sql);
                        var stmt = db.prepare(sql);
                            stmt.run();
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
                        columns += "birthtime";
                    var values = "";
                        values += '$file, ';
                        values += '$filename, ';
                        values += '$path, ';//
                        values += '@dev, ';
                        values += '@mode, ';
                        values += '@nlink, ';
                        values += '@uid, ';
                        values += '@gid, ';
                        values += '@rdev, ';
                        values += '@blksize, ';
                        values += '@inodeID, ';
                        values += '@size, ';
                        values += '@blocks, ';
                        values += '@atimeMs, ';
                        values += '@mtimeMs, ';
                        values += '@ctimeMs, ';
                        values += '@birthtimeMs, ';
                        values += `"${o.atime}", `;
                        values += `"${o.mtime}", `;
                        values += `"${o.ctime}", `;
                        values += `"${o.birthtime}"`;

                    var sql = `INSERT OR REPLACE INTO files (${columns}) VALUES (${values})`;

                    //console.log(sql);
                    //console.log(o);
                    var stmt = db.prepare(sql);
                    //console.log(stmt);
                    stmt.run(o);

                })(o, db);

                processCount++;
                console.log(`${pad(processCount,10, ' ')} ${pad(o.inodeID, 13, ' ')}   ${o.file}`);
                //console.log(o);
                //db.close();
            }

            mapWalkPath(walkpath, function(o){
                recordFile(o);
            });

            //console.log("\n\nfinished!");
        })(arg1, arg2);
    }
    
})();

