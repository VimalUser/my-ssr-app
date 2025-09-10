export class ClientAlbum {
  clientId: string = '';
  albumId: string = '';
  albumPics: string | null = null;
  albumSize: string | null = null;
  albumSizeId: number | null = null;
  clientName: string | null = null;
  coupleName: string | null = null;
  eventDate: Date | null = null;
  albumEventDate: Date | null = null;
  frameSize: string | null = null;
  frameSizeId: string | null = null;
  mobileNo: string | null = null;
  noOfAlbums: number | null = null;
  noOfFrames: number | null = null;
  noOfSheets: number | null = null;
  orderNumber: string | null = null;
  albumMaterialType: string | null = null;
  albumMaterialTypeId: number | null = null;
  eventType: string | null = null;
  eventTypeId: number | null = null;
  clientStatus: string | null = 'Progressing';
  accessLink: string | null = null;
  passcode: string | null = null;
  mobileNumber: string | null = null;

  constructor(init?: Partial<ClientAlbum>) {
    Object.assign(this, init);
  }
}
