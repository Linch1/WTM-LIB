import { ProjectTypes } from "../Enums";

export type defaultJson = {
  post: {
    header: string;
    footer: string;
  };
  page: {
    header: string;
    footer: string;
  };
};

/**
 * @param include an array that contains the included paths
 * @param name the name of the single/template
 * @param blocks an object that contains informations about the existing blocks
 * - `{ BLOCK_NAME : { open: "<div .. my open tag >", close: "<div ..the close tag >"}}`
 * - Ex: `{ "BODY" { open: "", close: "" }}`
 */
export type viewJson = {
  blocks: {
    [key: string]: { open: string; close: string; include: string[] };
  };
  name: string;
  projectType: ProjectTypes;
};
