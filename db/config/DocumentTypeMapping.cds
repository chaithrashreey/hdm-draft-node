namespace com.sap.hdm;

entity DocumentTypes {
    key documentTypeId      : String(10); // Id of the document type, e.g. 'TS', 'ED', etc.
    key  businessObjectTypeId : String(10); // Sales Order, Purchase Order, etc.
}
