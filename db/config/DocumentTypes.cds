namespace com.sap.hdm;

entity DocumentTypes {
    key documentTypeId      : String(10); // Id of the document type, e.g. 'TS', 'ED', etc.
        documentTypeName : String(10); // Name of the document type, e.g. 'Technical Specification', 'Engineering Document', etc.
}
