
import { StringComposeWriter } from "../files/StringComposeWriter";
import { VisualWriter } from "../ManageVisual/VisualWriter";
import { VisualReader } from "../ManageVisual/VisualReader";
import { VisualConverter } from "../ManageVisual/VisualConverter";
import { renderTypes } from "../Enums/manageVisual.renderType";
import { BulkVisual } from "../ManageVisual/BulkVisual";
import { ProjectTypes } from "../Enums";
import { Visual } from "../ManageVisual/Visual";


let visualsFolder = "/home/pero/projects/WTM/LIB/visual"
let testVisual = "testVisual-php";
let visual: Visual = new Visual(visualsFolder, { name: testVisual, projectType: ProjectTypes.wordpress});
let visualWr: VisualWriter = visual.writer;
let visualRd: VisualReader = visual.reader;
let visualCv: VisualConverter= visual.converter;

let bulkVisual: BulkVisual = new BulkVisual(visualsFolder, ProjectTypes.wordpress);

let StrCompW = StringComposeWriter;

/**
 * @description class to perform tests on the lib
 */
class TestVisual {
  constructor() {}

  static log(phrase: string){
      console.log(`[ WTM-TEST ] : ${phrase}`);
  }

  static VisualCreate(){
    visualWr.createVisual();
    this.log("Created the visual");
  }
  static VisualEditHtml(){
    let html: string = 
`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
</head>

<body>
    <p>[WTM-HTML-ciaone]</p>
    <p>[WTM-HTML-COME-VA]</p>
</body>

</html>`; 
    visualWr.editDefaultHtml(html);
    this.log("Edited visual dfault.php HTML");
  }
  static visualRenderDefault(){
    visualCv.render(renderTypes.HTML);
    this.log("Rendering HTML identifiers values")
  }

  static visualPopulateIdentfiers(){
    visualWr.populateIdentifiers();
    this.log("Populated found identifiers")
  }
  static visualRead(){
    visualRd.read();
  }

  static bulkGetAllVisuals(){
    for ( let visual of bulkVisual.getAllVisuals()){
      console.log(visual.JSON_FILE_CONTENT);
    }
  }


}

export { TestVisual };
