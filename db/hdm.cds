
/* namespace my.bookshop;

using {
    managed,
    cuid
} from '@sap/cds/common';

//@assert.unique: { documentId: [documentId] }
@odata.draft.enabled
@cds.persistence.persistent
entity HarmonizedDocuments : cuid, managed {
  documentId: String(256) @mandatory;
  baseDocType: String(256) @mandatory;

  cmisTypeObjectID: String(256) @mandatory;
  cmisChangeToken: String(256);
  cmisCreatedBy: String(256);
  cmisCreationDate: DateTime;
  cmisLastModificationDate: DateTime;
  cmisLastModifiedBy: String(256);
  cmisName: String(256) @mandatory;
  cmisDescription: String(4500);
  cmisParentID: String(256);
  cmisContentStreamFileName: String(256);
  cmisContentStreamMimeType: String(256);
  cmisContentStreamLength: Integer64;
  cmisContentStreamHash: String(256);
  cmisVersionSeriesID: String(256);
  cmisIsLatestVersion: Boolean;
  sapOwner: String(256);
  sapParentIds: array of String;

  hdmRelations: Association to many HDMRelations on hdmRelations.harmonizedDocument = $self;
  typeObject: Association to one TypeObject on typeObject.harmonizedDocument = $self;
  typeObjectData: Association to one TypeObjectData on typeObjectData.harmonizedDocument = $self;
  versions : Composition of many DocumentVersion on versions.document = $self;

}

@odata.draft.enabled
@cds.persistence.persistent
entity HDMRelations : cuid, managed {
  uniqueObjectKey: String(256) @mandatory;
  objectType: String(32) @mandatory;
  documentId: String(256) @mandatory;
  baseDocType: String(32);
  harmonizedDocument: Association to one HarmonizedDocuments on documentId = harmonizedDocument.documentId;
}

@cds.persistence.persistent
entity TypeObject : cuid, managed {
  requiredType: Boolean default false;
  createdAt: DateTime @mandatory;
  createdBy: String(255) @mandatory;
  modifiedAt: DateTime @mandatory;
  modifiedBy: String(255) @mandatory;
  typeID: String(255) @mandatory;
  localName: String(255);
  localNamespace: String(255);
  queryName: String(255) @mandatory;
  displayName: String(255) @mandatory;
  baseID: String(255) @mandatory;
  parentID: String(255) @mandatory;
  description: String(255);
  creatable: Boolean default false;
  fileable: Boolean default false;
  queryable: Boolean default false;
  controllablePolicy: Boolean default false;
  controllableACL: Boolean default false;
  fulltextIndexed: Boolean default false;
  includedInSupertypeQuery: Boolean default false;
  typeMutabilityCreate: Boolean default false;
  typeMutabilityUpdate: Boolean default false;
  typeMutabilityDelete: Boolean default false;
  versionable: Boolean default false;
  contentStreamAllowed: String(255);
  typeProperty: Association to many TypeProperty on typeProperty.typeObject = $self;
  typeObjectData: Association to many TypeObjectData on typeObjectData.typeObject = $self;
  harmonizedDocument: Association to many HarmonizedDocuments on ID = harmonizedDocument.cmisTypeObjectID;
}

@cds.persistence.persistent
entity TypeProperty : cuid, managed {
  typeObjectID: String(255) @mandatory;
  typePropertyID: String(255) @mandatory;
  localName: String(255);
  queryName: String(255) @mandatory;
  displayName: String(255) @mandatory;
  googlePropertyName: String(255);
  localNamespace: String(255);
  description: String(255);
  propertyType: String(255) @mandatory;
  cardinality: String(255) @mandatory;
  updatability: String(255) @mandatory;
  inherited: Boolean default false;
  required: Boolean default false;
  queryable: Boolean default false;
  orderable: Boolean default false;
  openChoice: Boolean default false;
  maxLength: Integer default 255;
  precision: String(255);
  minValue: Decimal;
  maxValue: Decimal;
  resolution: String(255);
  typePropertyData: Association to many TypePropertyData on typePropertyData.typeProperty = $self;
  typeObject: Association to one TypeObject on typeObjectID = typeObject.ID;
}

@cds.persistence.persistent
entity TypeObjectData : cuid, managed {
  typeObjectID: String(255) @mandatory;
  documentId: String(255) @mandatory;
  createdAt: DateTime @mandatory;
  createdBy: String(255) @mandatory;
  modifiedAt: DateTime @mandatory;
  modifiedBy: String(255) @mandatory;
  typeObject: Association to one TypeObject on typeObjectID = typeObject.ID;
  harmonizedDocument: Association to one HarmonizedDocuments on harmonizedDocument.documentId = documentId;
  typePropertyData: Association to many TypePropertyData on typePropertyData.typeObjectData = $self;
  }

@cds.persistence.persistent
entity TypePropertyData : cuid, managed {
  typeObjectDataID: String(255) @mandatory;
  typePropertyID: String(255) @mandatory;
  propertyValue: String(255) @mandatory;
  createdAt: DateTime @mandatory;
  createdBy: String(255) @mandatory;
  modifiedAt: DateTime @mandatory;
  modifiedBy: String(255) @mandatory;
  typeObjectData: Association to one TypeObjectData on typeObjectDataID = typeObjectData.ID;
  typeProperty: Association to one TypeProperty on typePropertyID = typeProperty.ID;
}

@cds.persistence.persistent
entity DocumentVersion: cuid, managed {
  key document: Association to HarmonizedDocuments;
  key versionNumber: String(256);
  versionLabel: String(256);
  versionDescription: String(4500);
  versionCreatedBy: String(256);
  versionCreationDate: DateTime;
  versionLastModificationDate: DateTime;
  versionLastModifiedBy: String(256);
  versionIsLatestVersion: Boolean;
  versionIsMajorVersion: Boolean;
  versionChangeToken: String(256);
}
*/