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

    action draftActivate(businessObjectTypeId : String(30), businessObjectId : String(90)) returns array of RelationWithDocument;
    action draftDiscard(businessObjectTypeId : String(30), businessObjectId : String(90)) returns response;

}

type response {
    status  : Integer;
    message: String;
}