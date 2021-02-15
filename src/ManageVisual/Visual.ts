import { AbstractGeneralVisual } from "../Abstracts/entity.visual.AbstractGeneralVisual";
import { renderTypes } from "../Enums/manageVisual.renderType";
import { VisualConverter } from "./VisualConverter";
import { VisualReader } from "./VisualReader";
import { VisualWriter } from "./VisualWriter";
import { ProjectTypes } from "../Enums";

export class Visual extends AbstractGeneralVisual {
  public reader: VisualReader;
  public writer: VisualWriter;
  public converter: VisualConverter;

  constructor(public VISUAL_FOLDER: string, projectType: ProjectTypes) {
    super(VISUAL_FOLDER, projectType);
    this.reader = new VisualReader(this);
    this.writer = new VisualWriter(this);
    this.converter = new VisualConverter(this);
  }

  /**
   * @description does the following:
   * - **edit** the default html
   * - **re-populate** the identifiers based on the new html
   * - **render** the new html
   * @param newHtml
   * @param renderType
   */
  public Vupdate(newHtml: string, renderType: renderTypes) {
    if(!this.isCreated()) throw new Error(this.ERR_VISUAL_NOT_CREATED);
    this.writer.editDefaultHtml(newHtml);
    this.writer.populateIdentifiers();
    this.converter.render(renderType);
  }
}
