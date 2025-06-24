namespace com.sap.hdm;

using {com.sap.hdm.Relations} from '../Relations';

define view RelationsCountView as
    select from Relations {
        documentId,
        count( * ) as numberOfLinks,
    }
    group by documentId;
