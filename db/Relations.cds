namespace com.sap.hdm;

using {cuid,managed} from '@sap/cds/common';
using {com.sap.hdm.Documents} from './Documents';


@assert.unique: {relation:[businessObjectTypeId, businessObjectId, documentId]}
@odata.draft.enabled
entity Relations : cuid, managed {
    businessObjectTypeId : String(30); //Slares Order, purchase Order, etc.
    businessObjectId     : String(90); //Sales OrderID 'SO123', Purchase Order ID, 'POC123'etc.
    //baseType     : BaseType;//F,D
    documentId           : String(36); // ID of the document, e.g. '123e4567-e89b-12d3-a456-426614174000'
    isLocked             : Boolean;
    isUnlinked           : Boolean;
    isBoActivated        :  Boolean;   
    // Association to HDMObjects
    document             : Association to Documents
                               on document.ID = documentId
}
 