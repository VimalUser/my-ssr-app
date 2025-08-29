export class ClientAlbum {
  id: string = '';
  albumPics: string | null = null;
  albumSize: string | null = null;
  clientName: string | null = null;
  dateOfEvent: Date | null = null;
  frameSize: string | null = null;
  mobileNo: string | null = null;
  noOfAlbums: number | null = null;
  noOfFrame: number | null = null;
  noOfSheets: number | null = null;
  orderNo: string | null = null;
  typeOfAlbum: string | null = null;
  typeOfEvent: string | null = null;
  status: string | null = 'Progressing';
  loginURL: string | null = null;
  loginCode: string | null = null;

  constructor(init?: Partial<ClientAlbum>) {
    Object.assign(this, init);
  }
}
