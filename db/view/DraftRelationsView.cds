//<-------View on drafts table is not possible----------->


// 💥 CAP Limitation: .drafts is NOT accessible in CDS view definitions
// Even though:

// @odata.draft.enabled is present ✅

// Relations.drafts exists ✅

// You’re importing from the core model ✅

// You’ve done cds build --clean, compile . --to json, etc ✅

// You still cannot reference Relations.drafts in a define view.

// That’s because .drafts is a CAP compiler artifact — not a standalone CDS artifact. It:

// Exists only in runtime, not as a first-class definition

// Is not accessible in CDS views (via define view ... select from)

// Is only usable in JavaScript handlers, or direct queries


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
