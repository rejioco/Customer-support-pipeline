import fs from "fs"

export const readFiles = async (filePath:string) => {
    return fs.readFileSync(filePath,"utf-8")
}