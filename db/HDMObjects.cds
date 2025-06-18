namespace com.sap.hdm;

using {managed} from '@sap/cds/common';
using {com.sap.hdm.HDMRelations} from './HDMRelations';
using {com.sap.hdm.BaseObjectType} from './type/BaseObjectType';
using {com.sap.hdm.ContentVersions} from './ContentVersions';
using {com.sap.hdm.DocumentTypes} from './config/DocumentTypes';


@cds.autoexpose
@odata.draft.enabled
entity HDMObjects : managed {
  key baseObjectType         : BaseObjectType;
  key baseObjectId           : UUID;
      versionId              : UUID;
      revisionId             : String(3);
      documentTypeId         : String(10); // to be linked to DocumentType config entity
      objectName             : String(255);
      objectStatus           : String(2); //to be linked to Status config entity
      objectUri              : String(4096);
      physicalDocumentId     : String(32);
      mimeType               : String(128);
      objectSize             : Decimal(12); 
      //  objRefValue                  : Integer;
      //  objIsMultiRef                : String(1);
      //  objHasLtstRevsn              : String(1);
      objectState            : String(1);
      parentFolderPathValue  : String(1333);
      parentFolderId : String(100);
      //  fileShareIdentifier          : String(15);
      //  fileShareItemIdentifier      : String(64);
      extDocID               : String(100);
      //  checkedOutByUser            : String(12);
      //  originalCheckedOutTime      : Decimal(21);
      //  contentStreamBinary         : LargeBinary;

      documentType : Association to one DocumentTypes
                                 on documentType.documentTypeId = documentTypeId;

      // One-to-Many Association to HDMObjectLinks
      hdmRelations        : Association to many HDMRelations
                                 on  hdmRelations.baseObjectType = baseObjectType
                                 and hdmRelations.baseObjectId   = baseObjectId;

      // Self-composition: An object can have child objects via parentFolderId
      children : Composition of many HDMObjects
        on children.parentFolderId= baseObjectId;

      versions : Composition of many ContentVersions
        on versions.baseObjectType = baseObjectType
        and versions.baseObjectKey = baseObjectId;

}
