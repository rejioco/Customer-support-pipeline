// TO UNDERSTAND A CODEBASE 
// WE GOT TO KNOW ALL THE FILES THAT ARE AVAILABLE INSIDE THE CODEBASE

// WHY? BECAUSE OUR LLM CANNOT DIRECTLY ACCESS OUR CODEBASE
// SO WE CREATE A FUNCTION THAT GIVES US ALL THE FILES
import fs from "fs"
import path from "path"

export const listFile =  (dir:string,results:string[]=[]) => {
    // results default value is [] 
    const files = fs.readdirSync(dir) // Reads the content of the directory
    for (const file of files){
        const fullPath = path.join(dir,file) //  Ex: project dir + package.json file 
        // => /project/package.json
        const stat = fs.statSync(fullPath) // To check the status of the file
        if(stat.isDirectory()){
            // The file at fullPath is a directory
            if(file === 'node_modules' || file === '.git'){
                continue;
            }
            // Make a recursive call to the directory that is found with the 
            // path and result => result is an array of paths of files found
            listFile(fullPath,results)
        }
        else{
            // The file at fullPath is a file
            results.push(fullPath) // We push the file path if its not a directory
        }
    }
    return results;
    // 
}