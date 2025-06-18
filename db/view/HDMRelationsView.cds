namespace com.sap.hdm;

using {com.sap.hdm.HDMObjects} from '../HDMObjects';
using {com.sap.hdm.HDMRelations} from '../HDMRelations';

define view HDMRelationsView as
    select from HDMRelations as hr
    left join HDMObjects as ho
        on  hr.baseObjectType = ho.baseObjectType
        and hr.baseObjectId   = ho.baseObjectId
    {
            // Columns from HDMRelations
        key hr.businessObjectType,
        key hr.businessObjectId,
        key hr.baseObjectType,
        key hr.baseObjectId,
            hr.status,
            // Columns from HDMObjects
            ho.revisionId,
            ho.documentTypeId,
            ho.objectName,
            ho.objectStatus,
            ho.objectUri,
            ho.mimeType,
            ho.objectSize,
            ho.objectState,
            ho.parentFolderPathValue,
            ho.parentFolderId,
            ho.extDocID,

            //virtual/calculated fields
            // Count of associated HDMRelations
            cast(
                (
                    select count( * ) from HDMRelations as L
                    where
                            L.baseObjectType = hr.baseObjectType
                        and L.baseObjectId   = hr.baseObjectId
                ) as Integer
            ) as numberOfRelations,

        // Check if the object has multiple (>1) links
        cast(
            case
                when (select count(*) from HDMRelations as L
                      where L.baseObjectType = hr.baseObjectType
                      and L.baseObjectId = hr.baseObjectId) > 1
                then true
                else false
            end as Boolean
        ) as isMultiReferenced
    };