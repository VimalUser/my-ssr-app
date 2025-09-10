import { AlbumSelectionItem } from "./album-selection-item.model";

export interface clientData {
  status: string;
  coupleName: string;
  albumDate: string;
  tranditionalAlbumSelection: AlbumSelectionItem[];
  candidAlbumSelection: AlbumSelectionItem[]; // If same structure, else type accordingly
  frameSelection: AlbumSelectionItem[]; // Define proper type if possible
  coverSelection: AlbumSelectionItem[]; // Define proper type if possible
}
