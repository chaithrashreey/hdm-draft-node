//<-------View on drafts table is not possible----------->


// namespace com.sap.hdm;

// using {com.sap.hdm.Documents} from '../Documents';
// using {com.sap.hdm.Relations} from '../Relations';
// using {com.sap.hdm.RelationsCountView} from './RelationsCountView';

// define view DraftRelationsView as
//     select from Relations as hr
//     left join Documents as do
//         on hr.documentId = do.ID
//     {
//         key hr.ID,
//         hr.businessObjectTypeId,
//         hr.businessObjectId,
//         hr.documentId,
//         cast(hr.isLocked as Boolean) as isRelationLocked,

//         // Document columns
//         do.baseType,
//         do.name,
//         do.mimeType,
//         do.documentTypeId,
//         do.description,
//         do.owner,
//         do.size,
//         cast(do.isLocked as Boolean) as isDocumentLocked,
//         do.contentStreamFileName,
//         do.contentStreamURI,
//         do.versionId,

//         // Calculated fields
//         cast(
//             (
//                 select hrcv.numberOfLinks from RelationsCountView as hrcv
//                 where hrcv.documentId = hr.documentId
//             ) as Integer
//         ) as numberOfLinks,

//         cast(
//             case
//                 when (
//                     select hrcv.numberOfLinks from RelationsCountView as hrcv
//                     where hrcv.documentId = hr.documentId
//                 ) > 1
//                 then true
//                 else false
//             end as Boolean
//         ) as isMultiLinked
//     }
//     where hr.IsActiveEntity = false;
