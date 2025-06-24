const cds = require('@sap/cds');

module.exports = (srv) => {
    const { Documents, Relations } = srv.entities;
    srv.on("createDocumentsWithLinks", async (req) => {
            const { documentsWithLinks } = req.data;
            let relationsDraftIds = [];
            for (let i in documentsWithLinks) {
                const eachDocWithLink = documentsWithLinks[i];
                const {businessObjectTypeId, businessObjectId } = eachDocWithLink;
                try {
                    delete eachDocWithLink.businessObjectId;
                    delete eachDocWithLink.businessObjectTypeId;

                    let relationDraft = {};
                    await cds.tx(req).run(async (tx) => {
                        const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                        const srv = hdmService.tx(tx); // bind service to transaction

                        const docDraftCreated = await srv.new(Documents.drafts, {
                            ...eachDocWithLink
                        });
                        const {ID: documentId} = docDraftCreated;

                        relationDraft = await srv.new(Relations.drafts, {
                            documentId,
                            businessObjectTypeId,
                            businessObjectId
                        });

                        const { ID: relationId } = relationDraft;
                        relationsDraftIds.push(relationId)
                    });
                }catch(err) {
                    req.error(500, "Failed to create linked drafts.");    
                }    
            }

        //const fetchedDrafts = await fetchCreatedDrafts(relationsDraftIds);

        //const hdmService = 
//         const { Relations } = cds.entities('com.sap.hdm');

// console.log("✔️ Relations.drafts is:", Relations.drafts); //
//         const result = await hdmService.run(
//         SELECT
//             .from('com.sap.hdm.HDMService.Relations.drafts', 'hr')
//             .columns(
//             { ref: ['hr', 'ID'], as: 'relationId' },
//             { ref: ['hr', 'documentId'] },
//             { ref: ['hr', 'businessObjectTypeId'] },
//             { ref: ['hr', 'businessObjectId'] },
//             { ref: ['hr', 'isLocked'], as: 'isRelationLocked' }
//             )
//             .where({
//             IsActiveEntity: false,
//             ID: { in: relationsDraftIds }
//             })
// );


// <---------- This Works --------------->
// const result = await cds.run(
//   SELECT
//     .from('com.sap.hdm.HDMService.Relations.drafts')
//     .columns(
//       { ref: ['documentId'], as: 'relationId'}  
//     )
//     .where({ ID: { in : relationsDraftIds} })
// );


//     console.log("🚀 ~ fetchCreatedDrafts ~ result:", result);
    const db = await cds.connect.to('db');
    const placeholders = relationsDraftIds.map(() => '?').join(',');        
     const query = `
  SELECT
    hr.ID AS relationId,
    hr.documentId,
    hr.businessObjectId,
    do.name AS documentName,
    do.mimeType,
    hr.IsActiveEntity
  FROM
    com_sap_hdm_HDMService_Relations_drafts AS hr
  LEFT JOIN
    com_sap_hdm_HDMService_Documents_drafts AS do
    ON hr.documentId = do.ID
  WHERE
    hr.ID IN (${placeholders})
`;

const result = await db.run(query, relationsDraftIds);       
    return result;
        });
}

async function fetchCreatedDrafts(relationsDraftIds) {
    try{
    const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
    const result = await hdmService.run(
    SELECT
      .from(Relations.drafts, hr)
      .columns(
        { ref: ['hr.ID'], as: 'relationId' },
        { ref: ['hr.documentId'] },
        { ref: ['hr.businessObjectTypeId'] },
        { ref: ['hr.businessObjectId'] },
        { ref: ['hr.isLocked'], as: 'isRelationLocked' }
      )
      .where({
        'hr.IsActiveEntity': false,
        'hr.ID': { in: relationsDraftIds }
      })
  );

  console.log("🚀 ~ fetchCreatedDrafts ~ result:", result);
  return result;
    }catch(err){
        console.log("🚀 ~ fetchCreatedDrafts ~ err:", err)        
    }
  
}

// module.exports = (srv) => {
//   srv.on("createDocumentsWithLinks", async (req) => {
//     const { documentsWithLinks } = req.data;
//     let relationsDraftIds = [];

//     try {
//       await cds.tx(req).run(async (tx) => {
//         const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
//         const boundService = hdmService.tx(tx);

//         for (let eachDocWithLink of documentsWithLinks) {
//           const { businessObjectTypeId, businessObjectId } = eachDocWithLink;

//           delete eachDocWithLink.businessObjectId;
//           delete eachDocWithLink.businessObjectTypeId;

//           // 💡 Use entity name string instead of entity object
//           const docDraftCreated = await boundService.new('com.sap.hdm.Documents.drafts', {
//             ...eachDocWithLink
//           });

//           const relationDraft = await boundService.new('com.sap.hdm.Relations.drafts', {
//             documentId: docDraftCreated.ID,
//             businessObjectTypeId,
//             businessObjectId
//           });

//           relationsDraftIds.push(relationDraft.ID);
//         }
//       });
//     } catch (err) {
//       console.error("💥 Error creating drafts:", err);
//       return req.error(500, "Failed to create linked drafts.");
//     }

//     // 🔁 Now fetch them
//     try {
//       const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
//       const result = await hdmService.run(
//         SELECT
//           .from('com.sap.hdm.Relations.drafts as hr')
//           .columns(
//             { ref: ['hr.ID'], as: 'relationId' },
//             { ref: ['hr.documentId'] },
//             { ref: ['hr.businessObjectTypeId'] },
//             { ref: ['hr.businessObjectId'] },
//             { ref: ['hr.isLocked'], as: 'isRelationLocked' },
//             { ref: ['do.baseType'] },
//             { ref: ['do.name'] },
//             { ref: ['do.mimeType'] },
//             { ref: ['do.documentTypeId'] },
//             { ref: ['do.description'] },
//             { ref: ['do.owner'] },
//             { ref: ['do.size'] },
//             { ref: ['do.isLocked'], as: 'isDocumentLocked' },
//             { ref: ['do.contentStreamFileName'] },
//             { ref: ['do.contentStreamURI'] },
//             { ref: ['do.versionId'] }
//           )
//           .leftJoin('com.sap.hdm.Documents.drafts as do').on('hr.documentId = do.ID')
//           .where({
//             'hr.IsActiveEntity': false,
//             'hr.ID': { in: relationsDraftIds }
//           })
//       );
//       return result;
//     } catch (e) {
//       console.error("⚠️ Drafts created, but fetching failed:", e.message);
//       return {
//         message: "Drafts created successfully, but fetching them failed.",
//         relationIds: relationsDraftIds
//       };
//     }
//   });
// };

 