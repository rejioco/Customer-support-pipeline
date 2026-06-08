import readline from "readline/promises";
import { listFile } from "../tools/listFiles.js";
import { readFiles } from "../tools/readFiles.js";


const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

console.clear();

console.log(`
╔══════════════════════════════════╗
║                                  ║
║          MY AGENT CODE           ║
║                                  ║
╚══════════════════════════════════╝
`);

while(true){
    const query = await rl.question("> ");
    if(query.startsWith("read ")){
        const filePath = query.replace("read ","");
        const content = readFiles(filePath);
        console.log(content);
        continue;
    }
    if(query === "files"){
        const files = listFile(process.cwd());
        console.log(files);
        continue;
    }
    if(query === "exit"){
        process.exit(0);
    }
    console.log(`You asked: ${query}`)
}