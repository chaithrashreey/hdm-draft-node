const cds = require('@sap/cds');

module.exports = async(srv) => {
    const { Documents, Relations } = srv.entities;
    const db = await cds.connect.to('db');

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
            const { id } = req.params && req.params[0];
            const { documentWithLink } = req.data;
            delete documentWithLink.documentId;
            delete documentWithLink.baseType;

            const relationDraft = await SELECT.from(Relations.drafts).where({ ID: id });
            const { ID, documentId } = relationDraft[0];
            await cds.tx(req).run(async (tx) => {
                const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                const srv = hdmService.tx(tx); 

                const fields = Object.keys(documentWithLink);
                const setClause = fields.map(field => `${field} = ?`).join(', ');
                //Draft for doc  exists, create a draft and update/
                const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

                if (!docDraftExists) {
                    await srv.edit(Documents, { ID: documentId }); // activate draft
                }
                const updateQuery = `
                UPDATE com_sap_hdm_HDMService_Documents_drafts
                SET ${setClause}, modifiedAt = ?
                WHERE ID = ?
                `;

                const values = [...fields.map(f => documentWithLink[f]), new Date().toISOString(), documentId];

                await db.run(updateQuery, values);
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
                const { ID, documentId, isUnlinked: isRelationUnlinked } = relationDraftEntries[eachRelation];
                try {
                    await cds.tx(req).run(async (tx) => {
                        const hdmService = await cds.connect.to('com.sap.hdm.HDMService');
                        const srv = hdmService.tx(tx); // bind service to transaction
                        const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

                        if (docDraftExists) {
                            await srv.save(Documents.drafts, { ID: documentId }); // activate draft
                        }

                        if(isRelationUnlinked){
                            await srv.discard(Relations.drafts, { ID });
                            const deleteRelationQuery = `DELETE FROM com_sap_hdm_Relations WHERE ID = ?`;
                            await db.run(deleteRelationQuery, [ID]);     //Delete relation from active Table

                            const relationNoQuery = `SELECT COUNT(*) as count FROM com_sap_hdm_Relations WHERE documentId = ?`;
                            const result =  await db.run(relationNoQuery, [documentId]);
                            const noOfRelations = result[0]?.count || 0;
                            if(noOfRelations == 0) {
                                const deleteDocQuery = `DELETE FROM com_sap_hdm_Documents WHERE ID = ?`
                                await db.run(deleteDocQuery, [documentId]); 
                            }
                        }else {
                            await srv.save(Relations.drafts, { ID }); 
                        }
                        
                    })
                } catch(err) {
                        console.log("🚀 ~ srv.on ~ err:", err)
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
      //10.5 --> 3 Relation Draft 10.5 , doc 10.10 -->
      //Try if can have same DraftAdministrative UUID for the same Documents
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
            //Check if can i have DraftAdministrative Data entry for all the relations associated with 
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

      //Remove this
    //   srv.on("draftEditDocument", async(req) => {
    //     try {
    //         const { documentId } = req.data;
    //         await srv.edit(Documents, { ID: documentId});        
    //         return {
    //             status: 200,
    //             message: "Documents Drafts created successfully!!"
    //         }
    //     } catch(err){
    //         console.log("🚀 ~ srv.on ~ err:", err);
    //         return {
    //             status: 500,
    //             mesasge: "Error while creating linkDrafts"
    //         }
    //     }
    //   })

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
                    message: "Documents linked successfully!!"
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
                mesasge: "Error while linking Document"
            }
        }
      });

      srv.on("unlinkDocument", async(req) => {
        try {
            const { id: ID } = req.params && req.params[0];
            const updateQuery = `
            UPDATE com_sap_hdm_HDMService_Relations_drafts
            SET isUnlinked = 1
            WHERE ID = ?
            `;

            await db.run(updateQuery, [ID]);  
            return {
                status: 200,
                message: "Document Unlinked successfully!!"
            }          
        } catch (err) {
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while unlinking the Document"
            }
        }
      });

      srv.on("freezeDocument", async(req) => {
        try {
            const { id } = req.params && req.params[0];
            const relationDraft = await SELECT.from(Relations.drafts).where({ ID: id });
            const {  documentId } = relationDraft[0];
            const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

            if (!docDraftExists) {
                await srv.edit(Documents, { ID: documentId }); // activate draft
            }
            const updateQuery = `
            UPDATE com_sap_hdm_HDMService_Documents_drafts
            SET isLocked = 1
            WHERE ID = ?
            `;
            await db.run(updateQuery, [documentId]); 
            return {
                status: 200,
                message: "Document freezed successfully!!"
            } 
        } catch(err) {
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while freezing the Document"
            }
        }

      });

      srv.on("unfreezeDocument", async (req) => {
        try {
            const { id } = req.params && req.params[0];
            const relationDraft = await SELECT.from(Relations.drafts).where({ ID: id });
            const {  documentId } = relationDraft[0];
            const docDraftExists = await srv.exists(Documents.drafts, { ID: documentId });

            if (!docDraftExists) {
                await srv.edit(Documents, { ID: documentId }); // activate draft
            }
            const updateQuery = `
            UPDATE com_sap_hdm_HDMService_Documents_drafts
            SET isLocked = 0
            WHERE ID = ?
            `;

            await db.run(updateQuery, [documentId]);
            return {
                status: 200,
                message: "Document unfreezed successfully!!"
            } 
        } catch(err) {
            console.log("🚀 ~ srv.on ~ err:", err);
            return {
                status: 500,
                mesasge: "Error while unfreezing the Document"
            }
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
                hr.ID as id,
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
                do.createdAt,
                do.modifiedAt
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

 