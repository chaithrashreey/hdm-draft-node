namespace com.sap.hdm;

using {com.sap.hdm as hdm} from '../db/';

/* Approach 2: preferred
  This approach uses a projection on the HDMRelationsView, which is a view that combines HDMRelations and HDMObjects.
  The view is defined in the HDMRelationsView.cds file, which is not shown here.
  The projection includes all fields from HDMRelations and selected fields from HDMObjects.

  The HDMRelations entity is exposed as a read-only entity, allowing for querying of HDM relations.
  The actions are defined in the HDMRelations entity, which is shown below.
  The actions are bound to the HDMRelations entity, which is shown below.

*/

@path: 'hdm'
service HDMService {
  entity ListAllHDMRelations as projection on hdm.HDMRelationsView;

  
  entity HDMRelations     as projection on hdm.HDMRelations;
  entity HDMObjects as projection on hdm.HDMObjects;
  
  action createDocumentWithLink(data: createDocumentWithLinkInput) returns response;
  action updateDocumentWithLink(data: updateDocumentWithLinkInput) returns response;
  action saveDocumentWithLink(businessObjectId:UUID, businessObjectType: String ) returns response;
  action discardDocumentWithLink(businessObjectId:UUID, businessObjectType: String) returns response;
  action editLink(businessObjectId:UUID, businessObjectType: String) returns response;
  action editLinkWithDocument(businessObjectId:UUID, businessObjectType: String) returns response;
  action linkDocument(usinessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String);
}

type response {
    status  : Integer;
    message : {};
}

type createDocumentWithLinkInput {
  baseObjectType        : String;
  baseObjectId          : UUID;
  businessObjectType    :String;
  businessObjectId      :UUID; 
  versionId             : UUID;
  revisionId            : String(3);
  documentTypeId        : String(10);
  objectName            : String(255);
  objectStatus          : String(2);
  objectUri             : String(4096);
  physicalDocumentId    : String(32);
  mimeType              : String(128);
  objectSize            : Decimal(12); 
  objectState           : String(1);
  parentFolderPathValue : String(1333);
  parentFolderId        : String(100);
  extDocID              : String(100);
}

type updateDocumentWithLinkInput {
  baseObjectId          : UUID;
  baseObjectType        : String;
  versionId             : UUID;
  revisionId            : String(3);
  documentTypeId        : String(10);
  objectName            : String(255);
  objectStatus          : String(2);
  objectUri             : String(4096);
  physicalDocumentId    : String(32);
  mimeType              : String(128);
  objectSize            : Decimal(12); 
  objectState           : String(1);
  parentFolderPathValue : String(1333);
  parentFolderId        : String(100);
  extDocID              : String(100);
}