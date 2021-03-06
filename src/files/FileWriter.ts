import * as fs from "fs";
import path from "path";
import { StringComposeWriter } from "./StringComposeWriter";
import { FileReader } from "./FileReader";

export class FileWriter {
  static ERR_EMPTY_TEXT: string = "ERR: Empty text in the body";

  /**
   * @description modify the content of a text in a file
   * @param filePath the file containing the function to edit
   * @param oldContent the old content of the function
   * @param newContent the new content of the function
   */
  static editFileFunction(
    filePath: string,
    oldContent: string,
    newContent: string
  ): void {
    /**
     * When the content is empty calling the edit function will replace "" with the text
     * that so -> the first char of the filecontent is replaced with the newContent instead of
     * adding the line to the function
     */
    let fileContent = FileReader.readFile(filePath);
    if (!oldContent.trim()) throw new Error(this.ERR_EMPTY_TEXT);
    this.writeFile(filePath, fileContent.replace(oldContent, newContent));
  }
  /**
   * @description copy the 'src' inside the 'dest' with all the subfolders
   * @param src  folder to copy 
   * @param dest  folder where to copy
   */
  static copyFolderRecursive( src: string, dest: string){
    fs.readdirSync(src).forEach(dirent => {
      const [srcPath, destPath] = [src, dest].map(dirPath => {
        FileWriter.createDirectory(dirPath);
        return path.join(dirPath, dirent);
      })
      const stat = fs.lstatSync(srcPath)
      switch (true) {
        case stat.isFile():
          fs.copyFileSync(srcPath, destPath); break
        case stat.isDirectory():
          
          FileWriter.copyFolderRecursive(srcPath, destPath); break
        case stat.isSymbolicLink():
          fs.symlinkSync(fs.readlinkSync(srcPath), destPath); break
      }
    });
  }
  /**
   * @description rename the 'oldPath' to 'newPath'
   * @param oldPath  the old name path
   * @param newPath  the new name path
   */
  static rename( oldPath: string, newPath: string ){
    fs.renameSync(oldPath, newPath);
  }

  static removeFolderRecursive(path: string): void {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file: string, index: number) => {
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.removeFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
  /**
   * @description create the direcotires that don't exists from a given path
   * @param path the path to analize for extract the directories to create
   */
  static createDirectory(path: string): void {
    let paths = path.split("/");
    let currentPath = "";
    for ( let singlePath of paths ){
      currentPath = StringComposeWriter.concatenatePaths(currentPath, singlePath);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }
    
  }

  static removeFile(path: string): void {
    fs.unlinkSync(path);
  }

  static moveFile(old_path: string, new_path: string): void {
    fs.renameSync(old_path, new_path);
  }
  static writeFile(path: string, content: string): void {
    fs.writeFileSync(path, content, "utf8");
  }
  static createFile(path: string, content: string): void {
    if (!fs.existsSync(path)) {
      this.writeFile(path, content);
    }
  }

  static appendFile(path: string, content: string): void {
    if (!FileReader.existsPath(path)) return;
    fs.appendFileSync(path, content, "utf8");
  }
}
