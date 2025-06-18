namespace com.sap.hdm;

using {cuid} from '@sap/cds/common';

entity ApplicationSystems :cuid {
    key systemName     : String(10); // e.g. 'S4HANA', 'Ariba', 'SuccessFactors'
        systemURL: String(255); // URL of the system, e.g. 'https://s4hana.example.com', 'https://ariba.example.com', etc.}
}