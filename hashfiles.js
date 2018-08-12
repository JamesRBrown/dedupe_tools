(function(){
    
    var arg1 = process.argv[2];
    //var arg2 = process.argv[3];
    
    if(arg1 === '-h' || arg1 === '--help'){
        var help = '';
        
        help += "\n";
        help += "hashfiles is a file analysis tool\n\n";
        
        help += "It will process an sqlite file created by getfiles.\n";
        help += "hashfiles will calculate a hash for each file in the database,\n";
        help += "then it will store the results in a 'hashes' table.\n\n";
        
        help += "NOTE: \n";
        help += " - The file's inodeID is used as the primary key for the hash table.\n";
        help += " - At present this tool is configured to use sha256 as the hash algorithm.\n\n";
        
        help += "The first argument is the name of the sqlite database to process.\n\n";
                
        help += "Usage example: node hashfiles.js test.sqlite\n";
        
        
        console.log(help);
    }else if(arg1){
        (function(dbname){
            var fs = require('fs');
            var p = require("path");
            var hasha = require("hasha");
            var sqlite3 = require('better-sqlite3');

            var db = new sqlite3(dbname);


            var processCount = 0;
            var chunkSize = 100;
            var fileCount = 0;
            var position = 0;
            var chunk = [];

            function exception(item){

                return !item.match(/^[^.]/);

            }

            function hashFile(o, mapFunction){
                /*
                (function(filepath){
                    hasha.fromFile(filepath, {algorithm: 'sha256'}).then(hash => {
                        console.log(`file: ${filepath}, hash: ${hash}`);
                    });
                })(filepath);//*/
                o.hashAlgorithm = 'sha256';
                o.hash = '';
                var temp = getHash(o.inodeID);
                //*
                if(temp){
                    o.hash = temp.hash;
                    mapFunction(o);
                }else{
                    hasha.fromFile(o.file, {algorithm: o.hashAlgorithm}).then(hash => {
                        //console.log(`file: ${o.file}, hash: ${hash}`);
                        o.hash = hash;

                        mapFunction(o);
                    });//*/
                }

            }

            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }

            function getfiles(start, end){
                //select rowid, file, inodeID From files  where rowid > 5 and rowid < 10
                var sql = `select file, inodeID From files  where rowid >= ${start} and rowid <= ${end}`;
                //console.log(sql);
                var files = db.prepare(sql).all();

                return files;        
            }
            function getHash(inodeID){
                //select rowid, file, inodeID From files  where rowid > 5 and rowid < 10
                var sql = `select hash From hashes  where inodeID = ${inodeID}`;
                //console.log(sql);
                return db.prepare(sql).get();

            }

            function getFileCount(){
                //select rowid, file, inodeID From files  where rowid > 5 and rowid < 10
                var sql = 'select rowid from files order by rowid desc limit 1';
                //console.log(sql);
                var o = db.prepare(sql).get();

                return o.rowid;
            }

            function createHashTable(){
                console.log(`${pad('count',10, ' ')} ${pad('inode', 13, ' ')} ${pad('hash', 68, ' ')}     file`);

                var columns = "";
                    columns += "inodeID int PRIMARY KEY, ";
                    columns += "hashAlgorithm TEXT, ";
                    columns += "hash TEXT ";

                var sql = `CREATE TABLE IF NOT EXISTS  hashes (${columns})`;
                //console.log(sql);
                var stmt = db.prepare(sql);
                    stmt.run();

            }

            function recordHash(o, callback){
                callback = callback || function(){};

                var columns = "";
                    columns += "inodeID, ";
                    columns += "hashAlgorithm, ";
                    columns += "hash";
                var values = "";
                    values += '@inodeID, ';
                    values += '$hashAlgorithm, ';
                    values += '$hash';
                var sql = `INSERT OR REPLACE INTO hashes (${columns}) VALUES (${values})`;

                //console.log(sql);
                //console.log(o);
                var stmt = db.prepare(sql);
                //console.log(stmt);
                stmt.run(o);

                processCount++;
                console.log(`${pad(processCount,10, ' ')} ${pad(o.inodeID, 13, ' ')} ${pad(o.hash, 68, ' ')}     ${o.file}`);
                callback();
            }
            function stackFreeCall(callback){
                setTimeout(callback, 1);
            }

            function eatChunk(){
                if(chunk.length){
                    hashFile(chunk.pop(), function(o){
                        recordHash(o, stackFreeCall(eatChunk));
                    });
                }else if(position < fileCount){
                    chunk = getfiles(position, position + chunkSize);
                    position += chunkSize;
                    stackFreeCall(eatChunk);
                }else{
                    console.log("Done!");
                }
            }

            function main(){
                createHashTable();
                chunkSize = 100;
                fileCount = getFileCount();
                eatChunk();
            }

            main();


        })(arg1);
    }
    
})();



