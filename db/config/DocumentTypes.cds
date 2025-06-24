namespace com.sap.hdm;

using {com.sap.hdm.DocumentTypeBusinessObjectTypeMap} from './DocumentTypeBusinessObjectTypeMap';

entity DocumentTypes {
    key ID                      : String(10); // Id of the document type, e.g. 'TECHSPEC', 'ACD', etc.
        name : String(255); // Localized Name of the document type, e.g. 'Technical Specification', 'Architecture Document', etc.

        businessObjectTypeMaps  : Association to many DocumentTypeBusinessObjectTypeMap
                                      on businessObjectTypeMaps.businessObjectTypeID = ID;
}
