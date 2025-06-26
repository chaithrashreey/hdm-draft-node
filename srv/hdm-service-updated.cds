namespace com.sap.hdm;

using {com.sap.hdm.RelationsView} from '../db/view/RelationsView';
using {com.sap.hdm as hdm} from '../db/';



@path: 'hdm'
service HDMService {
    @readonly
    entity RelationWithDocument as projection on RelationsView;

    @odata.draft.enabled
    entity Relations              as projection on hdm.Relations;
    @odata.draft.enabled
    entity Documents                 as projection on hdm.Documents;

    action createDocumentsWithLink(documentsWithLinks : array of RelationWithDocument) returns array of RelationWithDocument;
    action updateDocumentWithLink(documentWithLink: RelationWithDocument) returns RelationWithDocument;

    action draftEditLinks(businessObjectTypeId : String(30), businessObjectId : String(90)) returns response;
    //Ideally the below action needs to be called after the above action is called.As in relations already need to be in draft mode to perform any document level operation
    action draftEditDocument(documentId: UUID) returns response;

    action linkDocument(businessObjectTypeId : String(30), businessObjectId : String(90), documentId: UUID) returns response;
    action unlinkDocument(id: UUID) returns response;

    action freezeDocument(documentId: UUID) returns response;
    action unfreezeDocument(documentId: UUID) returns response;

    action draftActivate(businessObjectTypeId : String(30), businessObjectId : String(90)) returns array of RelationWithDocument;
    action draftDiscard(businessObjectTypeId : String(30), businessObjectId : String(90)) returns response;

    action updateActivatedRelation(oldBusinessObjectId:  String(30), newBusinessObjectId:  String(30)) returns response;

}

type response {
    status  : Integer;
    message: String;
}