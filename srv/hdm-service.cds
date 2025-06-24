namespace com.sap.hdm.v1;

using {com.sap.hdm as hdm} from '../db/';

/* Approach 2: preferred
  This approach uses a projection on the HDMRelationsView, which is a view that combines HDMRelations and HDMObjects.
  The view is defined in the HDMRelationsView.cds file, which is not shown here.
  The projection includes all fields from HDMRelations and selected fields from HDMObjects.

  The HDMRelations entity is exposed as a read-only entity, allowing for querying of HDM relations.
  The actions are defined in the HDMRelations entity, which is shown below.
  The actions are bound to the HDMRelations entity, which is shown below.

*/
@path: 'hdm-old'
service HDMServiceOld {
  //entity ListAllHDMRelations as projection on hdm.RelationsView;


  
  //Operations when BO is newly created. BO itself is in draft mode Or a new Document is getting created.
  action createDocumentsWithLinks(data: createDocumentWithLinkInput) returns response; //Recieving an array of objects.
  action updateDocumentsWithLinks(data: updateDocumentWithLinkInput) returns response;
  action saveDocumentsWithLinks(businessObjectId:UUID, businessObjectType: String ) returns response;
  action discardDocumentsWithLinks(businessObjectId:UUID, businessObjectType: String) returns response;

  //Question ?? So the plugin should be somehow able to identify if a new BO being edited or an existing active BO being edited.
  //--Answer: In the ListAPI we can pass these parameters: isRelationInDraft: Boolean, isDocumentInDraft: Boolean. 
  //If both are false then the BO is a frsh copy no active
  //Operations when active BO goes into edit mode 
  // If the active BO is already in draft mode and the user comes back, then need to check isRelationsDraftEnabled and do not call the editLinks again
  action editLinks(businessObjectId:UUID, businessObjectType: String) returns response; 

  //Called when the active BO in edit mode is saved
  action saveLinks(businessObjectId:UUID, businessObjectType: String) returns response;
  action discardLinks(businessObjectId:UUID, businessObjectType: String) returns response;


  action freezeLink(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;
  action unfreezeLink(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;

  action saveFreezeLinkStatus(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;
  
  action editDocument(baseObjectId:UUID, baseObjectType: String) returns response; //Question ? So here should we be able to edit the document without editing the Business Object?
  action freezeDocument(baseObjectId:UUID, baseObjectType: String) returns response; 
  action unfreezeDocument(baseObjectId:UUID, baseObjectType: String) returns response; 
  action saveFreezeDocumentStatus(baseObjectId:UUID, baseObjectType: String);

  //Referencing to a new businessObject altogether.
  action linkDocument(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;

  //Referencing to the same businessObject.
  action unlinkDocument(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;//Question ? Should unlinking happen in draft mode as well?

 //Based on isUnlinked Boolean either we save the draft to active table or discard the draft and delete the active Relation.
  action saveLinkedDocument(businessObjectId:UUID, businessObjectType: String, baseObjectId:UUID, baseObjectType: String) returns response;


  //action saveLink(businessObjectId:UUID, businessObjectType: String) fetch all the relations for this busineessObject in draft mode and save them.
  //action saveUnlink ?
  //action saveDocument(baseObjectId) save the document data alone.

  //Question?
  //What do we mean by lock, the draft is created by user A, and only user A will be able to edit the draft, is that what we mean by lock?
}

type response {
    status  : Integer;
    message: String;
    data : {};
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