namespace com.sap.hdm;

using {com.sap.hdm.RelationsView} from '../db/view/RelationsView';
using {com.sap.hdm as hdm} from '../db/';



@path: 'hdm'
service HDMService {
    @readonly
    entity RelationsWithDocuments as projection on RelationsView;

    @odata.draft.enabled
    entity Relations              as projection on hdm.Relations;
    @odata.draft.enabled
    entity Documents                 as projection on hdm.Documents;

    action createDocumentsWithLinks(documentsWithLinks : array of RelationsWithDocuments) returns array of RelationsWithDocuments;
}