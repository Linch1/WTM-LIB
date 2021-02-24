import { identifierActions, ProjectTypes, renderTypes } from "../Enums";
import { identifiersAttributesType } from "./identifiers.attributes";

/* this keys are from the enum defined in ../Enums/manageVisual.visual.renderType.ts */
export type visualJsonIdentifiers = {
  [key in  keyof typeof renderTypes]: { [key in identifierActions] : { [key: string]: identifiersAttributesType } }
};

export type visualJsonLib = {
  scripts: string[],
  styles: string[],
  cdn: string[],
  url: string;
}

export type visualJsonScheleton = {
  name: string;
  projectPath: string;
  projectType: ProjectTypes;
  assetsAutoImport: boolean; // allow the automatical import of js/css files of the visual
  author: string;
  authorUrl: string;
  githubRepo: string;
}
export type visualJsonScheletonAsParam = {
  name: string;
  projectType?: ProjectTypes;
  projectPath?: string;
  assetsAutoImport?: boolean; // allow the automatical import of js/css files of the visual
  author?: string;
  authorUrl?: string;
  githubRepo?: string;
}

export type visualJson = {
  visual: visualJsonScheleton;
  identifiers: visualJsonIdentifiers;
  dependencies: {
    scripts: string[];
    styles: string[];
  },
  lib: {
    [key: string] : visualJsonLib
  },
  connected: {
    -readonly [ projectType in  keyof typeof ProjectTypes]?: {
      [visualName: string]: {
        path: string
      };
    }
  }
};


