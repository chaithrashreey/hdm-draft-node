namespace com.sap.hdm;

using {cuid,managed} from '@sap/cds/common';
using {com.sap.hdm.Relations} from './Relations';
using {com.sap.hdm.BaseType} from './type/BaseType';
using {com.sap.hdm.ContentVersions} from './ContentVersions';
using {com.sap.hdm.DocumentTypes} from './config/DocumentTypes';

@cds.autoexpose
@odata.draft.enabled
entity Documents : cuid, managed {
  baseType              : BaseType;// D for Document, F for Folder
  name                  : String(255);
  mimeType              : String(128);
  documentTypeId        : String(10); // to be linked to DocumentType config entity

  description           : String(1000);
  owner                 : String(12);
  // externalId             : String(100); // to be discussed
  size                  : Decimal(12); // size in bytes
  isLocked              : Boolean; // true/false

  //Additional fields addded
  contentStreamFileName : String(255); // Name of the content stream file, e.g. 'document.pdf'
  contentStreamURI      : String(4096); // URI to the content stream, e.g. a file in a file share or a URL to a web resource
  versionId             : String(10); // Version ID, e.g. '1.0', '2.0', etc.


  documentType          : Association to one DocumentTypes
                            on documentType.ID = documentTypeId;

  // One-to-Many Association to HDMObjectLinks
  hdmRelations          : Association to many Relations
                            on hdmRelations.documentId = ID;

  versions              : Composition of many ContentVersions
                            on  versions.documentId = ID
                            and baseType            = 'D';

}
