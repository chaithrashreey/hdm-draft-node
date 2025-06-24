namespace com.sap.hdm;

using {com.sap.hdm.BusinessObjectTypes} from './BusinessObjectTypes';
using {com.sap.hdm.DocumentTypes} from './DocumentTypes';

entity DocumentTypeBusinessObjectTypeMap {
    key documentTypeID       : String(10); // Id of the document type, e.g. 'TS', 'ED', etc.
    key businessObjectTypeID : String(10); // Sales Order, Purchase Order, etc.

        documentType         : Association to DocumentTypes
                                   on documentTypeID = documentType.ID;

        businessObjectType   : Association to BusinessObjectTypes
                                   on businessObjectTypeID = businessObjectType.ID;
}