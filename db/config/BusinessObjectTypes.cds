namespace com.sap.hdm;

using {cuid} from '@sap/cds/common';

entity BusinessObjectTypes : cuid {
    businessObjectName : String(100); // Sales Order, Purchase Order, etc.
}
