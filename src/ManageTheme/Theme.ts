import { ConstWordpressTheme } from "../Constants/wordpress/const.wp.theme";
import { customPartType } from "../Enums/entities.wp.type";
import { functionsJsonKeys, importsJsonKeys } from "../Enums/manageTheme.jsons";
import { FileReader } from "../files/FileReader";
import { FileWriter } from "../files/FileWriter";
import { StringComposeWriter } from "../files/StringComposeWriter";
import { folderObject } from "../Types";
import { functionsJson, importsJson } from "../Types/manageTheme.jsons";

class Theme {
  public ERR_PATH_ALREADY_PRESERNT = "ERR: The given path is already required/imported"

  public themeStructure: folderObject;
  public readonly IMPORT_STYLES_FUNCTION_NAME: string = ConstWordpressTheme.FunctionAddStyle;
  public readonly IMPORT_FONTS_FUNCTION_NAME: string = ConstWordpressTheme.FunctionAddFonts;
  public readonly IMPORT_SCRIPTS_FUNCTION_NAME: string = ConstWordpressTheme.FunctionAddScripts;

  public readonly ASSETS_WP_CONFIGURATION_PATH: string = this.getPathInsideThemeFolder(
    ConstWordpressTheme.PathConfigurationDirectory
  );
  public readonly WTM_CUSTOM_PATH: string = this.getPathInsideThemeFolder(ConstWordpressTheme.jsonDirectory);
  public readonly ASSETS_IMPORT_FILE_PATH: string = this.getPathInsideThemeAssetsFolder(
    ConstWordpressTheme.importsFile
  );
  public readonly THEME_FUNCTIONS_FILE: string = this.getPathInsideThemeFolder(
    ConstWordpressTheme.functionsFile
  );
  public readonly JSON_FUNCTIONS_PATH = this.getPathInsideJsonFolder(ConstWordpressTheme.jsonFunctionsFile);
  public readonly JSON_FUNCTIONS: functionsJson;
  public readonly JSON_IMPORTS_PATH = this.getPathInsideJsonFolder(ConstWordpressTheme.jsonImportsFile);
  public readonly JSON_IMPORTS: importsJson;

  constructor(public THEME_MAIN_FOLDER: string) {
    this.themeStructure = FileReader.readFolderTree(THEME_MAIN_FOLDER);
    this.JSON_FUNCTIONS = JSON.parse(
      FileReader.readFile(this.JSON_FUNCTIONS_PATH)
    );
    this.JSON_IMPORTS = JSON.parse(FileReader.readFile(this.JSON_IMPORTS_PATH));
  }

  /**
   * @description returns the absolute path of a file/directory inside the THEME folder
   * @param path the relative path inside the THEME folder
   */
  public getPathInsideThemeFolder(...paths: string[]): string {
    let path = this.THEME_MAIN_FOLDER;
    for (let subPath of paths) {
      path = StringComposeWriter.concatenatePaths(path, subPath);
    }
    return path;
  }
  /**
   * @description returns the absolute path of a file/directory inside the ASSETS folder
   * @param path the relative path inside the ASSETS folder
   */
  public getPathInsideThemeAssetsFolder(...paths: string[]): string {
    let path = this.ASSETS_WP_CONFIGURATION_PATH;
    for (let subPath of paths) {
      path = StringComposeWriter.concatenatePaths(path, subPath);
    }
    return path;
  }
  /**
   * @description returns the absolute path of a file/directory inside the WTM folder
   * @param path the relative path inside the WTM folder
   */
  public getPathInsideJsonFolder(...paths: string[]): string {
    let path = this.WTM_CUSTOM_PATH;
    for (let subPath of paths) {
      path = StringComposeWriter.concatenatePaths(path, subPath);
    }
    return path;
  }

  /**
   * @description import in this.JSON_FUNCTIONS_PATH the given element based on the given key
   * - this object is a summmary of the content in **this.ASSETS_CUSTOM_PATH/imports.php**
   * - each key indicates a **comment identifire ( pair )**
   * @param key the key
   * @param elem the require function
   * @param index the line index ( -1 for the last )
   */
  public updateJsonFunctions(key: customPartType| functionsJsonKeys, elem: string, index: number, skipIfExists: boolean = false) {
    if(index == -1) index = this.JSON_FUNCTIONS[key].length;
    if(this.checkImportedJsonFunctions(key, elem) && !skipIfExists) throw new Error(this.ERR_PATH_ALREADY_PRESERNT);
    this.JSON_FUNCTIONS[key].splice(index, 0, elem);
    FileWriter.writeFile(this.JSON_FUNCTIONS_PATH, JSON.stringify(this.JSON_FUNCTIONS));
  }
  /**
   * @description return true if the given elem is already imported
   * @param key 
   * @param elem 
   */
  public checkImportedJsonFunctions(key: customPartType| functionsJsonKeys, elem: string): boolean{
    return this.JSON_FUNCTIONS[key].includes(elem);
  }
  /**
   * @description import in this.JSON_IMPORTS_PATH the given element based on the given key
   * - this object is a summmary of the content in **this.THEME_MAIN_FOLDER/functions.php**
   * - each key indicates a **speicifc function** where to insert the imports
   * @param key the key
   * @param elem the enqueue function
   * @param index the line index 
   */
  public updateJsonImports(key: importsJsonKeys, elem: string, index: number, skipIfExists: boolean = false) {
    if(index == -1) index = this.JSON_IMPORTS[key].length;
    if(this.checkImportedJsonImports(key, elem) && !skipIfExists) throw new Error(this.ERR_PATH_ALREADY_PRESERNT);
    this.JSON_IMPORTS[key].splice(index, 0, elem);
    FileWriter.writeFile(this.JSON_IMPORTS_PATH, JSON.stringify(this.JSON_IMPORTS));
  }
  /**
   * @description return true if the given elem is already imported
   * @param key 
   * @param elem 
   */
  public checkImportedJsonImports(key: importsJsonKeys, elem: string): boolean{
    return this.JSON_IMPORTS[key].includes(elem);
  }
}

export { Theme };
