"use strict";
const backup=require("../../components/backup");
let args=process.argv,file=/file=(.+)(?:\s+|$)/.exec(args.toString());
file||(console.error("No valid file passed. Use --file=<filePath> to specify a backup file"),process.exit(1));
let filePath=file.pop();backup.restoreFromFile(filePath,e=>{e&&(console.error(e),process.exit(1)),console.log(`Successfully restored backup: ${filePath}`),process.exit()});