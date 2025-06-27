namespace com.sap.hdm;

using {com.sap.hdm.RelationsView} from '../db/view/RelationsView';
using {com.sap.hdm as hdm} from '../db/';



@path: 'hdm'
service HDMService {
    //TODO:Create a vieew combining Drafts+active entities
    //Issue: If we pass IsActiveEntity=false thee API call doesnt seem to happening, getting 404 error
    @odata.draft.enabled
    entity RelationsWithDocuments as projection on RelationsView
    
   actions {
    action updateDocumentWithLink(documentWithLink: RelationsWithDocuments) returns RelationsWithDocuments; //Check if docuemnt draft exists, and apply 

    action unlinkDocument() returns response;
    action freezeDocument() returns response;
    action unfreezeDocument() returns response;
   }

    

    action draftActivate(businessObjectTypeId : String(30), businessObjectId : String(90)) returns array of RelationsWithDocuments;
    action draftDiscard(businessObjectTypeId : String(30), businessObjectId : String(90)) returns response;
    action draftEditLinks(businessObjectTypeId : String(30), businessObjectId : String(90)) returns response;
    //Ideally the below action needs to be called after the draft Edit links action is called.As in relations already need to be in draft mode to perform any document level operation
    //But now no longer required as it is 
    action draftEditDocument() returns response;

    action createDocumentsWithLink(documentsWithLinks : array of RelationsWithDocuments) returns array of RelationsWithDocuments;
    action linkDocument(businessObjectTypeId : String(30), businessObjectId : String(90), documentId: UUID) returns response;

    action updateActivatedRelation(oldBusinessObjectId:  String(30), newBusinessObjectId:  String(30)) returns response;

    @odata.draft.enabled
    entity Relations              as projection on hdm.Relations;
    @odata.draft.enabled
    entity Documents               as projection on hdm.Documents;

}

type response {
    status  : Integer;
    message: String;
}