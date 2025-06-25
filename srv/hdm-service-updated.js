const cds = require('@sap/cds');

module.exports = (srv) => {
    const { Documents, Relations } = srv.entities;
    srv.on("createDocumentsWithLink", async (req) => {
        const { documentsWithLinks } = req.data;
        let relationsDraftIds = [];
        //To check: If draft creation of one doc fails, does all the draft creation transaction get reverted?
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

      srv.on("draftActivate", async (req) => {
        try{
            const { businessObjectTypeId, businessObjectId} = req.data;
            const relationDraftEntries = await SELECT.from(Relations.drafts).where({ businessObjectId, businessObjectTypeId });              
            for(let eachRelation in relationDraftEntries){
                const { ID, documentId } = relationDraftEntries[eachRelation];
                try {
                    await cds.tx(req).run(async (tx) => {
                        const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                        const srv = hdmService.tx(tx); // bind service to transaction
                        const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

                        if (docDraftExists) {
                            await srv.save(Documents.drafts, { ID: documentId }); // activate draft
                        }
                        await srv.save(Relations.drafts, { ID }); 
                    })
                } catch(err) {
                        req.error(500, "Failed to save linked drafts.");    
                }         
            }   
            return {
                status  : 200,
                message : "Linked drafts saved successfully!"
            }
        } catch(err){
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while activating the drafts"
            }
        }
      });
      
      srv.on("draftDiscard", async (req) => {
          try{
            const { businessObjectTypeId, businessObjectId} = req.data;
            const relationDraftEntries = await SELECT.from(Relations.drafts).where({ businessObjectId, businessObjectTypeId });              
            for(let eachRelation in relationDraftEntries){
                const { ID, documentId } = relationDraftEntries[eachRelation];
                try {
                    //Each doc with it's relation is stored as one transaction
                    await cds.tx(req).run(async (tx) => {
                        const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                        const srv = hdmService.tx(tx); // bind service to transaction
                        const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

                        if (docDraftExists) {
                            await srv.discard(Documents.drafts, { ID: documentId }); // activate draft
                        }
                        await srv.discard(Relations.drafts, { ID }); 
                    })
                } catch(err) {
                        req.error(500, "Failed to save linked drafts.");    
                }         
            }   
            return {
                status  : 200,
                message : "Linked drafts discarded successfully!"
            }
        } catch(err){
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while discarding the drafts"
            }
        }
      });


      srv.on("draftEditLinks", async(req) => {
        try {
            const { businessObjectTypeId, businessObjectId} = req.data;
            const db = await cds.connect.to('db');
            const query = `SELECT *
                FROM com_sap_hdm_Relations
               WHERE businessObjectId = ? AND businessObjectTypeId = ?`
            const activeRelations = await db.run(query,[ businessObjectId, businessObjectTypeId]);
             await cds.tx(req).run(async (tx) => {
                const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                const srv = hdmService.tx(tx); // bind service to transaction

                 for (let i in activeRelations)  {
                    const { ID } = activeRelations[i]
                    await srv.edit(Relations, {ID});   
                } 
            })       
              
            return {
                status: 200,
                message: "Link Drafts created successfully!!"
            }
        } catch(err){
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while creating linkDrafts"
            }
        }
      })

      srv.on("draftEditDocument", async(req) => {
        try {
            const { documentId } = req.data;
            await srv.edit(Documents, { ID: documentId});        
            return {
                status: 200,
                message: "Documents Drafts created successfully!!"
            }
        } catch(err){
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while creating linkDrafts"
            }
        }
      })

      srv.on("linkDocument", async(req) => {
        try {
            const { businessObjectTypeId, businessObjectId, documentId } = req.data;
            const activeDocExists = await srv.exists(Documents, { ID: documentId });
            if(activeDocExists){
                await srv.new(Relations.drafts, {
                        documentId,
                        businessObjectTypeId,
                        businessObjectId
                    });     
                return {
                    status: 200,
                    message: "Documents Drafts created successfully!!"
                }
            }else{
                return {
                    status: 500,
                    message: "There is no active document to link!"
                }
            }          
        } catch(err){
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while creating linkDrafts"
            }
        }
      });

      srv.on("unlinkDocument", async(req) => {
        try {
            const { ID } = req.data;
                
            return {
                status: 200,
                message: "Document Unlinked successfully!!"
            }          
        } catch (err) {
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while creating linkDrafts"
            }
        }
      });

      srv.on("freezeDocument", async(req) => {
        try {
        //updateIsLocked
        } catch(err) {

        }

      });

      srv.on("unfreezeDocument", async (req) => {
        try {
        //updateIsLocked
        } catch(err) {

        }
      });

      srv.on("updateActivatedRelation", async (req) => {
        //No need to add validation on Activate draft as of now.
        try {
            //updateIsBoActivated + update businessObjectId
        } catch(err) {

        }
      })
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

 