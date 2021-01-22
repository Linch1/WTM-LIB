import { FileWriter } from "../../files/FileWriter";
import { FileReader } from "../../files/FileReader";
import { StringComposeWriter } from "../../files/StringComposeWriter";
import { ThemeAux } from "../../ManageTheme/ThemeAux";
import { WpFunctionComposer } from "../../files/WpFunctionComposer";
import { pageTypes } from "../../Enums/entities.visual.type";
import { defaultJson, informationsJson } from "../../Types/entity.rendering.jsons";
import { replaceAllParams } from "../../Types/files.StringComposerWriter";
import { InterfaceGeneralPage } from "../../Interfaces/entity.rendering.InterfaceGeneralPage";
import { IdentifierHtml } from "../../Identifiers/IdentifierHtml";
import { addBlockParams } from "../../Types/entity.rendering.params.addBlock";

export class GeneralPageEntity implements InterfaceGeneralPage {
  public readonly ERR_NOT_VALID_HTML_BLOCK =
    "ERR: The passed Html block identified by the passed identifier_name doesn't exists in the (template/single) file";

  public PAGE_NAME: string = "";
  public PAGE_TYPE: pageTypes = pageTypes.PAGE;
  public PARENT_DIR_PATH = "";
  public DEFAULT_BUILD_PATH: string = "";
  public PAGE_PREFIX: string = "";
  public JSON_FOLDER_PATH = "";
  public JSON_FILE_PATH: string = "";

  public readonly IDENTIFIER_PLACEHOLDER_PAGE_NAME: string = "PAGE-NAME";
  public readonly IDENTIFIER_PLACEHOLDER_PAGE_TYPE: string = "PAGE-TYPE";
  public readonly IDENTIFIER_PLACEHOLDER_PAGE_HEADER: string = "PAGE-HEADER";
  public readonly IDENTIFIER_PLACEHOLDER_PAGE_FOOTER: string = "PAGE-FOOTER";

  public JSON_DEFAULT_DIR_PATH = this.themeAux.getInsideWTMPath(
    "theme-rendering"
  );
  public JSON_DEFAULT_FILE_PATH = this.themeAux.getInsideWTMPath(
    "theme-rendering",
    "default.json"
  );
  public JSON_DEFAULT_INFORMATIONS: defaultJson;

  public JSON_INFORMATIONS: informationsJson = {
    blocks: { BODY: { open: "", close: "", include: [] } },
    name: "",
  };

  constructor(public themeAux: ThemeAux) {
    this.JSON_DEFAULT_INFORMATIONS = JSON.parse(
      FileReader.readFile(this.JSON_DEFAULT_FILE_PATH)
    );
  }

  /**
   * @description create the needed file/directories
   */
  public initialize(): void {
    FileWriter.createDirectory(this.themeAux.getInsideThemePath(this.PARENT_DIR_PATH));
    FileWriter.createDirectory(this.JSON_FOLDER_PATH);
  }
  /**
   * @description delete the all the relative files
   */
  public delete(): void{
    FileWriter.removeFile(this.getPath());
    FileWriter.removeFile(this.getPathJson());
  }

  /**
   * @description save the informations of the single/template
   * - the function also **creates it if not exists**
   */
  public saveJson(): void {
    FileWriter.writeFile(
      this.getPathJson(),
      JSON.stringify(this.JSON_INFORMATIONS)
    );
  }

  /**
   * @description get the absolute path to the main file of the single/template
   */
  public getPath(): string {
    return this.themeAux.getInsideThemePath(this.PARENT_DIR_PATH, this.getFileName());
  }
  public getFileName(): string {
    return (
      this.PAGE_PREFIX +
      this.PAGE_NAME.toLocaleLowerCase().split(" ").join("-") +
      ".php"
    );
  }
  /**
   * @description get the absolute path to the json file of the single/template
   */
  public getPathJson(): string {
    return this.JSON_FILE_PATH;
  }

  

  /**
   * @description create the single/template and populate it's header/footer with the default ones
   */
  public create(): void {
    let defaultContent: string = FileReader.readFile(
      this.themeAux.getInsideThemePath(this.DEFAULT_BUILD_PATH)
    );
    let params: replaceAllParams = {};
    params[this.IDENTIFIER_PLACEHOLDER_PAGE_NAME] = this.PAGE_NAME;
    params[this.IDENTIFIER_PLACEHOLDER_PAGE_TYPE] = this.PAGE_TYPE;
    params[
      this.IDENTIFIER_PLACEHOLDER_PAGE_HEADER
    ] = this.JSON_DEFAULT_INFORMATIONS[this.PAGE_TYPE].header;
    params[
      this.IDENTIFIER_PLACEHOLDER_PAGE_FOOTER
    ] = this.JSON_DEFAULT_INFORMATIONS[this.PAGE_TYPE].footer;

    let newContent: string = defaultContent;
    newContent = StringComposeWriter.replaceAllIdentifiersPlaceholders(
      newContent,
      params
    );

    FileWriter.writeFile(this.getPath(), newContent);
    this.saveJson();
  }

  /**
   * @description include the given path in the block identified by the passed identifier_name
   * - the aviable blocks can be viewed from _this.IDENTIFIERS_HTML_BLOCKS_
   * @param identifier_name
   * @param path
   */
  public includeRelative(identifier_name: string, path: string): void {
    if (!Object.keys(this.JSON_INFORMATIONS.blocks).includes(identifier_name))
      throw new Error(this.ERR_NOT_VALID_HTML_BLOCK);
    StringComposeWriter.appendBeetweenChars(
      this.getPath(),
      WpFunctionComposer.includeRelative(path),
      IdentifierHtml.getIdentifierPairHtmlComment(identifier_name)[0],
      IdentifierHtml.getIdentifierPairHtmlComment(identifier_name)[1]
    );
    this.JSON_INFORMATIONS.blocks[identifier_name].include.push(path);
    this.saveJson();
  }

  /**
   * @description add a block in the template/single ( like the BODY block  )
   * - a block starts and ends with an _HTML comment identifier_
   * @param blockInfo.identifier_name the parent of the block the create
   * @param blockInfo.blockName the name of the block
   * @param blockInfo.open how the block start
   * @param blockInfo.close how the block end
   */
  public addBlock(blockInfo: addBlockParams): void {
    if (!Object.keys(this.JSON_INFORMATIONS.blocks).includes(blockInfo.identifier_name))
      throw new Error(this.ERR_NOT_VALID_HTML_BLOCK);
    
    if( !blockInfo.close ) blockInfo.close == "";
    if( !blockInfo.open ) blockInfo.open == "";

    let toAdd = `
${open}
${IdentifierHtml.getIdentifierPairHtmlComment(blockInfo.blockName)[0]}   
${IdentifierHtml.getIdentifierPairHtmlComment(blockInfo.blockName)[1]}
${close}
`;
    StringComposeWriter.appendBeetweenChars(
      this.getPath(),
      toAdd,
      IdentifierHtml.getIdentifierPairHtmlComment(blockInfo.identifier_name)[0],
      IdentifierHtml.getIdentifierPairHtmlComment(blockInfo.identifier_name)[1]
    );
    this.JSON_INFORMATIONS.blocks[blockInfo.identifier_name].include.push(
      IdentifierHtml.getIdentifier(blockInfo.blockName)
    );
    this.JSON_INFORMATIONS.blocks[blockInfo.blockName] = {
      open: blockInfo.open ? blockInfo.open : "",
      close: blockInfo.close ? blockInfo.close : "",
      include: [],
    };
    this.saveJson();
  }
}