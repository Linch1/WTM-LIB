import { Identifiers } from "..";
import { identifierActions, identifierToClass, identifierType, IncludeFunctions } from "../Enums";
import { renderTypes } from "../Enums/manageVisual.renderType";
import { FileReader } from "../files/FileReader";
import { FileWriter } from "../files/FileWriter";
import { identifiersAttributesType, replaceAllParams } from "../Types";
import { visualJson } from "../Types/entity.visual.jsons";
import { replaceIdentifiersParams } from "../Types/files.StringComposerWriter.replaceIdentifiers";
import { Visual } from "./Visual";

class VisualConverter {
  constructor(public visual: Visual) {}
  VISUALS_PATH = 'VISUALS-PATH'; // this is a param that will replaced whit the visuals directory path

  /**
   * @description replace all the placholders in the inside **default.##**
   * with the identifiers HTML values inside **WTM.json**.
   * then the new html obtained by this operation is wrote inside **render.##**
   */
  render(type: renderTypes) {
    if (!this.visual.isCreated())
      throw new Error(this.visual.ERR_VISUAL_NOT_CREATED);
    let html: string = FileReader.readFile(this.visual.DEFAULT_FILE_PATH);
    let json: visualJson = JSON.parse(
      FileReader.readFile(this.visual.JSON_FILE_PATH)
    );
    let newHtml: string = this.replaceAllStaticIdentifiers(
      html,
      type,
      json.identifiers[type][identifierActions.STATIC]
    );
    newHtml = this.replaceAllExecutableIdentifiers(
      newHtml,
      type,
      json.identifiers[type][identifierActions.EXECUTABLE]
    );
    FileWriter.writeFile(this.visual.RENDER_FILE_PATH, newHtml);
  }

  /**
   * @description return an html <div> that replaces the identifier in the render file
   * @param identifier the identifier
   * @param action the identifier action
   * @param type the identifier type
   * @param name the identifier name
   * @param attributes attributes of the identifier
   */
  buildIdentifierReplacer(
    identifier: string, 
    action: identifierActions, 
    type: renderTypes, 
    name: string,
    attributes: identifiersAttributesType,
    ): string{
      
      // if there is the text attributes returns it directly
      if(attributes.text) return attributes.text; 

      // else build the html div tag
      let tagClasses = `class="${attributes.parentClasses}"`
      
      let tagStart = `
      <div 
      id="${identifier}" 
      data-action="${action}" 
      data-type="${type}" 
      data-name="${name}" 
      ${ attributes.parentClasses ? tagClasses : ""}
      >`;
      tagStart = tagStart.replace(/\n/g,' '); // removes the \n chars
      tagStart = tagStart.replace(/[ \t]+/g,' '); // conver sequences of white spaces to a single white space

      let includeStatement = this.getIncludeStatement(attributes.visualTarget);
      let tagEnd = `</div>`;
      return tagStart + includeStatement + tagEnd
  }
  
  /**
   * @description returns the include statement for the passed visual path ( visualTarget )
   * @param visualTarget the path to the visual to include
   */
  getIncludeStatement(visualTarget: string | undefined){
    let includeStatement = "";
    if(visualTarget){
      let addMainFolderInIncludeStatement: boolean;
      if(visualTarget.includes(this.VISUALS_PATH)) {
        addMainFolderInIncludeStatement = false;
        let options: replaceAllParams = {}
        options[this.VISUALS_PATH] = this.visual.getVisualsPath();
        visualTarget = Identifiers.replaceAllIdentifiersPlaceholders( visualTarget, options );
      } else {
        addMainFolderInIncludeStatement = true;
      }
      includeStatement = IncludeFunctions.include(visualTarget, this.visual.getProjectType(), addMainFolderInIncludeStatement)
    }
    return includeStatement;
  }

  /**
   * @description replace all the occurences of a _STATIC_ identifier with a given word
   * @param text the text that contains the words to replace
   * @param type render type of the visual
   * @param params an object with the following structure  
   * - _{[key: string]: identifiersAttributesType}_ 
   */
  replaceAllStaticIdentifiers(
    text: string,
    type: renderTypes,
    params: replaceIdentifiersParams,
  ): string {
    Object.keys(params).forEach((placeholder) => {
      let identifierAttributes = params[placeholder];
      let identifierName: string = placeholder;
      let identifier: string = identifierToClass[type].getIdentifierWithAction(identifierName, identifierActions.STATIC, false);
      let newContent: string = "";
      newContent = this.buildIdentifierReplacer(identifier, identifierActions.STATIC, type, identifierName, identifierAttributes);
      if(!newContent.length) return;
      text = text.replace( new RegExp(`\\[${Identifiers.getIdentifier(type as unknown as identifierType)}-${identifierActions.STATIC}-${identifierName}(.*)\\]`, "g") , newContent);
    });

    return text;
  }

  /**
   * @description replace all the occurences of a _EXECUTABLE_ identifier with a predefined html tag
   * @param text the text that contains the words to replace
   * @param type render type of the visual
   * @param params an object with the following structure 
   * - _{[key: string]: identifiersAttributesType}_ 
   */
  replaceAllExecutableIdentifiers(
    text: string,
    type: renderTypes,
    params: replaceIdentifiersParams
  ): string {
    Object.keys(params).forEach((placeholder) => {
      let identifierAttributes = params[placeholder];
      let identifierName: string = placeholder;
      let identifier: string = identifierToClass[type].getIdentifierWithAction(identifierName, identifierActions.EXECUTABLE, false);
      let newContent: string = "";
      newContent = this.buildIdentifierReplacer(identifier, identifierActions.EXECUTABLE, type, identifierName, identifierAttributes);
      text = text.replace( new RegExp(`\\[${Identifiers.getIdentifier(type as unknown as identifierType)}-${identifierActions.EXECUTABLE}-${identifierName}(.*)\\]`, "g") , newContent);
    });
    return text;
  }
}

export { VisualConverter };
