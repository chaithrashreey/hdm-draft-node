const cds = require('@sap/cds');

module.exports = (srv) => {
    const { Documents, Relations } = srv.entities;
    srv.on("createDocumentsWithLink", async (req) => {
            const { documentsWithLinks } = req.data;
            let relationsDraftIds = [];
            //To check: If draft creation of one doc fails, does all the draft creation tranaction get reverted?
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
                } catch(err) {
                    req.error(500, "Failed to create linked drafts.");    
                }    
            }

        const draftsCreated = await fetchDocumentWithLinkDrafts(relationsDraftIds);
        return draftsCreated;
        });   

      srv.on("updateDocumentWithLink", async (req) => {
             try {
                 const { documentWithLink} = req.data;
                 const { documentId } = documentWithLink;
                 delete documentWithLink.documentId;
                 delete documentWithLink.baseType;
     
                 const relationDraft = await SELECT.from(Relations.drafts).where({ documentId });
                 const { ID } = relationDraft[0];
                 await cds.tx(req).run(async (tx) => {
                     const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                     const srv = hdmService.tx(tx); 
     
                     //Question do we need to update the updatedAt/modifiedAt timestamp for relations as well ?
                     await srv.update(Relations.drafts).set({
                         modifiedAt: new Date()
                     }).where({ 
                         ID,
                         IsActiveEntity: false,
                         'DraftAdministrativeData.InProcessByUser': req.user.id
                     });
     
                     await srv.update(Documents.drafts).set({
                         ...documentWithLink,
                         modifiedAt: new Date()
                     }).where({ 
                         ID: documentId,
                         IsActiveEntity: false,
                         'DraftAdministrativeData.InProcessByUser': req.user.id
                     });
                 });
         
                const updatedDraft = await fetchDocumentWithLinkDrafts([ID]);                 
                return updatedDraft;
             } catch(err){
                 req.error(500, "Failed to update drafts.",err);   
             }        
         });   
}

async function fetchDocumentWithLinkDrafts(relationsDraftIds) {
    try{
        const db = await cds.connect.to('db');
        const placeholders = relationsDraftIds.map(() => '?').join(',');        
        const query = `
            SELECT
                hr.ID,
                hr.businessObjectTypeId,
                hr.businessObjectId,
                hr.documentId,
                hr.isLocked AS isRelationLocked,
                do.baseType,
                do.name,
                do.mimeType,
                do.documentTypeId,
                do.description,
                do.owner,
                do.size,
                do.isLocked  AS isDocumentLocked,
                do.contentStreamFileName,
                do.contentStreamURI,
                do.versionId,
                do.createdAt
            FROM
                com_sap_hdm_HDMService_Relations_drafts AS hr
            LEFT JOIN
                com_sap_hdm_HDMService_Documents_drafts AS do
                ON hr.documentId = do.ID
            WHERE
                hr.ID IN (${placeholders}) 
            ORDER BY
                do.createdAt ASC    
            `;
        //CreatedAt seems to be exactly same for all the documents, so we cannot return the documents in same order as it was shared with us from UI
        //TODO: probably we can add a slight delay like 5-10s between creation of each draft so we can have proper order of creation   
        const result = await db.run(query, relationsDraftIds) || [];
        return result;
    }catch(err){
        console.log("Error while fetching drafts", err)        
    }
  
}

 