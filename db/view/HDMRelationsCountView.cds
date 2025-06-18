namespace com.sap.hdm;

using {com.sap.hdm.HDMRelations} from '../HDMRelations';

define view HDMObjectLinkCounts as
    select from HDMRelations {
        baseObjectType,
        baseObjectId,
        count( * ) as numberOfLinks,
    }
    group by
        baseObjectType,
        baseObjectId;
