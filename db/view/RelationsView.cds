namespace com.sap.hdm;

using {com.sap.hdm.Documents} from '../Documents';
using {com.sap.hdm.Relations} from '../Relations';
using {com.sap.hdm.RelationsCountView} from './RelationsCountView';

define view RelationsView as
    select from Relations as hr
    left join Documents as do
        on hr.documentId = do.ID
    {
            // Columns from Relations
        key hr.ID as id,
            hr.businessObjectTypeId,
            hr.businessObjectId,
            hr.documentId,
            cast(hr.isLocked as Boolean) as isRelationLocked,
            do.baseType,
            do.name,
            do.mimeType,
            do.documentTypeId,
            do.description,
            do.owner,
            do.size,
            cast(do.isLocked as Boolean) as isDocumentLocked,
            do.contentStreamFileName,
            do.contentStreamURI,
            do.versionId,

            //virtual/calculated fields
            // Count of associated HDMRelations
            cast(
                (
                    select hrcv.numberOfLinks from RelationsCountView as hrcv
                    where
                        hrcv.documentId = hr.documentId
                ) as Integer
            ) as numberOfLinks,

            // Check if the object has multiple (>1) links
            cast(
                case
                    when
                        (
                            select hrcv.numberOfLinks from RelationsCountView as hrcv
                            where
                                hrcv.documentId = hr.documentId
                        ) > 1
                    then
                        true
                    else
                        false
                end as Boolean
            ) as isMultiLinked
    };
